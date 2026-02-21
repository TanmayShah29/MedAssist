import { NextRequest, NextResponse } from 'next/server';
import { extractPdfText } from '@/lib/extractPdfText';
import { extractAndInterpretBiomarkers, BiomarkerContext } from '@/lib/groq-medical';
import { checkRateLimit } from '@/services/rateLimitService';
import { logger } from '@/lib/logger';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { saveLabResult, getUserBiomarkerHistory } from '@/app/actions/user-data';
import { validateAndRecalculateScore } from '@/lib/health-logic';

export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const startTime = Date.now();
    try {
        // 0. Check Rate Limit
        const rateLimitResult = await checkRateLimit();
        if (!rateLimitResult.success) {
            logger.warn(`Rate limit exceeded: ${rateLimitResult.message}`);
            return NextResponse.json(
                { success: false, error: rateLimitResult.message },
                { status: 429, headers: { 'Retry-After': (rateLimitResult.retryAfter || 60).toString() } }
            );
        }

        logger.info('[Analyze] NODE_ENV:', process.env.NODE_ENV);
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        // 1. Validate File Size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ success: false, error: 'File size exceeds 10MB limit' }, { status: 400 });
        }

        // 2. Read File
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 3. Extract Text
        logger.info("Starting text extraction...");

        const extractedText = await extractPdfText(buffer, file.type);
        logger.info("Text extracted successfully.");

        // 4. Authenticate & Fetch History
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        let history: BiomarkerContext[] = [];
        
        if (user) {
            history = await getUserBiomarkerHistory(user.id);
            logger.info(`Fetched ${history.length} historical biomarkers for user ${user.id}`);
        }

        // 5. Analyze with Groq (Extraction + Interpretation)
        logger.info("Starting analysis with Groq (groq-medical)...");

        // Passing empty symptoms array as we don't have them in this request context yet
        const analysisResult = await extractAndInterpretBiomarkers(extractedText, [], history);
        analysisResult.healthScore = validateAndRecalculateScore(analysisResult.healthScore, analysisResult.biomarkers);

        // 6. Data Persistence
        if (user) {
            const saveResult = await saveLabResult({
                userId: user.id,
                healthScore: analysisResult.healthScore,
                riskLevel: analysisResult.riskLevel,
                summary: analysisResult.summary,
                labValues: analysisResult.biomarkers as any,
                fileName: file.name,
                rawOcrText: extractedText,
                rawAiJson: analysisResult
            });

            if (!saveResult.success) {
                logger.error("Failed to save via action:", saveResult.error);
            }
        }

        return NextResponse.json({
            success: true,
            extractedText,
            analysis: JSON.stringify(analysisResult)
        });

    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            logger.error("Validation Error:", error.issues);
            return NextResponse.json({
                success: false,
                error: 'AI analysis validation failed. The report format may be unsupported.',
                details: error.issues
            }, { status: 422 });
        }

        logger.error("Pipeline Error:", (error as Error).message);
        return NextResponse.json({ success: false, error: (error as Error).message || 'Analysis failed' }, { status: 500 });
    }
}
