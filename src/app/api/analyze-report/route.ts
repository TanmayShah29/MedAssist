import { NextRequest, NextResponse } from 'next/server';
import { extractPdfText } from '@/lib/extractPdfText';
import { generateClinicalInsight } from '@/app/actions/groq-actions';
import { checkRateLimit } from '@/services/rateLimitService'; // Import the rate limit service
import { logger } from '@/lib/logger'; // Import logger

// Configure route settings for long-running processes
export const maxDuration = 60; // 60 seconds (Vercel Pro/Hobby limit)
export const runtime = "nodejs";

// Groq is now handled in the action

export async function POST(req: NextRequest) {
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

        // 2. Read File as ArrayBuffer -> Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 3. Step 1: Extract Text using Gemini (PDF -> Text)
        logger.info("Starting text extraction with Gemini...");
        const extractedText = await extractPdfText(buffer);
        logger.info("Text extracted successfully.");

        // 4. Step 2: Analyze Text using Groq (Text -> Analysis)
        logger.info("Starting analysis with Groq (via Action)...");

        const analysisResult = await generateClinicalInsight(extractedText, 'report');

        if (!analysisResult.success) {
            logger.error(`Clinical insight generation failed: ${analysisResult.error}`);
            throw new Error(analysisResult.error || 'Clinical insight generation failed');
        }

        const analysis = JSON.stringify(analysisResult.data);

        return NextResponse.json({
            success: true,
            extractedText,
            analysis
        });

    } catch (error: unknown) {
        logger.error("Pipeline Error:", (error as Error).message);
        return NextResponse.json({ success: false, error: (error as Error).message || 'Analysis failed' }, { status: 500 });
    }
}
