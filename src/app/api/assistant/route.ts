import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { checkRateLimit } from "@/services/rateLimitService";
import { generateClinicalInsight } from "@/lib/groq-medical";
import { logger } from "@/lib/logger";

import { z } from "zod";

export const maxDuration = 60;
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // Ignored
                        }
                    }
                }
            }
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const limit = await checkRateLimit();

        if (!limit.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: limit.message || "Too Many Requests",
                    retryAfter: limit.retryAfter
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(limit.retryAfter || 60)
                    }
                }
            );
        }

        // 3. Process Request with Zod
        const requestSchema = z.object({
            prompt: z.string().min(1, "Missing prompt").max(2000, "Prompt too long"),
            contextType: z.enum(['symptom', 'lab']).optional().default('symptom')
        });

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
        }

        const parseResult = requestSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { success: false, error: parseResult.error.issues[0]?.message || "Invalid input" },
                { status: 400 }
            );
        }

        const { prompt, contextType } = parseResult.data;

        // 4. Call Groq AI Logic
        // We reuse the existing function which now uses Groq internally.
        const result = await generateClinicalInsight(prompt, contextType || 'symptom');

        if (!result.success) {
            logger.error(`[Assistant API] Clinical insight generation failed: ${result.error}`);
            return NextResponse.json(
                { success: false, error: result.error || "Clinical insight generation failed" },
                { status: result.status || 500 }
            );
        }

        return NextResponse.json(result);

    } catch (error) {
        logger.error("API Error", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
