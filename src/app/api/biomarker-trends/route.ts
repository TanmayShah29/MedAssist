import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { checkRateLimit } from '@/services/rateLimitService';
import { z } from 'zod';
import { mergeBiomarkerSources } from '@/lib/medical-data';
import { Biomarker } from '@/types/medical';

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

    const [{ data, error }, { data: labResults }] = await Promise.all([
        supabase
            .from('biomarkers')
            .select(`
                id,
                name,
                value,
                unit,
                status,
                category,
                reference_range_min,
                reference_range_max,
                ai_interpretation,
                lab_result_id,
                created_at,
                lab_results!inner (
                    user_id,
                    uploaded_at,
                    created_at
                )
            `)
            .eq('lab_results.user_id', user.id)
            .eq('name', biomarkerName)
            .order('created_at', { ascending: true }),
        supabase
            .from('lab_results')
            .select('id, uploaded_at, created_at, raw_ai_json')
            .eq('user_id', user.id)
            .order('uploaded_at', { ascending: true })
    ]);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const merged = mergeBiomarkerSources(data as Biomarker[] | null, labResults || [])
        .filter((b) => b.name.toLowerCase() === biomarkerName.toLowerCase())
        .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());

    // Transform for Recharts (lab_results may be null if join fails)
    const trends = merged
        .filter((b) => {
            const lr = Array.isArray(b.lab_results) ? b.lab_results[0] : b.lab_results;
            return !!(lr?.uploaded_at || lr?.created_at || b.created_at);
        })
        .map((b) => {
            const lr = Array.isArray(b.lab_results) ? b.lab_results[0] : b.lab_results;
            const d = new Date((lr?.uploaded_at ?? lr?.created_at ?? b.created_at)!);
            const month = d.toLocaleString('en-US', { month: 'short' });
            const day = d.getDate();
            return {
                date: `${month} ${day}`,
                value: Number(b.value),
                unit: b.unit
            };
        });

    return NextResponse.json({ trends });
}
