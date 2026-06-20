import { apiResponse } from "@/lib/api-response";
import { getAuthClient } from "@/lib/supabase/server";
import { findBiomarkerKnowledge, normalizeBiomarkerName } from "@/lib/health-companion";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
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
}
