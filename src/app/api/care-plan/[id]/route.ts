import { NextRequest } from "next/server";
import { z } from "zod";
import { apiResponse } from "@/lib/api-response";
import { getAuthClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/services/rateLimitService";

const updateCarePlanSchema = z.object({
  status: z.enum(["not_started", "in_progress", "done", "dismissed"]).optional(),
  title: z.string().trim().min(1).max(160).optional(),
  reason: z.string().trim().max(1000).optional(),
  timeframe: z.string().trim().max(120).nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimit = await checkRateLimit();
    if (!rateLimit.success) return apiResponse({ error: "Rate limit exceeded" }, { status: 429 });

    const supabase = await getAuthClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const parsed = updateCarePlanSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return apiResponse({ error: parsed.error.issues[0]?.message || "Invalid update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("care_plan_items")
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) return apiResponse({ error: error.message }, { status: 500 });
    return apiResponse({ item: data });
  } catch (error) {
    return apiResponse({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
