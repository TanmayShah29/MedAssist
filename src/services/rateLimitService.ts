import { supabaseAdmin } from "../lib/supabase";
import { headers } from "next/headers";
import crypto from 'crypto';

import { logger } from "../lib/logger";

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

/**
 * EXTRACT CLIENT IP
 * Normalized extraction logic.
 */
async function getClientIp(): Promise<string> {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) return forwardedFor.split(",")[0].trim();

    const realIp = headersList.get("x-real-ip");
    if (realIp) return realIp.trim();

    return "unknown";
}

/**
 * CHECK RATE LIMIT (New Service Method)
 * Calls Supabase RPC `check_rate_limit`.
 */
export async function checkRateLimit(): Promise<RateLimitResult> {
    if (!supabaseAdmin) {
        logger.error('Supabase admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY env variable.');
        return { success: true, message: 'rate_limit_unavailable' };
    }

    try {
        const ip = await getClientIp();
        const ipHash = hashIp(ip);

        // 1. Check Minute Limit
        const { data: allowedMinute, error: errorMin } = await supabaseAdmin.rpc('check_rate_limit', {
            p_fingerprint: ipHash,
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
        // Fail Closed - PRD 4.2
        return {
            success: false,
            message: "Service temporarily unavailable (RLS).",
            retryAfter: 60 // Default cooldown for system errors
        };
    }
}
