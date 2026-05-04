import { getAuthClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/services/rateLimitService';
import { withRetry } from '@/lib/retry';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Groq from 'groq-sdk';
import { z } from 'zod';

export const maxDuration = 30;
export const runtime = 'nodejs';

// Re-use a single Groq client (not instantiated on every request)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = 'llama-3.3-70b-versatile';

// ── Input validation ────────────────────────────────────────────────────────

const requestSchema = z.object({
    biomarkers: z.array(z.object({
        name: z.string().min(1).max(200),
        value: z.union([z.number(), z.string()])
            .transform(v => Number(v))
            .refine(n => !Number.isNaN(n), { message: 'value must be numeric' }),
        unit: z.string().max(50),
        status: z.enum(['optimal', 'warning', 'critical']),
        reference_range_min: z.number().nullable().optional(),
        reference_range_max: z.number().nullable().optional(),
    })).optional().default([]),
});

// Type guard for cached doctor questions stored in raw_ai_json
function parseCachedQuestions(
    rawAiJson: unknown,
    cacheKey: string
): { question: string; context: string }[] | null {
    if (
        rawAiJson === null ||
        typeof rawAiJson !== 'object' ||
        Array.isArray(rawAiJson)
    ) return null;

    const json = rawAiJson as Record<string, unknown>;
    if (json.cached_doctor_questions_key !== cacheKey) return null;
    const cached = json.cached_doctor_questions;
    if (!Array.isArray(cached) || cached.length === 0) return null;

    // Validate each entry has the expected shape
    const validated = cached.filter(
        (q): q is { question: string; context: string } =>
            typeof q === 'object' &&
            q !== null &&
            typeof (q as Record<string, unknown>).question === 'string' &&
            typeof (q as Record<string, unknown>).context === 'string'
    );
    return validated.length > 0 ? validated : null;
}

type BiomarkerInput = z.infer<typeof requestSchema>['biomarkers'][number];

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    // 1. IP-level rate limit
    const rateLimitResult = await checkRateLimit();
    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: rateLimitResult.message || 'Too many requests' },
            { status: 429, headers: { 'Retry-After': (rateLimitResult.retryAfter || 60).toString() } }
        );
    }

    // 2. Auth — use shared helper (fix #13)
    const supabase = await getAuthClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Parse & validate body
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }

    const parseResult = requestSchema.safeParse(body);
    if (!parseResult.success) {
        return NextResponse.json(
            { error: parseResult.error.issues[0]?.message || 'Invalid input' },
            { status: 400 }
        );
    }

    const { biomarkers } = parseResult.data;

    if (biomarkers.length === 0) {
        return NextResponse.json({ questions: [] });
    }

    try {
        // 4. Only generate questions for flagged biomarkers
        const criticalBiomarkers = biomarkers.filter(
            (b: BiomarkerInput) => b.status === 'critical' || b.status === 'warning'
        );

        if (criticalBiomarkers.length === 0) {
            return NextResponse.json({
                questions: [{
                    question: 'How can I maintain my current healthy biomarker levels?',
                    context: 'All your biomarkers are currently in the optimal range.',
                }],
            });
        }

        // 5. Cache key is based on the exact flagged values shown to the user.
        const cacheKey = `questions_${criticalBiomarkers
            .sort((a: BiomarkerInput, b: BiomarkerInput) => a.name.localeCompare(b.name))
            .map((b: BiomarkerInput) => `${b.name.toLowerCase()}:${b.status}:${parseFloat(String(b.value)).toFixed(1)}`)
            .join('|')}`;

        // 6. Check local cache on the latest report, but only if it matches the current biomarker set.
        const { data: latestReport } = await supabase
            .from('lab_results')
            .select('id, raw_ai_json')
            .eq('user_id', user.id)
            .order('uploaded_at', { ascending: false })
            .limit(1)
            .single();

        const cachedLocal = parseCachedQuestions(latestReport?.raw_ai_json, cacheKey);
        if (cachedLocal) {
            return NextResponse.json({ questions: cachedLocal, cached: true });
        }

        // 7. Global AI response cache (keyed on name + status + value, cross-user)
        if (supabaseAdmin) {
            const { data: globalCache } = await supabaseAdmin
                .from('global_ai_cache')
                .select('response_json, usage_count')
                .eq('cache_key', cacheKey)
                .single();

            if (globalCache) {
                // Bump usage count asynchronously — don't block the response
                supabaseAdmin.from('global_ai_cache')
                    .update({ usage_count: ((globalCache.usage_count as number) || 0) + 1, updated_at: new Date().toISOString() })
                    .eq('cache_key', cacheKey)
                    .then(() => { /* fire-and-forget */ });

                return NextResponse.json({ questions: globalCache.response_json, cached: 'global' });
            }
        }

        // 8. Generate questions via Groq (with retry)
        // Fix #8: Use a JSON object wrapper so response_format: json_object is valid.
        // The prompt asks for { "questions": [...] } and we unwrap below.
        const questionsPrompt = `Based on these specific lab results that need attention:
${criticalBiomarkers.map((b: BiomarkerInput) =>
    `${b.name}: ${b.value} ${b.unit} (status: ${b.status}${
        b.reference_range_min != null && b.reference_range_max != null
            ? `, normal range: ${b.reference_range_min}–${b.reference_range_max} ${b.unit}`
            : ''
    })`
).join('\n')}

Generate 3-5 specific questions this person should ask their doctor at their next appointment.
For each question, reference the actual numeric value. Provide a brief "Why ask this" context.

Return a JSON object with a "questions" key containing an array:
{
  "questions": [
    {
      "question": "The question with the specific value mentioned",
      "context": "Why this question matters based on the specific results"
    }
  ]
}`;

        const completion = await withRetry(
            () => groq.chat.completions.create({
                messages: [{ role: 'user', content: questionsPrompt }],
                model: MODEL,
                temperature: 0.1,
                response_format: { type: 'json_object' },
                max_tokens: 700,
            }),
            { maxAttempts: 3, initialDelayMs: 600 }
        );

        // 9. Parse AI response — always expect { questions: [...] } now (fix #8)
        const questionsSchema = z.object({
            questions: z.array(z.object({
                question: z.string(),
                context: z.string(),
            })).min(1),
        });

        let questions: { question: string; context: string }[] = [];
        try {
            const content = completion.choices[0].message.content || '{}';
            const parsed = JSON.parse(content);
            const validated = questionsSchema.safeParse(parsed);
            if (validated.success) {
                questions = validated.data.questions;
            } else {
                // Fallback: try bare array for backward-compat
                if (Array.isArray(parsed)) {
                    questions = parsed.filter(
                        (q): q is { question: string; context: string } =>
                            typeof q?.question === 'string' && typeof q?.context === 'string'
                    );
                }
                if (questions.length === 0) throw new Error('No valid questions in response');
            }
        } catch (e) {
            logger.error('[generate-questions] Failed to parse AI JSON response', e);
            questions = [{
                question: 'Could not generate structured questions. Please ask your doctor about your flagged biomarkers.',
                context: 'There was an error processing the detailed questions.',
            }];
        }

        // 10. Write to both local and global cache (non-blocking)
        if (questions.length > 0) {
            if (latestReport) {
                const updatedAiJson = {
                    ...(typeof latestReport.raw_ai_json === 'object' && latestReport.raw_ai_json !== null
                        ? latestReport.raw_ai_json as Record<string, unknown>
                        : {}),
                    cached_doctor_questions: questions,
                    cached_doctor_questions_key: cacheKey,
                };
                supabase.from('lab_results')
                    .update({ raw_ai_json: updatedAiJson })
                    .eq('id', latestReport.id)
                    .then(() => { /* fire-and-forget */ });
            }

            // Fix #1: null-guard supabaseAdmin before writing global cache
            if (supabaseAdmin) {
                supabaseAdmin.from('global_ai_cache').upsert({
                    cache_key: cacheKey,
                    response_json: questions,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'cache_key' }).then(() => { /* fire-and-forget */ });
            }
        }

        return NextResponse.json({ questions, cached: false });

    } catch (error: unknown) {
        logger.error('[generate-questions] Unexpected error', error);
        return NextResponse.json({ error: 'Failed to generate questions. Please try again.' }, { status: 500 });
    }
}
