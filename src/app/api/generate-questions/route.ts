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
            // Handle both { questions: [...] } and [...] formats
            questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);
        } catch (e) {
            console.error("Failed to parse AI response as JSON", e);
            questions = [{ 
                question: "Could not generate structured questions. Please ask your doctor about your flagged biomarkers.",
                context: "There was an error processing the detailed questions."
            }];
        }

        return NextResponse.json({ questions })
    } catch (error: unknown) {
        return NextResponse.json({ error: 'Failed to generate questions.' }, { status: 500 })
    }
}
