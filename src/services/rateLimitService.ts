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
 * CHECK RATE LIMIT (New Service Method)
 * Calls Supabase RPC `check_rate_limit`.
 */
export async function checkRateLimit(): Promise<RateLimitResult> {
    // Bypass only when explicitly disabled (e.g. local dev without Supabase)
    if (process.env.DISABLE_RATE_LIMIT === 'true') {
        logger.info('[RateLimit] Bypassed via DISABLE_RATE_LIMIT=true');
        return { success: true };
    }

    if (!supabaseAdmin) {
        logger.error('Supabase admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY env variable.');
        return { success: true, message: 'rate_limit_unavailable' };
    }

    try {
        logger.info('[RateLimit] Starting check...');
        const ip = await getClientIp();
        logger.info(`[RateLimit] IP: ${ip}`);
        const ipHash = hashIp(ip);

        // 1. Check Minute Limit
        const { data: allowedMinute, error: errorMin } = await supabaseAdmin.rpc('check_rate_limit', {
            p_fingerprint: ipHash,
            p_window_seconds: LIMITS.PER_MINUTE.window,
            p_limit: LIMITS.PER_MINUTE.limit
        });
        logger.info(`[RateLimit] Supabase result (Minute): ${allowedMinute}, ${errorMin}`);

        if (errorMin) {
            // Specifically handle "function not found" to help developer
            if (errorMin.code === 'PGRST202') {
                logger.error("Rate Limit RPC missing. Please run `supabase_schema.sql`.");
            }
            throw errorMin;
        }

        if (!allowedMinute) {
            // Deterministic cooldown: If blocked by minute rule, wait up to 60s. 
            // Ideally RPC returns TTL, but safe fallback is full window.
            return {
                success: false,
                message: "Rate limit exceeded (10/min).",
                retryAfter: LIMITS.PER_MINUTE.window
            };
        }

        // 2. Check Hourly Limit
        const { data: allowedHour, error: errorHour } = await supabaseAdmin.rpc('check_rate_limit', {
            p_fingerprint: ipHash,
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
        logger.error("Rate Limit Infrastructure Error:", error);

        // Fail open only when explicitly disabled (local dev)
        if (process.env.DISABLE_RATE_LIMIT === 'true') {
            logger.info('[RateLimit] DISABLE_RATE_LIMIT: failing open despite error');
            return { success: true };
        }

        // Fail closed in production
        return {
            success: false,
            message: "Service temporarily unavailable (RLS).",
            retryAfter: 60 // Default cooldown for system errors
        };
    }
}
