import { NextRequest, NextResponse } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { validateContentLength } from '@/lib/request-validation';
import { generateClinicalInsight } from '@/lib/groq-medical';
import { checkRateLimit } from '@/services/rateLimitService';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { getAuthClient } from '@/lib/supabase/server';

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
        return apiResponse(
            { error: rateLimitResult.message || 'Too many requests' },
            { status: 429, headers: { 'Retry-After': (rateLimitResult.retryAfter || 60).toString() } }
        );
    }

    // 2. Auth
    const supabase = await getAuthClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return apiResponse({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Parse & validate body
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return apiResponse({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }

    const parseResult = requestSchema.safeParse(body);
    if (!parseResult.success) {
        return apiResponse(
            { error: parseResult.error.issues[0]?.message || 'Invalid input' },
            { status: 400 }
        );
    }

    const { prompt, contextType } = parseResult.data;

    // 4. Generate clinical insight via Groq
    try {
        validateContentLength(request);
        const result = await generateClinicalInsight(prompt, contextType);

        if (!result.success) {
            logger.error('[assistant] generateClinicalInsight failed', result.error);
            return apiResponse(
                { error: result.error || 'Failed to generate insight. Please try again.' },
                { status: result.status || 500 }
            );
        }

        return apiResponse({ insight: result.data });

    } catch (error: unknown) {
        logger.error('[assistant] Unexpected error', error);
        return apiResponse(
            { error: 'Failed to generate insight. Please try again.' },
            { status: 500 }
        );
    }
}
