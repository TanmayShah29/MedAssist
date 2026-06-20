import { NextRequest } from "next/server";
import { z } from "zod";
import { apiResponse } from "@/lib/api-response";
import { getAuthClient } from "@/lib/supabase/server";

const shareSchema = z.object({
  title: z.string().trim().min(1).max(120).default("Doctor prep pack"),
  sections: z.array(z.string()).default(["summary", "questions", "actions", "labs"]),
  expiresInDays: z.number().int().min(1).max(30).default(7),
});

export async function POST(request: NextRequest) {
  const supabase = await getAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiResponse({ error: "Unauthorized" }, { status: 401 });

  const parsed = shareSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return apiResponse({ error: "Invalid share request" }, { status: 400 });

  const expiresAt = new Date(Date.now() + parsed.data.expiresInDays * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from("share_links")
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      sections: parsed.data.sections,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) return apiResponse({ error: error.message }, { status: 500 });

  return apiResponse({
    shareLink: data,
    url: `/share/${data.token}`,
  }, { status: 201 });
}
