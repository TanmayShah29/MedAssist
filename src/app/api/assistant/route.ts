import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { generateClinicalInsight } from '@/lib/groq-medical';
import { checkRateLimit } from '@/services/rateLimitService';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const maxDuration = 30;
export const runtime = 'nodejs';

// ── Input validation ─────────────────────────────────────────────────────────

const requestSchema = z.object({
    prompt: z.string().trim().min(1, 'Prompt is required').max(2000, 'Prompt is too long'),
    contextType: z.enum(['symptom', 'lab', 'report']).default('lab'),
});

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    // 1. IP-level rate limit
    const rateLimitResult = await checkRateLimit();
    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: rateLimitResult.message || 'Too many requests' },
            { status: 429, headers: { 'Retry-After': (rateLimitResult.retryAfter || 60).toString() } }
        );
    }

    // 2. Auth
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch { /* ignored in read-only contexts */ }
                },
            },
        }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Parse & validate body
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

    const { prompt, contextType } = parseResult.data;

    // 4. Generate clinical insight via Groq
    try {
        const result = await generateClinicalInsight(prompt, contextType);

        if (!result.success) {
            logger.error('[assistant] generateClinicalInsight failed', result.error);
            return NextResponse.json(
                { error: result.error || 'Failed to generate insight. Please try again.' },
                { status: result.status || 500 }
            );
        }

        return NextResponse.json({ insight: result.data });

    } catch (error: unknown) {
        logger.error('[assistant] Unexpected error', error);
        return NextResponse.json(
            { error: 'Failed to generate insight. Please try again.' },
            { status: 500 }
        );
    }
}
