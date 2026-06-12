import { NextRequest, NextResponse } from "next/server";
import { getAuthClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const supabase = await getAuthClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [profile, labResults, biomarkers, symptoms, conversations, supplements] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("lab_results").select("*").eq("user_id", user.id),
      supabase.from("biomarkers").select("*").eq("user_id", user.id),
      supabase.from("symptoms").select("*").eq("user_id", user.id),
      supabase.from("conversations").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
      supabase.from("supplements").select("*").eq("user_id", user.id),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      profile: profile.data,
      lab_results: labResults.data,
      biomarkers: biomarkers.data,
      symptoms: symptoms.data,
      conversations: conversations.data,
      supplements: supplements.data,
    };

    return NextResponse.json(exportData, {
      headers: {
        "Content-Disposition": 'attachment; filename="medassist-data-export.json"',
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    logger.error("Data export failed:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
