import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import Groq from "groq-sdk";
import { checkRateLimit } from '@/services/rateLimitService';
import { z } from 'zod';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
    const rateLimitResult = await checkRateLimit();
    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: rateLimitResult.message || 'Too many requests' },
            { status: 429, headers: { 'Retry-After': (rateLimitResult.retryAfter || 60).toString() } }
        );
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Ignored
                    }
                },
            },
        }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()

        const questionSchema = z.object({
            biomarkers: z.array(z.object({
                name: z.string(),
                value: z.union([z.number(), z.string()]).transform(v => Number(v)).refine(n => !Number.isNaN(n)),
                unit: z.string(),
                status: z.string()
            })).optional()
        });

        const parseResult = questionSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
        }

        const { biomarkers } = parseResult.data;

        if (!biomarkers || biomarkers.length === 0) {
            return NextResponse.json({ questions: [] });
        }

        // 1. Caching Check: Get latest lab result for this user
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
                cached: true
            });
        }

        interface BiomarkerInput { name: string; value: number; unit: string; status: string; }
        const criticalBiomarkers = biomarkers.filter((b: BiomarkerInput) =>
            b.status === 'critical' || b.status === 'warning'
        );

        if (criticalBiomarkers.length === 0) {
            const defaultMsg = [{
                question: "How can I maintain my current healthy biomarker levels?",
                context: "All your biomarkers are currently in the optimal range."
            }];
            return NextResponse.json({ questions: defaultMsg });
        }

        // Bug 6 fix: Cache key includes actual value so users with same status pattern but
        // different numeric values get specific (not cross-user-shared) questions
        const cacheKey = `questions_${criticalBiomarkers
            .sort((a: BiomarkerInput, b: BiomarkerInput) => a.name.localeCompare(b.name))
            .map((b: BiomarkerInput) => `${b.name.toLowerCase()}:${b.status}:${parseFloat(String(b.value)).toFixed(1)}`)
            .join('|')}`;

        const { data: globalCache } = await supabase
            .from('global_ai_cache')
            .select('response_json')
            .eq('cache_key', cacheKey)
            .single();

        if (globalCache) {
            // Update usage count asynchronously
            supabase.from('global_ai_cache')
                .update({ usage_count: (globalCache as unknown as { usage_count: number }).usage_count + 1, updated_at: new Date().toISOString() })
                .eq('cache_key', cacheKey)
                .then();

            return NextResponse.json({
                questions: globalCache.response_json,
                cached: 'global'
            });
        }

        // Bug 6 fix: Include actual values and reference ranges so questions are specific
        const questionsPrompt = `Based on these specific lab results that need attention:
${criticalBiomarkers.map((b: BiomarkerInput & { reference_range_min?: number | null; reference_range_max?: number | null }) =>
            `${b.name}: ${b.value} ${b.unit} (status: ${b.status}${b.reference_range_min != null && b.reference_range_max != null ? `, normal range: ${b.reference_range_min}–${b.reference_range_max} ${b.unit}` : ''})`
        ).join('\n')}

Generate 3-5 specific questions this person should ask their doctor at their next appointment.
For each question, reference the actual numeric value in the question text. Provide a brief "Why ask this" context.
Example format: "My [biomarker] is [value] [unit], which is [above/below] the normal range of [range]. What could be causing this?"

Return the response EXCLUSIVELY as a JSON array of objects:
[
  {
    "question": "The actual question with the specific value mentioned",
    "context": "Why this question is important based on the specific results"
  }
]
Do not include any preamble or postamble.`

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: questionsPrompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            response_format: { type: "json_object" },
            max_tokens: 600,
        });

        let questions = [];
        try {
            const content = completion.choices[0].message.content || "[]";
            const parsed = JSON.parse(content);
            questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);

            // 4. Save to BOTH Local and Global Cache
            if (questions.length > 0) {
                // Local cache (per report)
                if (latestReport) {
                    const updatedAiJson = { ...latestReport.raw_ai_json, cached_doctor_questions: questions };
                    await supabase.from('lab_results').update({ raw_ai_json: updatedAiJson }).eq('id', latestReport.id);
                }

                // Global cache (cross-user pattern sharing)
                await supabase.from('global_ai_cache').upsert({
                    cache_key: cacheKey,
                    response_json: questions,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'cache_key' });
            }
        } catch (e) {
            const { logger } = await import("@/lib/logger");
            logger.error("Failed to parse AI response as JSON", e);
            questions = [{
                question: "Could not generate structured questions. Please ask your doctor about your flagged biomarkers.",
                context: "There was an error processing the detailed questions."
            }];
        }

        return NextResponse.json({ questions, cached: false })
    } catch (_error: unknown) {
        return NextResponse.json({ error: 'Failed to generate questions.' }, { status: 500 })
    }
}
