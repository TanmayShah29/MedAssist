import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { answerHealthQuestion } from '@/lib/groq-medical'

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

    const { question, biomarkers, symptoms } = await request.json()

    if (!question || question.trim().length === 0) {
        return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    try {
        const answer = await answerHealthQuestion(question, biomarkers || [], symptoms || [])
        return NextResponse.json({ answer })
    } catch (error: unknown) {
        if ((error as Error).message?.startsWith('RATE_LIMIT')) {
            return NextResponse.json({ error: (error as Error).message }, { status: 429 })
        }
        return NextResponse.json({ error: 'Failed to get answer. Please try again.' }, { status: 500 })
    }
}
