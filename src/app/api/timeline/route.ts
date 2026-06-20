import { apiResponse } from "@/lib/api-response";
import { getAuthClient } from "@/lib/supabase/server";
import { buildTimeline } from "@/lib/health-companion";
import { mergeBiomarkerSources } from "@/lib/medical-data";
import type { Biomarker, LabResult } from "@/types/medical";

export async function GET() {
  const supabase = await getAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiResponse({ error: "Unauthorized" }, { status: 401 });

  const [reportResult, biomarkerResult, actionsResult] = await Promise.all([
    supabase
      .from("lab_results")
      .select("id, file_name, uploaded_at, created_at, summary, plain_summary, raw_ai_json")
      .eq("user_id", user.id)
      .order("uploaded_at", { ascending: false })
      .limit(20),
    supabase
      .from("biomarkers")
      .select("*, lab_results!inner(user_id, uploaded_at, created_at)")
      .eq("lab_results.user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("care_plan_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const biomarkers = mergeBiomarkerSources(
    biomarkerResult.data as Biomarker[] | null,
    reportResult.data || []
  );

  return apiResponse({
    timeline: buildTimeline({
      labResults: (reportResult.data || []) as LabResult[],
      biomarkers,
      actions: actionsResult.data || [],
    }),
    warnings: [reportResult.error?.message, biomarkerResult.error?.message, actionsResult.error?.message].filter(Boolean),
  });
}
