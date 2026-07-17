import { NextRequest, NextResponse } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { validateContentLength } from "@/lib/request-validation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    validateContentLength(request);

    const supabase = await getAuthClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return apiResponse({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { choice } = body;

    if (!choice || !["accepted", "rejected"].includes(choice)) {
      return apiResponse(
        { error: "Invalid consent choice" },
        { status: 400 }
      );
    }

    const rawIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null;
    const hashedIp = rawIp ? crypto.createHash("sha256").update(rawIp).digest("hex") : null;

    const record = {
      user_id: user.id,
      choice,
      ip_address: hashedIp,
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
