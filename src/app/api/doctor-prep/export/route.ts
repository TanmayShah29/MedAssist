import { NextRequest } from "next/server";
import { z } from "zod";
import { apiResponse } from "@/lib/api-response";
import { getAuthClient } from "@/lib/supabase/server";

const exportSchema = z.object({
  format: z.enum(["pdf", "json", "csv"]).default("json"),
  sections: z.array(z.string()).default(["summary", "questions", "actions", "labs"]),
});

export async function POST(request: NextRequest) {
  const supabase = await getAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiResponse({ error: "Unauthorized" }, { status: 401 });

  const parsed = exportSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return apiResponse({ error: "Invalid export request" }, { status: 400 });

  const [reports, actions, biomarkers] = await Promise.all([
    supabase.from("lab_results").select("id, uploaded_at, file_name, plain_summary, summary").eq("user_id", user.id).order("uploaded_at", { ascending: false }).limit(1),
    supabase.from("care_plan_items").select("*").eq("user_id", user.id).neq("status", "dismissed").order("created_at", { ascending: false }).limit(20),
    supabase.from("biomarkers").select("name, value, unit, status, category, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(80),
  ]);

  const payload = {
    generatedAt: new Date().toISOString(),
    latestReport: reports.data?.[0] || null,
    actions: actions.data || [],
    biomarkers: biomarkers.data || [],
    disclaimer: "Educational visit-prep summary only. Review with a qualified clinician.",
  };

  const { data, error } = await supabase
    .from("exports")
    .insert({
      user_id: user.id,
      export_type: "doctor_prep",
      format: parsed.data.format,
      sections: parsed.data.sections,
      payload,
    })
    .select()
    .single();

  return apiResponse({
    export: data || { format: parsed.data.format, sections: parsed.data.sections, payload },
    warning: error?.message,
  });
}
