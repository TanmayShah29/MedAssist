import { NextRequest } from 'next/server'
import { apiResponse } from '@/lib/api-response'
import { validateContentLength } from '@/lib/request-validation';
import { checkRateLimit } from '@/services/rateLimitService';
import { SupplementSchema } from '@/lib/validations/api';
import { getAuthClient } from '@/lib/supabase/server';

export const maxDuration = 15;
export const runtime = 'nodejs';

export async function GET(_request: NextRequest) {
    try {
        const rateLimitResult = await checkRateLimit();
        if (!rateLimitResult.success) {
            return apiResponse(
                { error: rateLimitResult.message || 'Too many requests' },
                { status: 429, headers: { 'Retry-After': (rateLimitResult.retryAfter || 60).toString() } }
            );
        }

        const supabase = await getAuthClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return apiResponse({ error: 'Unauthorized' }, { status: 401 })

        const { data, error } = await supabase
            .from('supplements')
            .select('*')
            .eq('user_id', user.id)
            .order('start_date', { ascending: false })

        if (error) return apiResponse({ error: error.message }, { status: 500 })
        return apiResponse({ supplements: data })
    } catch (err) {
        return apiResponse({ error: (err as Error).message || 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const rateLimitResult = await checkRateLimit();
    if (!rateLimitResult.success) {
        return apiResponse(
            { error: rateLimitResult.message || 'Too many requests' },
            { status: 429, headers: { 'Retry-After': (rateLimitResult.retryAfter || 60).toString() } }
        );
    }

    const supabase = await getAuthClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiResponse({ error: 'Unauthorized' }, { status: 401 })

    try {
        validateContentLength(request);
        const body = await request.json()
        const parseResult = SupplementSchema.safeParse(body);
        if (!parseResult.success) {
            return apiResponse({ error: parseResult.error.issues[0]?.message || 'Invalid request body' }, { status: 400 });
        }

        const { name, dosage, frequency, start_date } = parseResult.data;
        const startDateIso = new Date(start_date).toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('supplements')
            .insert([
                { user_id: user.id, name, dosage, frequency, start_date: startDateIso }
            ])
            .select()
            .single()

        if (error) return apiResponse({ error: error.message }, { status: 500 })
        return apiResponse({ supplement: data })
    } catch (_error) {
        return apiResponse({ error: 'Invalid request body' }, { status: 400 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const rateLimitResult = await checkRateLimit();
        if (!rateLimitResult.success) {
            return apiResponse(
                { error: rateLimitResult.message || 'Too many requests' },
                { status: 429, headers: { 'Retry-After': (rateLimitResult.retryAfter || 60).toString() } }
            );
        }

        const supabase = await getAuthClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return apiResponse({ error: 'Unauthorized' }, { status: 401 })

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return apiResponse({ error: 'ID is required' }, { status: 400 })

        const { error } = await supabase
            .from('supplements')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) return apiResponse({ error: error.message }, { status: 500 })
        return apiResponse({ success: true })
    } catch (err) {
        return apiResponse({ error: (err as Error).message || 'Internal server error' }, { status: 500 })
    }
}
