import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { generateAIGreeting } from '@/lib/groq-medical'
import { checkRateLimit } from '@/services/rateLimitService'
import { z } from 'zod'

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
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .single()

    let body;
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const greetingSchema = z.object({
        biomarkers: z.array(
            z.object({
                name: z.string().trim().max(100),
                value: z.union([z.string(), z.number()]),
                unit: z.string().trim().max(50),
                status: z.string().trim().max(50)
            })
        ).optional().default([]),
        symptoms: z.array(z.string().trim().max(200)).optional().default([])
    });

    const parseResult = greetingSchema.safeParse(body);
    if (!parseResult.success) {
        return NextResponse.json({ error: 'Invalid payload data' }, { status: 400 });
    }

    const { biomarkers, symptoms } = parseResult.data;

    try {
        const greeting = await generateAIGreeting(biomarkers || [], symptoms || [], profile?.first_name || 'Guest')
        return NextResponse.json({ greeting })
    } catch (_error) {
        return NextResponse.json({ error: 'Failed to generate greeting' }, { status: 500 })
    }
}
