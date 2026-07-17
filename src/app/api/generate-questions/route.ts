import { getAuthClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { checkRateLimit } from '@/services/rateLimitService';
import { validateContentLength } from '@/lib/request-validation';
import { withRetry } from '@/lib/retry';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Groq from 'groq-sdk';
import { z } from 'zod';
import { GenerateQuestionsRequestSchema, GeneratedQuestionsSchema } from '@/lib/validations/api';

export const maxDuration = 30;
export const runtime = 'nodejs';

// Re-use a single Groq client (not instantiated on every request)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = 'llama-3.3-70b-versatile';

// ── In-memory lock map to prevent thundering herd on cache misses ──────────
const generationLocks = new Map<string, Promise<{ questions: { question: string; context: string }[] }>>();

// ── Input validation ────────────────────────────────────────────────────────

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

type BiomarkerInput = z.infer<typeof GenerateQuestionsRequestSchema>['biomarkers'][number];

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    // 1. IP-level rate limit
    const rateLimitResult = await checkRateLimit();
    if (!rateLimitResult.success) {
        return apiResponse(
            { error: rateLimitResult.message || 'Too many requests' },
            { status: 429, headers: { 'Retry-After': (rateLimitResult.retryAfter || 60).toString() } }
        );
    }

    // 2. Auth — use shared helper (fix #13)
    const supabase = await getAuthClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return apiResponse({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Parse & validate body
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return apiResponse({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }

    const parseResult = GenerateQuestionsRequestSchema.safeParse(body);
    if (!parseResult.success) {
        return apiResponse(
            { error: parseResult.error.issues[0]?.message || 'Invalid input' },
            { status: 400 }
        );
    }

    const { biomarkers } = parseResult.data;

    if (biomarkers.length === 0) {
        return apiResponse({ questions: [] });
    }

    try {
        validateContentLength(request);
        // 4. Only generate questions for flagged biomarkers
        const criticalBiomarkers = biomarkers.filter(
            (b: BiomarkerInput) => b.status === 'critical' || b.status === 'warning'
        );

        if (criticalBiomarkers.length === 0) {
            return apiResponse({
                questions: [{
                    question: 'Which of these in-range results should we keep monitoring over time?',
                    context: 'All provided biomarkers appear in range, so the visit can focus on what to track next.',
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
            return apiResponse({ questions: cachedLocal, cached: true });
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
                Promise.resolve(
                    supabaseAdmin.from('global_ai_cache')
                        .update({ usage_count: ((globalCache.usage_count as number) || 0) + 1, updated_at: new Date().toISOString() })
                        .eq('cache_key', cacheKey)
                ).then(() => {})
                    .catch((err: unknown) => logger.error('[generate-questions] Cache bump failed:', err));

                return apiResponse({ questions: globalCache.response_json, cached: 'global' });
            }
        }

        // 8. Generate questions via Groq — with lock to prevent thundering herd
        let questions: { question: string; context: string }[] = [];
        const existingLock = generationLocks.get(cacheKey);
        if (existingLock) {
            const result = await existingLock;
            return apiResponse({ questions: result.questions, cached: 'lock' });
        }

        const generationPromise = (async () => {
            const questionsPrompt = `Based on these specific lab results that may be worth discussing with a clinician:
${criticalBiomarkers.map((b: BiomarkerInput) =>
    `${b.name}: ${b.value} ${b.unit} (status: ${b.status}${
        b.reference_range_min != null && b.reference_range_max != null
            ? `, normal range: ${b.reference_range_min}–${b.reference_range_max} ${b.unit}`
            : ''
    })`
).join('\n')}

Generate 3-5 specific questions this person should ask their doctor at their next appointment.
For each question, reference the actual numeric value and frame it as a practical appointment talking point.
Provide a brief "Why ask this" context that explains what decision, follow-up test, or monitoring plan the question could clarify.
Do not diagnose, prescribe, claim causality, or imply the person has a condition. Do not recommend medications or supplements. Prefer phrases like "could we review" and "should we monitor".

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

            let parsedQuestions: { question: string; context: string }[] = [];
            try {
                const content = completion.choices[0].message.content || '{}';
                const parsed = JSON.parse(content);
                const validated = GeneratedQuestionsSchema.safeParse(parsed);
                if (validated.success) {
                    parsedQuestions = validated.data.questions;
                } else {
                    if (Array.isArray(parsed)) {
                        parsedQuestions = parsed.filter(
                            (q): q is { question: string; context: string } =>
                                typeof q?.question === 'string' && typeof q?.context === 'string'
                        );
                    }
                    if (parsedQuestions.length === 0) throw new Error('No valid questions in response');
                }
            } catch (e) {
                logger.error('[generate-questions] Failed to parse AI JSON response', e);
                parsedQuestions = [{
                    question: 'Could we review the results marked for discussion and decide what should be monitored next?',
                    context: 'There was an error generating detailed questions, so this fallback keeps the visit focused on clinician review.',
                }];
            }

            return { questions: parsedQuestions };
        })();

        generationLocks.set(cacheKey, generationPromise);
        try {
            const result = await generationPromise;
            questions = result.questions;
        } finally {
            generationLocks.delete(cacheKey);
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
                Promise.resolve(
                    supabase.from('lab_results')
                        .update({ raw_ai_json: updatedAiJson })
                        .eq('id', latestReport.id)
                ).then(() => {})
                    .catch((err: unknown) => logger.error('[generate-questions]  local cache write failed:', err));
            }

            // Fix #1: null-guard supabaseAdmin before writing global cache
            if (supabaseAdmin) {
                Promise.resolve(
                    supabaseAdmin.from('global_ai_cache').upsert({
                        cache_key: cacheKey,
                        response_json: questions,
                        updated_at: new Date().toISOString(),
                    }, { onConflict: 'cache_key' })
                ).then(() => {})
                    .catch((err: unknown) => logger.error('[generate-questions] global cache write failed:', err));
            }
        }

        return apiResponse({ questions, cached: false });

    } catch (error: unknown) {
        logger.error('[generate-questions] Unexpected error', error);
        return apiResponse({ error: 'Failed to generate questions. Please try again.' }, { status: 500 });
    }
}
