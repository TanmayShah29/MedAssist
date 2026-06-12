import { supabaseAdmin } from "@/lib/supabase-admin";
import { headers } from "next/headers";
import crypto from 'crypto';

import { logger } from "@/lib/logger";

/**
 * RATE LIMIT CONFIGURATION
 */
const LIMITS = {
    PER_MINUTE: { limit: 10, window: 60 },
    PER_HOUR: { limit: 100, window: 3600 }
};

// ── In-memory rate limit fallback (when DB is unreachable) ───────────────
const inMemoryRateLimit = new Map<string, { count: number; windowStart: number }>();

// Clean up old entries every 60 seconds
setInterval(() => {
    const now = Date.now();
    const windowMs = 60000;
    const currentWindowStart = Math.floor(now / windowMs) * windowMs;
    for (const [key, value] of inMemoryRateLimit.entries()) {
        if (value.windowStart < currentWindowStart) {
            inMemoryRateLimit.delete(key);
        }
    }
}, 60000).unref();

function checkInMemoryRateLimit(ipHash: string, limit: number): boolean {
    const now = Date.now();
    const windowMs = 60000;
    const windowStart = Math.floor(now / windowMs) * windowMs;

    const entry = inMemoryRateLimit.get(ipHash);
    if (!entry || entry.windowStart !== windowStart) {
        inMemoryRateLimit.set(ipHash, { count: 1, windowStart });
        return true;
    }

    entry.count++;
    return entry.count <= limit;
}

export type RateLimitResult = {
    success: boolean;
    message?: string;
    retryAfter?: number; // Seconds to wait
};

/**
 * HASH IP ADDRESS
 * Requirement: Do not store raw IPs.
 */
function hashIp(ip: string): string {
    return crypto.createHash('sha256').update(ip).digest('hex');
}

async function getClientIp(): Promise<string> {
    const headersList = await headers();
    
    // Priority 1: Vercel-specific forwarded-for (sanitized by Vercel)
    const vercelForwardedFor = headersList.get("x-vercel-forwarded-for");
    if (vercelForwardedFor) return vercelForwardedFor.split(",")[0].trim();

    // Priority 2: Standard x-forwarded-for
    // We take the leftmost IP which is the original client IP.
    // NOTE: In production, we should only trust headers from our proxy (Vercel).
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
        const ips = forwardedFor.split(",").map(ip => ip.trim());
        return ips[0] || "unknown";
    }

    // Priority 3: x-real-ip
    const realIp = headersList.get("x-real-ip");
    if (realIp) return realIp.trim();

    return "unknown";
}

/**
 * CHECK RATE LIMIT
 * Calls Supabase RPC `check_rate_limit`.
 */
export async function checkRateLimit(identifier?: string): Promise<RateLimitResult> {
    // Bypass only when explicitly confirmed (e.g. local dev without Supabase)
    if (process.env.MEDASSIST_ALLOW_RATE_LIMIT_BYPASS === 'true-and-confirmed') {
        logger.info('[RateLimit] Bypassed via MEDASSIST_ALLOW_RATE_LIMIT_BYPASS');
        return { success: true };
    }

    if (!supabaseAdmin) {
        logger.error('Supabase admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY env variable.');
        return { success: true, message: 'rate_limit_unavailable' };
    }

    try {
        let fingerprint: string;
        if (identifier) {
            // Use the provided identifier (e.g. userId) as the fingerprint
            fingerprint = identifier;
        } else {
            // Fall back to IP hashing for anonymous/unknown identifiers
            const ip = await getClientIp();
            fingerprint = hashIp(ip);
        }

        // 1. Check Minute Limit
        const { data: allowedMinute, error: errorMin } = await supabaseAdmin.rpc('check_rate_limit', {
            p_fingerprint: fingerprint,
            p_window_seconds: LIMITS.PER_MINUTE.window,
            p_limit: LIMITS.PER_MINUTE.limit
        });

        if (errorMin) {
            // Specifically handle "function not found" to help developer
            if (errorMin.code === 'PGRST202') {
                logger.error("Rate Limit RPC missing. Please run `supabase_schema.sql`.");
            }
            throw errorMin;
        }

        if (!allowedMinute) {
            return {
                success: false,
                message: "Rate limit exceeded (10/min).",
                retryAfter: LIMITS.PER_MINUTE.window
            };
        }

        // 2. Check Hourly Limit
        const { data: allowedHour, error: errorHour } = await supabaseAdmin.rpc('check_rate_limit', {
            p_fingerprint: fingerprint,
            p_window_seconds: LIMITS.PER_HOUR.window,
            p_limit: LIMITS.PER_HOUR.limit
        });

        if (errorHour) throw errorHour;
        if (!allowedHour) {
            return {
                success: false,
                message: "Rate limit exceeded (100/hr).",
                retryAfter: LIMITS.PER_HOUR.window
            };
        }

        return { success: true };

    } catch (error) {
        logger.error(
            '[RateLimit] Infrastructure failure — rate-limit RPC unreachable. Falling back to in-memory limiter.',
            error
        );

        // Fall back to in-memory rate limiting (stops abuse without blocking all traffic)
        const ip = await getClientIp().catch(() => "unknown");
        const fingerprint = identifier || hashIp(ip);
        if (!checkInMemoryRateLimit(fingerprint, LIMITS.PER_MINUTE.limit)) {
            return {
                success: false,
                message: "Rate limit exceeded. Please wait a moment.",
                retryAfter: LIMITS.PER_MINUTE.window,
            };
        }

        return { success: true };
    }
}
