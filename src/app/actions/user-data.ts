"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { ExtractedLabValue } from "@/lib/onboarding-store";
import { logger } from "@/lib/logger";

interface SaveLabResultArgs {
    userId: string;
    healthScore: number;
    riskLevel: string;
    summary: string;
    labValues: ExtractedLabValue[];
    fileName?: string;
    rawOcrText?: string;
    rawAiJson?: any;
}

export async function saveLabResult(args: SaveLabResultArgs) {
    const { userId, healthScore, riskLevel, summary, labValues, fileName = "Lab Report", rawOcrText, rawAiJson } = args;

    if (!userId) {
        logger.error("User ID is missing, cannot save lab result.");
        return { success: false, error: "User not authenticated." };
    }

    if (!supabaseAdmin) {
        logger.error("Supabase Admin client is not available.");
        return { success: false, error: "Internal Server Error" };
    }

    try {
        // Use RPC for Atomic Transaction
        const { data: labResultId, error: rpcError } = await supabaseAdmin.rpc(
            "save_complete_report",
            {
                p_user_id: userId,
                p_file_name: fileName,
                p_health_score: healthScore,
                p_risk_level: riskLevel,
                p_summary: summary,
                p_biomarkers: labValues, // Pass the whole array, Postgres handles JSONB
                p_raw_ocr_text: rawOcrText,
                p_raw_ai_json: rawAiJson
            }
        );

        if (rpcError) {
            logger.error("RPC Error in save_complete_report:", rpcError);
            throw new Error(rpcError.message);
        }

        return { success: true, labResultId };

    } catch (error: unknown) {
        logger.error("Failed to save lab result:", (error as Error).message);
        return { success: false, error: "Failed to save lab result." };
    }
}

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function getUserBiomarkerHistory(userId: string) {
    if (!userId || !supabaseAdmin) return [];

    try {
        const { data, error } = await supabaseAdmin
            .from("biomarkers")
            .select("name, value, unit, status, reference_range_min, reference_range_max, ai_interpretation, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(100);

        if (error) throw error;
        return data || [];
    } catch (error) {
        logger.error("Failed to fetch biomarker history:", (error as Error).message);
        return [];
    }
}

export async function completeOnboarding() {
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                }
            }
        }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        console.error('completeOnboarding — no user found:', userError)
        return { success: false, error: 'No user session' }
    }

    console.log('completeOnboarding — updating user:', user.id)

    const { error: updateError } = await supabase
        .from('profiles')
        .update({ onboarding_complete: true })
        .eq('id', user.id)

    if (updateError) {
        console.error('completeOnboarding — update failed:', updateError)
        return { success: false, error: updateError.message }
    }

    console.log('completeOnboarding — success, setting cookie')

    cookieStore.set('onboarding_complete', 'true', {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
    })

    return { success: true }
}

