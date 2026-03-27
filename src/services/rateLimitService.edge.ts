export type RateLimitResult = {
    success: boolean;
    message?: string;
    retryAfter?: number;
};

export async function checkRateLimitEdge(): Promise<RateLimitResult> {
    if (process.env.DISABLE_RATE_LIMIT === 'true') {
        return { success: true };
    }

    return { success: true, message: 'rate_limit_unavailable' };
}
