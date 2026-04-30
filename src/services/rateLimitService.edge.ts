/**
 * Edge-compatible rate limiter.
 *
 * NOTE: The biomarker-trends route was migrated from `runtime = 'edge'` to
 * `runtime = 'nodejs'` so that it can use the full Supabase-backed rate limiter
 * in rateLimitService.ts. This file is kept for reference but is no longer
 * imported by any route.
 *
 * If you add a new Edge runtime route in the future, implement rate limiting
 * via Vercel KV / Upstash Redis instead of this stub.
 */

export type RateLimitResult = {
    success: boolean;
    message?: string;
    retryAfter?: number;
};

/** @deprecated — not used. Migrate Edge routes to nodejs runtime. */
export async function checkRateLimitEdge(): Promise<RateLimitResult> {
    console.warn(
        '[RateLimitEdge] checkRateLimitEdge() called but this is a stub. ' +
        'Migrate the calling route to runtime = "nodejs" and use checkRateLimit() instead.'
    );
    return { success: true, message: 'rate_limit_unavailable' };
}
