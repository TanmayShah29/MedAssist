import { NextRequest, NextResponse } from 'next/server';
import { extractPdfText } from '@/lib/extractPdfText';
import { generateClinicalInsight } from '@/app/actions/groq-actions';
import { checkRateLimit } from '@/services/rateLimitService'; // Import the rate limit service
import { logger } from '@/lib/logger'; // Import logger
import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Import directly from SSR package
import { cookies } from 'next/headers'; // Import cookies utility

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

        // 5. EXTRACTED DATA PERSISTENCE
        // We need to save the lab result and biomarkers to Supabase

        // Initialize Supabase Server Client
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

        if (user) {
            // A. Save Lab Result
            const { data: labResult, error: labError } = await supabase
                .from('lab_results')
                .insert({
                    user_id: user.id,
                    file_name: file.name || 'Lab Report',
                    processed: true,
                    processing_time_ms: Date.now() - (req as any).startTime || 0 // approximate if not tracked
                })
                .select()
                .single();

            if (labError) {
                logger.error("Failed to save lab result", labError);
                // We don't block response, but we log it. 
                // actually user requested to throw error if fails? 
                // "If the insert code is missing ... add it ... if (labError) throw new Error..."
                throw new Error('Failed to save lab result: ' + labError.message);
            }

            // B. Save Biomarkers
            const biomarkers = analysisResult.data.biomarkers || analysisResult.data.details || [];
            if (biomarkers.length > 0) {
                const { error: bioError } = await supabase
                    .from('biomarkers')
                    .insert(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        biomarkers.map((b: any) => ({
                            user_id: user.id,
                            lab_result_id: labResult.id,
                            name: b.name || b.label, // handle both schema variations
                            value: typeof b.value === 'string' ? parseFloat(b.value.replace(/[^0-9.]/g, '')) : b.value,
                            unit: b.unit || '',
                            status: normalizeStatus(b.status),
                            reference_min: b.range ? b.range[0] : null,
                            reference_max: b.range ? b.range[1] : null,
                            category: b.category || 'general',
                            confidence: analysisResult.data.confidence || 0,
                            ai_interpretation: b.aiInterpretation || analysisResult.data.summary
                        }))
                    );

                if (bioError) {
                    throw new Error('Failed to save biomarkers: ' + bioError.message);
                }
            }
        }

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

function normalizeStatus(status: string): 'optimal' | 'warning' | 'critical' {
    const s = status?.toLowerCase();
    if (s === 'normal' || s === 'optimal' || s === 'stable') return 'optimal';
    if (s === 'warning' || s === 'monitor' || s === 'borderline') return 'warning';
    if (s === 'critical' || s === 'high' || s === 'low' || s === 'action') return 'critical';
    return 'warning';
}
