"use server";

import { getAuthClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ExtractedLabValue } from "@/lib/onboarding-store";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { mergeBiomarkerSources } from "@/lib/medical-data";
import { Biomarker } from "@/types/medical";

// ─────────────────────────────────────────────────────────────────────────────
// saveLabResult — persist a full lab report + biomarkers in one atomic RPC
// ─────────────────────────────────────────────────────────────────────────────

interface SaveLabResultArgs {
  userId: string;
  healthScore: number;
  riskLevel: string;
  summary: string;
  labValues: ExtractedLabValue[];
  fileName?: string;
  rawOcrText?: string;
  rawAiJson?: unknown;
  symptomConnections?: {
    symptom: string;
    relatedBiomarkers?: string[];
    explanation?: string;
  }[];
  plainSummary?: string;
  longitudinalInsights?: string[];
}

export async function saveLabResult(args: SaveLabResultArgs) {
  const {
    userId,
    healthScore,
    riskLevel,
    summary,
    labValues,
    fileName = "Lab Report",
    rawOcrText,
    rawAiJson,
  } = args;

  if (!userId) {
    logger.error("saveLabResult: userId is missing");
    return { success: false, error: "User not authenticated." };
  }

  try {
    // Use the authenticated client so the RPC runs with "authenticated" role.
    // The save_complete_report function is SECURITY DEFINER, meaning it has
    // full DB privileges regardless of the caller's role — but the caller must
    // still have EXECUTE permission, which is granted to `authenticated`.
    const supabase = await getAuthClient();

    // SECURITY: Verify that the userId in the payload matches the session user.
    // This prevents IDOR attacks where a caller passes another user's ID.
    const { data: { user: sessionUser } } = await supabase.auth.getUser();
    if (!sessionUser || sessionUser.id !== userId) {
      logger.error(`saveLabResult: userId mismatch (payload=${userId}, session=${sessionUser?.id})`);
      return { success: false, error: "Unauthorized: session does not match target user." };
    }

    // Use explicit inserts instead of the save_complete_report RPC. Some live
    // Supabase environments may still have an old/stale RPC definition with
    // biomarker columns ordered incorrectly, which can try to insert a UUID into
    // lab_result_id (BIGINT). Explicit column inserts make the save path obvious.
    const db = supabaseAdmin ?? supabase;

    const { data: labResult, error: reportError } = await db
      .from("lab_results")
      .insert({
        user_id: userId,
        file_name: fileName,
        health_score: healthScore,
        risk_level: riskLevel,
        summary,
        plain_summary: args.plainSummary ?? null,
        processed: true,
        raw_ocr_text: rawOcrText ?? null,
        raw_ai_json: rawAiJson ?? null,
        symptom_connections: args.symptomConnections ?? null,
        uploaded_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (reportError || !labResult?.id) {
      logger.error("saveLabResult lab_results insert error:", reportError);
      throw new Error(reportError?.message || "Lab result insert returned no id.");
    }

    const labResultId = labResult.id as string; // UUID in production DB

    const biomarkerRows = labValues.map((b) => ({
      user_id: userId,
      lab_result_id: labResultId,
      name: b.name,
      value: b.value,
      unit: b.unit,
      status: b.status,
      reference_range_min: b.referenceMin ?? null,
      reference_range_max: b.referenceMax ?? null,
      category: b.category,
      confidence: b.confidence,
      ai_interpretation: b.aiInterpretation,
    }));

    const { error: biomarkerError } = await db
      .from("biomarkers")
      .insert(biomarkerRows);

    if (biomarkerError) {
      logger.error("saveLabResult biomarkers insert error:", biomarkerError);
      await db.from("lab_results").delete().eq("id", labResultId);
      throw new Error(biomarkerError.message);
    }

    logger.info(`saveLabResult: saved report ${labResultId} for user ${userId}`);
    return { success: true, labResultId };

  } catch (error: unknown) {
    const msg = (error as Error).message;
    logger.error("saveLabResult failed:", msg);
    return { success: false, error: `Database Error: ${msg}` };
  }
}

const reviewedBiomarkerSchema = z.object({
  name: z.string().trim().min(1, "Biomarker name is required"),
  value: z.coerce.number().refine((n) => !Number.isNaN(n), "Value must be numeric"),
  unit: z.string().trim().default("unit").transform((u) => u || "unit"),
  status: z.enum(["optimal", "warning", "critical"]),
  referenceMin: z.coerce.number().nullable().optional().catch(null),
  referenceMax: z.coerce.number().nullable().optional().catch(null),
  rangePosition: z.coerce.number().min(0).max(100).optional().default(50),
  confidence: z.coerce.number().min(0).max(1).optional().default(0.8),
  aiInterpretation: z.string().optional().default("Review this value with your clinician."),
  trend: z.string().optional().default(""),
  category: z.enum(["hematology", "inflammation", "metabolic", "vitamins", "other"]).optional().default("other"),
});

const reviewedReportSchema = z.object({
  fileName: z.string().trim().min(1).default("Reviewed Lab Report"),
  healthScore: z.coerce.number().int().min(0).max(100),
  riskLevel: z.enum(["low", "moderate", "high"]),
  summary: z.string().trim().min(1),
  biomarkers: z.array(reviewedBiomarkerSchema).min(1, "At least one biomarker is required."),
  rawOcrText: z.string().optional(),
  rawAiJson: z.unknown().optional(),
  symptomConnections: z.array(z.object({
    symptom: z.string(),
    biomarker: z.string().optional(),
    relevance: z.string().optional(),
    relatedBiomarkers: z.array(z.string()).optional(),
    explanation: z.string().optional(),
  })).optional(),
  plainSummary: z.string().optional(),
});

export async function saveReviewedReportFromSession(input: unknown) {
  const supabase = await getAuthClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    logger.error("saveReviewedReportFromSession — no user found", userError);
    return { success: false, error: "No user session" };
  }

  const parsed = reviewedReportSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid reviewed report data.",
    };
  }

  const report = parsed.data;
  return saveLabResult({
    userId: user.id,
    healthScore: report.healthScore,
    riskLevel: report.riskLevel,
    summary: report.summary,
    labValues: report.biomarkers as ExtractedLabValue[],
    fileName: report.fileName,
    rawOcrText: report.rawOcrText,
    rawAiJson: report.rawAiJson,
    symptomConnections: report.symptomConnections,
    plainSummary: report.plainSummary,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// deleteLabResult — hard-delete a single report (cascades to biomarkers)
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteLabResult(labResultId: number | string) {
  // lab_results.id is a UUID string in the live DB — never parseInt a UUID.
  const id = String(labResultId).trim();
  if (!id) {
    return { success: false, error: "Invalid report ID" };
  }

  try {
    // Use authenticated client — RLS ensures the user can only delete their own rows.
    // Delete biomarkers explicitly first because some deployed databases may not
    // have ON DELETE CASCADE on biomarkers.lab_result_id even if the current
    // schema does.
    const supabase = await getAuthClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "User not authenticated." };
    }

    const db = supabaseAdmin ?? supabase;

    const { data: report, error: reportLookupError } = await db
      .from("lab_results")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (reportLookupError || !report?.id) {
      logger.error("deleteLabResult report lookup failed:", reportLookupError);
      return { success: false, error: "Report not found or already deleted." };
    }

    const { error: biomarkerError } = await db
      .from("biomarkers")
      .delete()
      .eq("lab_result_id", id)
      .eq("user_id", user.id);

    if (biomarkerError) throw biomarkerError;

    const { error: reportError } = await db
      .from("lab_results")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (reportError) throw reportError;
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    logger.error("deleteLabResult failed:", msg);
    return { success: false, error: msg };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// updateUserProfile — update profile fields + replace symptoms
// ─────────────────────────────────────────────────────────────────────────────

export async function updateUserProfile(
  userId: string,
  data: {
    first_name?: string;
    last_name?: string;
    age?: number;
    sex?: string;
    blood_type?: string;
    symptoms?: string[];
  }
) {
  // SECURITY: Verify that the userId matches the authenticated session.
  // Use the authenticated client by default so normal profile edits do not
  // depend on the service role key. If the admin client is configured, it can
  // still be used after this ownership check.
  let supabase: Awaited<ReturnType<typeof getAuthClient>>;
  try {
    supabase = await getAuthClient();
    const { data: { user: sessionUser } } = await supabase.auth.getUser();
    if (!sessionUser || sessionUser.id !== userId) {
      logger.error(`updateUserProfile: userId mismatch (payload=${userId}, session=${sessionUser?.id})`);
      return { success: false, error: "Unauthorized: session does not match target user." };
    }
  } catch (authErr) {
    logger.error("updateUserProfile: auth verification failed", authErr);
    return { success: false, error: "Authentication verification failed." };
  }

  try {
    const { first_name, last_name, age, sex, blood_type, symptoms } = data;
    const db = supabaseAdmin ?? supabase;

    const profileUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (first_name !== undefined) profileUpdates.first_name = first_name;
    if (last_name !== undefined) profileUpdates.last_name = last_name;
    if (age !== undefined) profileUpdates.age = age;
    if (sex !== undefined) profileUpdates.sex = sex;
    if (blood_type !== undefined) profileUpdates.blood_type = blood_type;

    const { error: profileError } = await db
      .from("profiles")
      .update(profileUpdates)
      .eq("id", userId);

    if (profileError) throw profileError;

    if (symptoms !== undefined) {
      await db.from("symptoms").delete().eq("user_id", userId);
      if (symptoms.length > 0) {
        const { error: sympError } = await db
          .from("symptoms")
          .insert(symptoms.map((s) => ({ user_id: userId, symptom: s })));
        if (sympError) throw sympError;
      }
    }

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    logger.error("updateUserProfile failed:", msg);
    return { success: false, error: msg };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getUserBiomarkerHistory — fetch the last 100 biomarkers for a user.
//
// Uses the authenticated client (cookies) so RLS correctly scopes results
// to the logged-in user without requiring the service role key.
// ─────────────────────────────────────────────────────────────────────────────

export async function getUserBiomarkerHistory(userId: string) {
  if (!userId) return [];

  try {
    const supabase = await getAuthClient();

    const [{ data, error }, { data: labResults }] = await Promise.all([
      supabase
        .from("biomarkers")
        .select(
          "id, name, value, unit, status, category, reference_range_min, reference_range_max, ai_interpretation, lab_result_id, created_at, lab_results!inner(user_id, uploaded_at, created_at)"
        )
        .eq("lab_results.user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("lab_results")
        .select("id, uploaded_at, created_at, raw_ai_json")
        .eq("user_id", userId)
        .order("uploaded_at", { ascending: false })
        .limit(10),
    ]);

    if (error) {
      logger.error("getUserBiomarkerHistory query error:", error.message);
      return [];
    }
    return mergeBiomarkerSources(data as Biomarker[] | null, labResults || []).slice(0, 100);
  } catch (error) {
    logger.error(
      "getUserBiomarkerHistory failed:",
      (error as Error).message
    );
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// completeOnboarding — mark onboarding done and set the cookie
// ─────────────────────────────────────────────────────────────────────────────

export async function completeOnboarding() {
  const supabase = await getAuthClient();
  const cookieStore = await cookies();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    logger.error("completeOnboarding — no user found", userError);
    return { success: false, error: "No user session" };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ onboarding_complete: true })
    .eq("id", user.id);

  if (updateError) {
    logger.error("completeOnboarding — update failed", updateError);
    return { success: false, error: updateError.message };
  }

  cookieStore.set("onboarding_complete", "true", {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// saveProfileFromSession — update profile during onboarding using session auth
// ─────────────────────────────────────────────────────────────────────────────

export async function saveProfileFromSession(data: {
  first_name?: string;
  last_name?: string;
  age?: number;
  sex?: string;
  blood_type?: string;
  symptoms?: string[];
}) {
  const supabase = await getAuthClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    logger.error("saveProfileFromSession — no user found", userError);
    return { success: false, error: "No user session" };
  }

  try {
    const { first_name, last_name, age, sex, blood_type, symptoms } = data;

    const profileUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (first_name !== undefined && first_name !== "")
      profileUpdates.first_name = first_name;
    if (last_name !== undefined) profileUpdates.last_name = last_name;
    if (age !== undefined) profileUpdates.age = age;
    if (sex !== undefined) profileUpdates.sex = sex;
    if (blood_type !== undefined) profileUpdates.blood_type = blood_type;

    const { error: profileError } = await supabase
      .from("profiles")
      .update(profileUpdates)
      .eq("id", user.id);

    if (profileError) {
      logger.error("saveProfileFromSession — profile update failed", profileError);
      throw profileError;
    }

    if (symptoms !== undefined) {
      await supabase.from("symptoms").delete().eq("user_id", user.id);
      if (symptoms.length > 0) {
        const { error: sympError } = await supabase
          .from("symptoms")
          .insert(symptoms.map((s) => ({ user_id: user.id, symptom: s })));
        if (sympError) {
          logger.error("saveProfileFromSession — symptoms insert failed", sympError);
        }
      }
    }

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    logger.error("saveProfileFromSession failed:", msg);
    return { success: false, error: msg };
  }
}
