import { apiResponse } from "@/lib/api-response";

export const runtime = "nodejs";

export async function GET() {
  const checks = {
    database: false,
    ai_service: false,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  try {
    const { supabaseAdmin } = await import("@/lib/supabase-admin");
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from("rate_limits").select("fingerprint").limit(1);
      checks.database = !error;
    }
  } catch {
    checks.database = false;
  }

  try {
    const groqResponse = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      signal: AbortSignal.timeout(5000),
    });
    checks.ai_service = groqResponse.ok;
  } catch {
    checks.ai_service = false;
  }

  const isHealthy = checks.database && checks.ai_service;

  return apiResponse(
    { status: isHealthy ? "healthy" : "degraded", checks },
    { status: isHealthy ? 200 : 503 }
  );
}
