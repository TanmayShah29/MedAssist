import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/services/rateLimitService'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { logger } from '@/lib/logger'

export const maxDuration = 15;
export const runtime = 'nodejs';

async function deleteAppData(userId: string) {
    if (!supabaseAdmin) throw new Error('Account deletion is not configured. Missing server admin key.');

    const deletions = [
        supabaseAdmin.from('conversations').delete().eq('user_id', userId),
        supabaseAdmin.from('supplements').delete().eq('user_id', userId),
        supabaseAdmin.from('symptoms').delete().eq('user_id', userId),
        supabaseAdmin.from('biomarkers').delete().eq('user_id', userId),
        supabaseAdmin.from('lab_results').delete().eq('user_id', userId),
        supabaseAdmin.from('profiles').delete().eq('id', userId),
    ];

    const results = await Promise.all(deletions);
    const failed = results.find(result => result.error);
    if (failed?.error) throw failed.error;
}

export async function DELETE(_request: NextRequest) {
    // 1. Rate limit
    const rateLimitResult = await checkRateLimit();
    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: rateLimitResult.message || 'Too many requests. Please try again later.' },
            { status: 429, headers: { 'Retry-After': (rateLimitResult.retryAfter || 60).toString() } }
        );
    }

    // 2. Verify the requesting user is authenticated
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch { /* ignored */ }
                },
            },
        }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Use the shared admin client (service role) to delete the auth user.
    //    True Auth user deletion is an admin-only Supabase operation.
    if (!supabaseAdmin) {
        logger.error('[account/delete] supabaseAdmin is not initialised — check SUPABASE_SERVICE_ROLE_KEY');
        return NextResponse.json(
            { error: 'Account deletion is not configured on this deployment. Please contact support.' },
            { status: 503 }
        );
    }

    try {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        if (deleteError) {
            logger.error('[account/delete] Auth admin deleteUser failed', deleteError);
            throw deleteError;
        }

        // Explicit cleanup after auth deletion so older schemas without
        // complete cascades still remove app rows. This runs after the
        // authoritative Auth deletion to avoid leaving an empty-but-active
        // account if the admin operation fails.
        try {
            await deleteAppData(user.id);
        } catch (cleanupError) {
            logger.error('[account/delete] Post-auth app-data cleanup failed', cleanupError);
        }

        logger.info(`[account/delete] User ${user.id} deleted successfully`);
        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        logger.error('[account/delete] Unexpected error', error);
        return NextResponse.json(
            { error: (error as Error).message || 'Failed to delete account. Please try again.' },
            { status: 500 }
        );
    }
}
