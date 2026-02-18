import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { answerHealthQuestion } from '@/lib/groq-medical'

export async function POST(request: NextRequest) {
    const supabase = createClient()
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
    } catch (error: any) {
        if (error.message?.startsWith('RATE_LIMIT')) {
            return NextResponse.json({ error: error.message }, { status: 429 })
        }
        return NextResponse.json({ error: 'Failed to get answer. Please try again.' }, { status: 500 })
    }
}
