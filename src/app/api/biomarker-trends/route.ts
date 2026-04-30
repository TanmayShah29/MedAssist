import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { checkRateLimit } from '@/services/rateLimitService';
import { z } from 'zod';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    const rateLimitResult = await checkRateLimit();
    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: rateLimitResult.message || 'Too many requests' },
            { status: 429, headers: { 'Retry-After': (rateLimitResult.retryAfter || 60).toString() } }
        );
    }

    const { searchParams } = new URL(req.url);
    const rawName = searchParams.get('name');

    const querySchema = z.object({
        name: z.string().min(1, 'Biomarker name is required').max(200)
    });

    const parseResult = querySchema.safeParse({ name: rawName });
    if (!parseResult.success) {
        return NextResponse.json({ error: parseResult.error.issues[0]?.message || 'Invalid parameter' }, { status: 400 });
    }
    const biomarkerName = parseResult.data.name;

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
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('biomarkers')
        .select(`
            value,
            unit,
            lab_results (
                uploaded_at,
                created_at
            )
        `)
        .eq('user_id', user.id)
        .eq('name', biomarkerName)
        .order('created_at', { foreignTable: 'lab_results', ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    interface TrendRow {
        value: number;
        unit: string;
        lab_results: { uploaded_at?: string; created_at: string } | { uploaded_at?: string; created_at: string }[] | null;
    }

    // Transform for Recharts (lab_results may be null if join fails)
    const trends = ((data as TrendRow[]) || [])
        .filter((b) => {
            const lr = Array.isArray(b.lab_results) ? b.lab_results[0] : b.lab_results;
            return !!(lr?.uploaded_at || lr?.created_at);
        })
        .map((b) => {
            const lr = Array.isArray(b.lab_results) ? b.lab_results[0] : b.lab_results;
            const d = new Date((lr!.uploaded_at ?? lr!.created_at)!);
            const month = d.toLocaleString('en-US', { month: 'short' });
            const day = d.getDate();
            return {
                date: `${month} ${day}`,
                value: b.value,
                unit: b.unit
            };
        });

    return NextResponse.json({ trends });
}
