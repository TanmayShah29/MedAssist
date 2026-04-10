import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/services/rateLimitService';
import { withRetry } from '@/lib/retry';
import { logger } from '@/lib/logger';
import Groq from "groq-sdk";
import { z } from 'zod';

export const maxDuration = 30;
export const runtime = 'nodejs';

// Re-use a single Groq client (not instantiated on every request)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = "llama-3.3-70b-versatile";

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

    // 2. Auth
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch { /* ignored in read-only contexts */ }
                },
            },
        }
    );

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
        // 4. Check local cache (latest report's cached questions)
        const { data: latestReport } = await supabase
            .from('lab_results')
            .select('id, raw_ai_json')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (latestReport?.raw_ai_json?.cached_doctor_questions) {
            return NextResponse.json({
                questions: latestReport.raw_ai_json.cached_doctor_questions,
                cached: true,
            });
        }

        // 5. Only generate questions for flagged biomarkers
        const criticalBiomarkers = biomarkers.filter(
            (b: BiomarkerInput) => b.status === 'critical' || b.status === 'warning'
        );

        if (criticalBiomarkers.length === 0) {
            return NextResponse.json({
                questions: [{
                    question: "How can I maintain my current healthy biomarker levels?",
                    context: "All your biomarkers are currently in the optimal range.",
                }],
            });
        }

        // 6. Global AI response cache (keyed on name + status + value, cross-user)
        const cacheKey = `questions_${criticalBiomarkers
            .sort((a: BiomarkerInput, b: BiomarkerInput) => a.name.localeCompare(b.name))
            .map((b: BiomarkerInput) => `${b.name.toLowerCase()}:${b.status}:${parseFloat(String(b.value)).toFixed(1)}`)
            .join('|')}`;

        const { data: globalCache } = await supabase
            .from('global_ai_cache')
            .select('response_json, usage_count')
            .eq('cache_key', cacheKey)
            .single();

        if (globalCache) {
            // Bump usage count asynchronously — don't await, don't block the response
            supabase.from('global_ai_cache')
                .update({ usage_count: ((globalCache.usage_count as number) || 0) + 1, updated_at: new Date().toISOString() })
                .eq('cache_key', cacheKey)
                .then(() => { /* fire-and-forget */ });

            return NextResponse.json({ questions: globalCache.response_json, cached: 'global' });
        }

        // 7. Generate questions via Groq (with retry)
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

Return EXCLUSIVELY a JSON array — no preamble, no explanation:
[
  {
    "question": "The question with the specific value mentioned",
    "context": "Why this question matters based on the specific results"
  }
]`;

        const completion = await withRetry(
            () => groq.chat.completions.create({
                messages: [{ role: "user", content: questionsPrompt }],
                model: MODEL,
                temperature: 0.1,
                response_format: { type: "json_object" },
                max_tokens: 700,
            }),
            { maxAttempts: 3, initialDelayMs: 600 }
        );

        // 8. Parse AI response
        let questions: { question: string; context: string }[] = [];
        try {
            const content = completion.choices[0].message.content || "[]";
            const parsed = JSON.parse(content);
            questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);
        } catch (e) {
            logger.error('[generate-questions] Failed to parse AI JSON response', e);
            questions = [{
                question: "Could not generate structured questions. Please ask your doctor about your flagged biomarkers.",
                context: "There was an error processing the detailed questions.",
            }];
        }

        // 9. Write to both local and global cache (non-blocking)
        if (questions.length > 0) {
            if (latestReport) {
                const updatedAiJson = { ...latestReport.raw_ai_json, cached_doctor_questions: questions };
                supabase.from('lab_results')
                    .update({ raw_ai_json: updatedAiJson })
                    .eq('id', latestReport.id)
                    .then(() => { /* fire-and-forget */ });
            }

            supabase.from('global_ai_cache').upsert({
                cache_key: cacheKey,
                response_json: questions,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'cache_key' }).then(() => { /* fire-and-forget */ });
        }

        return NextResponse.json({ questions, cached: false });

    } catch (error: unknown) {
        logger.error('[generate-questions] Unexpected error', error);
        return NextResponse.json({ error: 'Failed to generate questions. Please try again.' }, { status: 500 });
    }
}
