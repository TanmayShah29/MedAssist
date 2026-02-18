import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

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
        return NextResponse.json({
            error: 'Unauthorized',
            detail: authError?.message || 'No user session found',
            hint: 'Check Supabase Site URL and Redirect URLs configuration'
        }, { status: 401 })
    }

    // Robust Body Parsing with Error Handling
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body', hint: 'Payload might be too large' }, { status: 400 });
    }

    const { base64, mimeType, symptoms, fileName } = body;

    if (!base64) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const startTime = Date.now()

    try {
        // TIMEOUT RACE
        // Vercel Hobby Limit is 10s. We race 9.5s to fail gracefully.
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Analysis timed out. Try a smaller part of the image.")), 9500)
        );

        const aiPromise = groq.chat.completions.create({
            model: 'llama-3.2-11b-vision-preview',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${mimeType};base64,${base64}`
                            }
                        },
                        {
                            type: 'text',
                            text: `You are a medical data extraction assistant. Extract ALL biomarker values from this lab report image.

Return ONLY a valid JSON object with NO markdown, NO backticks, NO explanation. Just raw JSON.

User symptoms: ${symptoms?.join(', ') || 'none reported'}

Return this exact structure:
{
  "biomarkers": [
    {
      "name": "string",
      "value": "string or number", 
      "unit": "string",
      "referenceMin": number or null,
      "referenceMax": number or null,
      "status": "optimal" or "warning" or "critical",
      "category": "hematology" or "inflammation" or "metabolic" or "vitamins" or "other",
      "confidence": number between 0 and 1,
      "aiInterpretation": "1-2 plain English sentences a non-medical person can understand. Never use diagnostic language."
    }
  ],
  "healthScore": number between 0 and 100,
  "riskLevel": "low" or "moderate" or "high",
  "summary": "2-3 sentence plain English overview"
}

Rules:
- Value should be extracted exactly as seen. If it is "Positive" or "Detected", return that string.
- status is optimal if value is within reference range
- status is warning if slightly outside range
- status is critical if significantly outside range
- healthScore = percentage of optimal values weighted by severity
- Never use words like diagnose, prescribe, or treatment plan in interpretations
- Always recommend consulting a physician at the end of the summary`
                        }
                    ]
                }
            ],
            max_tokens: 4000
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await Promise.race([aiPromise, timeoutPromise]);

        const rawText = response.choices[0]?.message?.content || ''

        // ROBUST JSON EXTRACTION (Regex Fallback)
        let cleaned = rawText.replace(/```json|```/g, '').trim()

        // If the model yaps before/after json, find the object
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            cleaned = jsonMatch[0];
        }

        let result
        try {
            result = JSON.parse(cleaned)
        } catch {
            console.error("AI JSON Parse Failed. Raw:", rawText);
            return NextResponse.json({ error: 'AI returned invalid format. Please try again.' }, { status: 500 })
        }

        const processingTime = Date.now() - startTime

        // Save lab result
        const { data: labResult, error: labError } = await supabase
            .from('lab_results')
            .insert({
                user_id: user.id,
                file_name: fileName || 'Lab Report',
                processed: true,
                processing_time_ms: processingTime
            })
            .select()
            .single()

        if (labError) throw new Error('Failed to save lab result')

        // Save biomarkers
        if (result.biomarkers?.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const biomarkersToInsert = result.biomarkers.map((b: any) => ({
                user_id: user.id,
                lab_result_id: labResult.id,
                name: b.name,
                value: String(b.value), // Force to string for new text column
                unit: b.unit,
                status: b.status,
                reference_min: b.referenceMin,
                reference_max: b.referenceMax,
                category: b.category,
                confidence: b.confidence,
                ai_interpretation: b.aiInterpretation
            }))

            const { error: bioError } = await supabase
                .from('biomarkers')
                .insert(biomarkersToInsert)

            if (bioError) {
                console.error("Biomarker Insert Error:", bioError);
                throw new Error('Failed to save biomarkers')
            }
        }

        // Save symptoms
        if (symptoms?.length > 0) {
            const symptomsToInsert = symptoms.map((s: string) => ({
                user_id: user.id,
                symptom: s
            }))
            await supabase.from('symptoms').upsert(symptomsToInsert, { onConflict: 'user_id,symptom' })
        }

        return NextResponse.json({
            success: true,
            biomarkers: result.biomarkers,
            healthScore: result.healthScore,
            riskLevel: result.riskLevel,
            summary: result.summary,
            processingTime,
            labResultId: labResult.id
        })

    } catch (error: any) {
        console.error("Analysis Error:", error);
        if (error?.status === 429) {
            return NextResponse.json({ error: 'Rate limit hit. Please wait a minute and try again.' }, { status: 429 })
        }
        return NextResponse.json({ error: error.message || 'Analysis failed. Please try again.' }, { status: 500 })
    }
}
