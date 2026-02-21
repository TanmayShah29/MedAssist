import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPdf, ImageBasedPdfError } from '@/services/extractionService';
import { analyzeLabText } from '@/services/aiAnalysisService';
import { getUserBiomarkerHistory } from '@/app/actions/user-data';
import { checkRateLimit } from '@/services/rateLimitService';
import { logger } from '@/lib/logger';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { saveLabResult } from '@/app/actions/user-data';

/** Client can use this to show clean image-based PDF message and manual entry option. */
export const IMAGE_BASED_PDF_ERROR_CODE = 'IMAGE_BASED_PDF';

export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
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
        const manualPayloadRaw = formData.get('manualPayload') as string | null;

        // ── Manual entry path (no file) ──
        if (!file && manualPayloadRaw) {
            return await handleManualEntry(manualPayloadRaw);
        }

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded. Upload a PDF or use manual entry.' }, { status: 400 });
        }

        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ success: false, error: 'File size exceeds 10MB limit' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        logger.info("Starting text extraction...");
        let extractedText: string;
        try {
            const result = await extractTextFromPdf(buffer, file.type, file.name);
            extractedText = result.text;
        } catch (extractErr) {
            if (extractErr instanceof ImageBasedPdfError) {
                return NextResponse.json(
                    { success: false, error: extractErr.message, code: IMAGE_BASED_PDF_ERROR_CODE },
                    { status: 400 }
                );
            }
            throw extractErr;
        }
        logger.info("Text extracted successfully.");

        // 4. Authenticate & Fetch History
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
                            // Ignored in route handlers
                        }
                    }
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        let history: Awaited<ReturnType<typeof getUserBiomarkerHistory>> = [];
        if (user) {
            history = await getUserBiomarkerHistory(user.id);
            logger.info(`Fetched ${history.length} historical biomarkers for user ${user.id}`);
        }

        logger.info("Starting AI analysis...");
        const analysisResult = await analyzeLabText(extractedText, { symptoms: [], history });

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
        if (error instanceof ImageBasedPdfError) {
            return NextResponse.json(
                { success: false, error: error.message, code: IMAGE_BASED_PDF_ERROR_CODE },
                { status: 400 }
            );
        }

        logger.error("Pipeline Error:", (error as Error).message);
        return NextResponse.json({ success: false, error: (error as Error).message || 'Analysis failed' }, { status: 500 });
    }
}

/** Build synthetic lab text from manual payload and run AI + save. */
async function handleManualEntry(manualPayloadRaw: string): Promise<NextResponse> {
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
        return NextResponse.json({ success: false, error: 'You must be signed in to save results.' }, { status: 401 });
    }

    let payload: { biomarkers: Array<{ name: string; value: number; unit: string }> };
    try {
        payload = JSON.parse(manualPayloadRaw) as typeof payload;
    } catch {
        return NextResponse.json({ success: false, error: 'Invalid manual entry data.' }, { status: 400 });
    }
    if (!payload?.biomarkers?.length) {
        return NextResponse.json({ success: false, error: 'Please add at least one biomarker (name, value, unit).' }, { status: 400 });
    }

    const normalized = payload.biomarkers
        .map((b) => ({
            name: String(b?.name ?? '').trim(),
            value: Number(b?.value),
            unit: String(b?.unit ?? 'unit').trim() || 'unit',
        }))
        .filter((b) => b.name.length > 0 && !Number.isNaN(b.value));

    if (normalized.length === 0) {
        return NextResponse.json({ success: false, error: 'Please add at least one biomarker with a valid name and numeric value.' }, { status: 400 });
    }

    const syntheticText = normalized
        .map((b) => `${b.name}: ${b.value} ${b.unit}`)
        .join('\n');
    const preamble = 'Lab values (manually entered):\n';
    const fullText = preamble + syntheticText;

    const history = await getUserBiomarkerHistory(user.id);
    const analysisResult = await analyzeLabText(fullText, { symptoms: [], history });

    const saveResult = await saveLabResult({
        userId: user.id,
        healthScore: analysisResult.healthScore,
        riskLevel: analysisResult.riskLevel,
        summary: analysisResult.summary,
        labValues: analysisResult.biomarkers as any,
        fileName: 'Manual entry',
        rawOcrText: undefined,
        rawAiJson: analysisResult
    });

    if (!saveResult.success) {
        logger.error("Failed to save manual report:", saveResult.error);
        return NextResponse.json({ success: false, error: saveResult.error || 'Failed to save.' }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        extractedText: fullText,
        analysis: JSON.stringify(analysisResult)
    });
}
