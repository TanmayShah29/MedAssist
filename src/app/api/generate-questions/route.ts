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
            return NextResponse.json({ questions: "Upload a lab report to get personalized questions for your doctor." });
        }

        const criticalBiomarkers = biomarkers.filter((b: any) =>
            b.status === 'critical' || b.status === 'warning'
        );

        if (criticalBiomarkers.length === 0) {
            return NextResponse.json({ questions: "Your results look great! You might just ask your doctor about maintaining your current health routine." });
        }

        const questionsPrompt = `Based on these lab results that need attention:
${criticalBiomarkers.map((b: any) => `${b.name}: ${b.value} ${b.unit} (${b.status})`).join('\n')}

Generate 3-5 specific questions this person should ask their doctor at their next appointment. 
Be specific and reference the actual values. Format as a simple numbered list.`

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: questionsPrompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 300,
        });

        const questions = completion.choices[0].message.content || "Could not generate questions. Please ask your doctor about your flagged biomarkers.";

        return NextResponse.json({ questions })
    } catch (error: unknown) {
        return NextResponse.json({ error: 'Failed to generate questions.' }, { status: 500 })
    }
}
