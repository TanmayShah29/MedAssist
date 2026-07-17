import { apiResponse } from "@/lib/api-response";
import { getAuthClient } from "@/lib/supabase/server";
import { findBiomarkerKnowledge, normalizeBiomarkerName } from "@/lib/health-companion";
import { checkRateLimit } from "@/services/rateLimitService";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const rateLimit = await checkRateLimit();
    if (!rateLimit.success) return apiResponse({ error: "Rate limit exceeded" }, { status: 429 });

    const { name } = await params;

    let decodedName: string;
    try {
      decodedName = decodeURIComponent(name);
    } catch {
      return apiResponse({ error: "Invalid biomarker name" }, { status: 400 });
    }

    const fallback = findBiomarkerKnowledge(decodedName);

    const supabase = await getAuthClient();
    const normalized = normalizeBiomarkerName(decodedName);

    const { data, error } = await supabase
      .from("biomarker_aliases")
      .select("alias, biomarker_knowledge(canonical_name, category, plain_english, common_questions)")
      .eq("normalized_alias", normalized)
      .maybeSingle();

    if (data?.biomarker_knowledge) {
      return apiResponse({ knowledge: data.biomarker_knowledge });
    }

    return apiResponse({
      knowledge: fallback,
      warning: error?.message,
    }, { status: fallback ? 200 : 404 });
  } catch (error) {
    return apiResponse({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
