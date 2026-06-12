import { NextRequest, NextResponse } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { validateContentLength } from '@/lib/request-validation';
import { getAuthClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/services/rateLimitService';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';
import { FeedbackSchema } from '@/lib/validations/api';

export const maxDuration = 15;
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    const rateLimitResult = await checkRateLimit();
    if (!rateLimitResult.success) {
        return apiResponse(
            { error: rateLimitResult.message || 'Too many feedback submissions. Please try again later.' },
            { status: 429 }
        );
    }

    try {
        validateContentLength(req);
        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return apiResponse({ error: 'Invalid JSON.' }, { status: 400 });
        }

        const parseResult = FeedbackSchema.safeParse(body);
        if (!parseResult.success) {
            return apiResponse({ error: parseResult.error.issues[0]?.message || 'Invalid input.' }, { status: 400 });
        }

        const { message, url } = parseResult.data;

        let userId: string | null = null;
        const supabase = await getAuthClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return apiResponse({ error: 'Unauthorized' }, { status: 401 });
        }
        userId = user.id;

        if (!supabaseAdmin) {
            return apiResponse({ error: 'Service unavailable.' }, { status: 503 });
        }

        const { error } = await supabaseAdmin
            .from('feedback')
            .insert([{ message, url, user_id: userId }]);

        if (error) throw error;

        return apiResponse({ success: true });
    } catch (err) {
        logger.error('[feedback] Failed to save feedback', err);
        return apiResponse(
            { error: (err as Error).message || 'Failed to send feedback.' },
            { status: 500 }
        );
    }
}
