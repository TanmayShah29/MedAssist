import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { checkRateLimit } from "@/services/rateLimitService";
import { generateClinicalInsight } from "@/lib/groq-medical";
import { logger } from "@/lib/logger";

export const maxDuration = 60;
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
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

        // 3. Process Request
        const body = await req.json();
        const { prompt, contextType } = body;

        if (!prompt) {
            return NextResponse.json(
                { success: false, error: "Missing prompt" },
                { status: 400 }
            );
        }

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
