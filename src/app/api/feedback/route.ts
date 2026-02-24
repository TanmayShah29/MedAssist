import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { checkRateLimit } from '@/services/rateLimitService';
import { supabaseAdmin } from '@/lib/supabase-admin';

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
        const message = typeof body?.message === 'string' ? body.message.trim() : '';
        const url = typeof body?.url === 'string' ? body.url : null;

        if (!message || message.length < 3) {
            return NextResponse.json({ error: 'Message is required (min 3 characters).' }, { status: 400 });
        }

        if (message.length > 2000) {
            return NextResponse.json({ error: 'Message too long.' }, { status: 400 });
        }

        let userId: string | null = null;
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (user) userId = user.id;

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
