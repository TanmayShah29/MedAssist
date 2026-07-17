import { NextRequest } from "next/server";
import { z } from "zod";
import { apiResponse } from "@/lib/api-response";
import { getAuthClient } from "@/lib/supabase/server";
import { generateCarePlanItems } from "@/lib/health-companion";
import { latestUniqueBiomarkers, mergeBiomarkerSources } from "@/lib/medical-data";
import { checkRateLimit } from "@/services/rateLimitService";
import type { Biomarker } from "@/types/medical";

const createCarePlanSchema = z.object({
  title: z.string().trim().min(1).max(160),
  reason: z.string().trim().max(1000).optional().default("Added by you."),
  kind: z.enum(["ask_doctor", "monitor", "lifestyle", "retest"]),
  timeframe: z.string().trim().max(120).optional(),
  related_biomarkers: z.array(z.string().trim().min(1)).optional().default([]),
});

export async function GET() {
  try {
    const rateLimit = await checkRateLimit();
    if (!rateLimit.success) return apiResponse({ error: "Rate limit exceeded" }, { status: 429 });

    const supabase = await getAuthClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, { status: 401 });

    const { data: storedItems, error: storedError } = await supabase
      .from("care_plan_items")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "dismissed")
      .order("created_at", { ascending: false });

    const [biomarkerResult, reportResult, symptomResult] = await Promise.all([
      supabase
        .from("biomarkers")
        .select("*, lab_results!inner(user_id, uploaded_at, created_at)")
        .eq("lab_results.user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("lab_results")
        .select("id, uploaded_at, created_at, raw_ai_json")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false }),
      supabase.from("symptoms").select("symptom").eq("user_id", user.id),
    ]);

    const biomarkers = mergeBiomarkerSources(
      biomarkerResult.data as Biomarker[] | null,
      reportResult.data || []
    );

    const generated = generateCarePlanItems({
      biomarkers: latestUniqueBiomarkers(biomarkers),
      reportCount: reportResult.data?.length ?? 0,
      symptomCount: symptomResult.data?.length ?? 0,
    });

    if (storedError) {
      return apiResponse({ error: storedError.message }, { status: 500 });
    }

    return apiResponse({
      carePlan: [...(storedItems || []), ...generated],
      stored: storedItems || [],
      generated,
    });
  } catch (error) {
    return apiResponse({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await checkRateLimit();
    if (!rateLimit.success) return apiResponse({ error: "Rate limit exceeded" }, { status: 429 });

    const supabase = await getAuthClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, { status: 401 });

    const parsed = createCarePlanSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return apiResponse({ error: parsed.error.issues[0]?.message || "Invalid care plan item" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("care_plan_items")
      .insert({
        user_id: user.id,
        ...parsed.data,
        status: "not_started",
        source: "user",
      })
      .select()
      .single();

    if (error) return apiResponse({ error: error.message }, { status: 500 });
    return apiResponse({ item: data }, { status: 201 });
  } catch (error) {
    return apiResponse({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
