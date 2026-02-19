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
}

export async function saveLabResult(args: SaveLabResultArgs) {
    const { userId, healthScore, riskLevel, summary, labValues } = args;

    if (!userId) {
        logger.error("User ID is missing, cannot save lab result.");
        return { success: false, error: "User not authenticated." };
    }

    if (!supabaseAdmin) {
        logger.error("Supabase Admin client is not available.");
        return { success: false, error: "Internal Server Error" };
    }

    try {
        // Step 1: Insert the main lab result and get its ID
        const { data: labResultData, error: labResultError } = await supabaseAdmin
            .from("lab_results")
            .insert({
                user_id: userId,
                health_score: healthScore,
                risk_level: riskLevel,
                summary: summary,
            })
            .select("id")
            .single();

        if (labResultError) {
            logger.error("Error inserting into lab_results:", labResultError);
            throw new Error(labResultError.message);
        }

        const labResultId = labResultData.id;

        // Step 2: Prepare and insert all the biomarker records
        const biomarkersToInsert = labValues.map((value) => ({
            lab_result_id: labResultId,
            name: value.name,
            value: value.value,
            unit: value.unit,
            status: value.status,
            reference_range_min: value.referenceMin,
            reference_range_max: value.referenceMax,
            ai_interpretation: value.aiInterpretation,
        }));

        const { error: biomarkersError } = await supabaseAdmin
            .from("biomarkers")
            .insert(biomarkersToInsert);

        if (biomarkersError) {
            // If biomarker insert fails, we should ideally roll back the lab_result insert.
            // For now, we will log the error. A transaction would be better here.
            logger.error("Error inserting into biomarkers:", biomarkersError);
            throw new Error(biomarkersError.message);
        }

        return { success: true, labResultId: labResultId };

    } catch (error: unknown) {
        logger.error("Failed to save lab result:", (error as Error).message);
        return { success: false, error: "Failed to save lab result." };
    }
}
