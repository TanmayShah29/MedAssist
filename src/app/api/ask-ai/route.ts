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

    const { question, symptoms } = await request.json()

    if (!question || question.trim().length === 0) {
        return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    // Fetch biomarkers server-side for integrity
    const { data: biomarkers } = await supabase
        .from('biomarkers')
        .select('name, value, unit, status, reference_range_min, reference_range_max, ai_interpretation')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    const { data: previousMessages } = await supabase
        .from('conversations')
        .select('role, content')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(20)

    try {
        const answer = await answerHealthQuestion(question, biomarkers || [], symptoms || [], previousMessages || [])

        // Save history
        await supabase.from('conversations').insert([
            { user_id: user.id, role: 'user', content: question },
            { user_id: user.id, role: 'assistant', content: answer }
        ])

        return NextResponse.json({ answer })
    } catch (error: unknown) {
        if ((error as Error).message?.startsWith('RATE_LIMIT')) {
            return NextResponse.json({ error: (error as Error).message }, { status: 429 })
        }
        return NextResponse.json({ error: 'Failed to get answer. Please try again.' }, { status: 500 })
    }
}
