import { apiResponse } from "@/lib/api-response";
import { getAuthClient } from "@/lib/supabase/server";
import { getTopTrendChanges, getVisitFocus } from "@/lib/health-companion";
import { latestUniqueBiomarkers, mergeBiomarkerSources } from "@/lib/medical-data";
import { checkRateLimit } from "@/services/rateLimitService";
import type { Biomarker } from "@/types/medical";

export async function POST() {
  try {
    const rateLimit = await checkRateLimit();
    if (!rateLimit.success) return apiResponse({ error: "Rate limit exceeded" }, { status: 429 });

    const supabase = await getAuthClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, { status: 401 });

    const [biomarkerResult, reportResult] = await Promise.all([
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
    ]);

    const biomarkers = mergeBiomarkerSources(
      biomarkerResult.data as Biomarker[] | null,
      reportResult.data || []
    );
    const latest = latestUniqueBiomarkers(biomarkers);
    const latestReportId = reportResult.data?.[0]?.id as string | undefined;
    const focus = getVisitFocus(latest);
    const trends = getTopTrendChanges(latest, biomarkers, latestReportId);

    const generated = [
      {
        user_id: user.id,
        lab_result_id: latestReportId,
        insight_type: "visit_focus",
        title: focus.title,
        body: focus.detail,
        severity: focus.biomarkers.some((b) => b.status === "critical") ? "critical" : focus.biomarkers.length ? "warning" : "info",
        related_biomarkers: focus.biomarkers.map((b) => b.name),
        source: "generated",
      },
      ...trends.map((trend) => ({
        user_id: user.id,
        lab_result_id: latestReportId,
        insight_type: "trend_change",
        title: trend.title,
        body: trend.detail || "Meaningful change since the prior report.",
        severity: trend.biomarker.status === "critical" ? "critical" : trend.biomarker.status === "warning" ? "warning" : "info",
        related_biomarkers: [trend.biomarker.name],
        source: "generated",
      })),
    ];

    const { data, error } = await supabase
      .from("insights")
      .insert(generated)
      .select();

    if (error) {
      return apiResponse({ error: error.message }, { status: 500 });
    }

    return apiResponse({ insights: data || generated });
  } catch (error) {
    return apiResponse({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
