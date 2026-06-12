import { NextRequest, NextResponse } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { validateContentLength } from "@/lib/request-validation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    validateContentLength(request);
    const body = await request.json();
    const { choice, userId } = body;

    if (!choice || !["accepted", "rejected"].includes(choice)) {
      return apiResponse(
        { error: "Invalid consent choice" },
        { status: 400 }
      );
    }

    const record = {
      user_id: userId || null,
      choice,
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
      user_agent: request.headers.get("user-agent") || null,
      consented_at: new Date().toISOString(),
    };

    if (!supabaseAdmin) {
      logger.warn("Consent: supabaseAdmin not available — recording locally only");
      return apiResponse({ success: true, recordedLocally: true });
    }

    const { error } = await supabaseAdmin
      .from("consent_log")
      .insert(record);

    if (error) {
      logger.error("Failed to record consent:", error);
      return apiResponse(
        { error: "Failed to record consent" },
        { status: 500 }
      );
    }

    return apiResponse({ success: true });
  } catch (error) {
    logger.error("Consent API error:", error);
    return apiResponse(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
