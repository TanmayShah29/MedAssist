import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { checkRateLimit } from '@/services/rateLimitService';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { z } from 'zod';

export async function POST(req: NextRequest) {
    const rateLimitResult = await checkRateLimit();
    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: rateLimitResult.message || 'Too many feedback submissions. Please try again later.' },
            { status: 429 }
        );
    }

    try {
        const body = await req.json();

        const feedbackSchema = z.object({
            message: z.string().trim().min(3, 'Message is required (min 3 characters).').max(2000, 'Message too long.'),
            url: z.string().url('Invalid URL').nullable().optional()
        });

        const parseResult = feedbackSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.issues[0]?.message || 'Invalid input.' }, { status: 400 });
        }

        const { message, url } = parseResult.data;

        let userId: string | null = null;
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // Ignored
                        }
                    }
                }
            }
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        userId = user.id;

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 });
        }

        const { error } = await supabaseAdmin
            .from('feedback')
            .insert([{ message, url, user_id: userId }]);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json(
            { error: (err as Error).message || 'Failed to send feedback.' },
            { status: 500 }
        );
    }
}
