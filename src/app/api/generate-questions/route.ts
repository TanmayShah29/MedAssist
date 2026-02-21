import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
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
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { biomarkers } = await request.json()

        if (!biomarkers || biomarkers.length === 0) {
            return NextResponse.json({ questions: [] });
        }

        // 1. Caching Check: Get latest lab result for this user
        const { data: latestReport, error: reportError } = await supabase
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

        const criticalBiomarkers = biomarkers.filter((b: any) =>
            b.status === 'critical' || b.status === 'warning'
        );

        if (criticalBiomarkers.length === 0) {
            const defaultMsg = [{ 
                question: "How can I maintain my current healthy biomarker levels?", 
                context: "All your biomarkers are currently in the optimal range." 
            }];
            return NextResponse.json({ questions: defaultMsg });
        }

        // 3. Global Caching: Create a key based on sorted biomarker statuses
        // This allows different users with identical patterns to share the same cached AI response
        const cacheKey = `questions_${criticalBiomarkers
            .sort((a: any, b: any) => a.name.localeCompare(b.name))
            .map((b: any) => `${b.name.toLowerCase()}:${b.status}`)
            .join('|')}`;

        const { data: globalCache } = await supabase
            .from('global_ai_cache')
            .select('response_json')
            .eq('cache_key', cacheKey)
            .single();

        if (globalCache) {
            // Update usage count asynchronously
            supabase.from('global_ai_cache')
                .update({ usage_count: (globalCache as any).usage_count + 1, updated_at: new Date().toISOString() })
                .eq('cache_key', cacheKey)
                .then();

            return NextResponse.json({ 
                questions: globalCache.response_json,
                cached: 'global' 
            });
        }

        const questionsPrompt = `Based on these lab results that need attention:
${criticalBiomarkers.map((b: any) => `${b.name}: ${b.value} ${b.unit} (${b.status})`).join('\n')}

Generate 3-5 specific questions this person should ask their doctor at their next appointment. 
For each question, provide a brief "Why ask this" context.

Return the response EXCLUSIVELY as a JSON array of objects with the following structure:
[
  {
    "question": "The actual question for the doctor",
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
            console.error("Failed to parse AI response as JSON", e);
            questions = [{ 
                question: "Could not generate structured questions. Please ask your doctor about your flagged biomarkers.",
                context: "There was an error processing the detailed questions."
            }];
        }

        return NextResponse.json({ questions, cached: false })
    } catch (error: unknown) {
        return NextResponse.json({ error: 'Failed to generate questions.' }, { status: 500 })
    }
}
