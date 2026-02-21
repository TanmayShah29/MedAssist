import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const biomarkerName = searchParams.get('name');

    if (!biomarkerName) {
        return NextResponse.json({ error: 'Biomarker name is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
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
                created_at
            )
        `)
        .eq('user_id', user.id)
        .eq('name', biomarkerName)
        .order('created_at', { foreignTable: 'lab_results', ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform for Recharts
    const trends = data.map((b: any) => ({
        date: new Date(b.lab_results.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: b.value,
        unit: b.unit
    }));

    return NextResponse.json({ trends });
}
