import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { answerHealthQuestion } from '@/lib/groq-medical'
import { checkRateLimit } from '@/services/rateLimitService'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { MAX_SYMPTOMS_PER_REQUEST } from '@/lib/constants'

export const maxDuration = 30;
export const runtime = 'nodejs';

const requestSchema = z.object({
    question: z.string().trim().min(1, 'Question is required').max(1000, 'Question is too long'),
    symptoms: z.array(z.string()).max(MAX_SYMPTOMS_PER_REQUEST, `Too many symptoms (max ${MAX_SYMPTOMS_PER_REQUEST})`).optional().default([]),
});

export async function POST(request: NextRequest) {
    // IP-level rate limit (shared across all users / accounts)
    const rateLimitResult = await checkRateLimit();
    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: rateLimitResult.message || 'Too many requests.' },
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

    // Per-user rate limit: max 10 messages per minute
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
    const { count: msgCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('role', 'user')
        .gte('created_at', oneMinuteAgo)
    if (msgCount !== null && msgCount >= 10) {
        return NextResponse.json(
            { error: 'Too many messages. Please wait a moment before sending another.' },
            { status: 429 }
        )
    }

    // Safe body parsing
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

    const { question, symptoms } = parseResult.data;

    // Fetch biomarkers server-side for integrity
    const { data: rawBiomarkers } = await supabase
        .from('biomarkers')
        .select('name, value, unit, status, reference_range_min, reference_range_max, ai_interpretation')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    // Deduplicate by name — keep most recent per biomarker
    type BiomarkerRow = { name: string; value: string | number; unit: string; status: string; reference_range_min: number | null; reference_range_max: number | null; ai_interpretation: string };
    const biomarkers = Array.from(
        (rawBiomarkers || []).reduce((acc, b) => {
            if (!acc.has(b.name)) acc.set(b.name, b as BiomarkerRow);
            return acc;
        }, new Map<string, BiomarkerRow>()).values()
    );

    const { data: previousMessages } = await supabase
        .from('conversations')
        .select('role, content')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(20)

    const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, age, sex, blood_type')
        .eq('id', user.id)
        .single()

    try {
        const answer = await answerHealthQuestion(question, biomarkers || [], symptoms, previousMessages || [], profile)

        // Save history (awaited to prevent serverless function termination)
        const { error: insertError } = await supabase.from('conversations').insert([
            { user_id: user.id, role: 'user', content: question },
            { user_id: user.id, role: 'assistant', content: answer }
        ]);
        if (insertError) logger.error('[ask-ai] Failed to save conversation history:', insertError);

        return NextResponse.json({ answer })
    } catch (error: unknown) {
        if ((error as Error).message?.startsWith('RATE_LIMIT')) {
            return NextResponse.json({ error: (error as Error).message }, { status: 429 })
        }
        logger.error('[ask-ai] Groq error:', error);
        return NextResponse.json({ error: 'Failed to get answer. Please try again.' }, { status: 500 })
    }
}
