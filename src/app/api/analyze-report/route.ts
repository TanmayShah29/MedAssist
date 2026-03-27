import { NextRequest, NextResponse } from 'next/server';
import { validateEnv } from '@/lib/env';
import { extractTextFromPdf, ImageBasedPdfError } from '@/services/extractionService';
import { analyzeLabText } from '@/services/aiAnalysisService';
import { getUserBiomarkerHistory, saveLabResult } from '@/app/actions/user-data';
import { ExtractedLabValue } from '@/lib/onboarding-store';
import { checkRateLimit } from '@/services/rateLimitService';
import { logger } from '@/lib/logger';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

/** Client can use this to show clean image-based PDF message and manual entry option. */
export const IMAGE_BASED_PDF_ERROR_CODE = 'IMAGE_BASED_PDF';

export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        validateEnv();
        const rateLimitResult = await checkRateLimit();
        if (!rateLimitResult.success) {
            logger.warn(`Rate limit exceeded: ${rateLimitResult.message}`);
            return NextResponse.json(
                { success: false, error: rateLimitResult.message },
                { status: 429, headers: { 'Retry-After': (rateLimitResult.retryAfter || 60).toString() } }
            );
        }

        // Require auth to prevent quota abuse
        const cookieStore = await cookies();
        const supabaseAuth = createServerClient(
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
        const { data: { user: authUser } } = await supabaseAuth.auth.getUser();
        if (!authUser) {
            return NextResponse.json(
                { success: false, error: 'Sign in to analyze reports.' },
                { status: 401 }
            );
        }

        // Section 1b — Per-user rate limit: max 5 uploads per hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { count: uploadCount } = await supabaseAuth
            .from('lab_results')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', authUser.id)
            .gte('uploaded_at', oneHourAgo);
        if (uploadCount !== null && uploadCount >= 5) {
            return NextResponse.json(
                { success: false, error: 'Rate limit exceeded. You can analyze up to 5 reports per hour. Please try again later.' },
                { status: 429 }
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
            return NextResponse.json({ success: false, error: 'File size exceeds 10MB limit.' }, { status: 400 });
        }

        // Section 1d — Server-side file type validation
        const allowedMimeTypes = ['application/pdf'];
        const fileName = file.name.toLowerCase();
        if (!allowedMimeTypes.includes(file.type) || !fileName.endsWith('.pdf')) {
            return NextResponse.json(
                { success: false, error: 'Invalid file type. Only PDF files are accepted.' },
                { status: 400 }
            );
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

        if (!extractedText || extractedText.trim().length < 50) {
            return NextResponse.json({
                success: false,
                error: 'Could not extract enough text from this PDF. Please ensure it is a digital lab report and not a scan or photo.',
                code: IMAGE_BASED_PDF_ERROR_CODE
            }, { status: 400 });
        }
        logger.info("Text extracted successfully.");

        let history: Awaited<ReturnType<typeof getUserBiomarkerHistory>> = [];
        // Fetch history and user symptoms in parallel
        const [historyResult, symptomsResult] = await Promise.all([
            getUserBiomarkerHistory(authUser.id),
            supabaseAuth.from('symptoms').select('symptom').eq('user_id', authUser.id)
        ]);
        history = historyResult;
        const userSymptoms = (symptomsResult.data || []).map((s: { symptom: string }) => s.symptom);
        logger.info(`Fetched ${history.length} historical biomarkers for user ${authUser.id}`);

        logger.info("Starting AI analysis...");
        const analysisResult = await analyzeLabText(extractedText, { symptoms: userSymptoms, history });

        // 6. Data Persistence
        const saveResult = await saveLabResult({
            userId: authUser.id,
            healthScore: analysisResult.healthScore,
            riskLevel: analysisResult.riskLevel,
            summary: analysisResult.summary,
            labValues: analysisResult.biomarkers as ExtractedLabValue[],
            fileName: file.name,
            rawOcrText: extractedText,
            rawAiJson: analysisResult,
            symptomConnections: analysisResult.symptomConnections,
            plainSummary: analysisResult.plainSummary
        });

        if (!saveResult.success) {
            logger.error("Failed to save via action:", saveResult.error);
            return NextResponse.json(
                { success: false, error: saveResult.error || 'Failed to save results. Please try again.' },
                { status: 500 }
            );
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

    const manualPayloadSchema = z.object({
        biomarkers: z.array(z.object({
            name: z.string().trim().min(1),
            value: z.union([z.number(), z.string()]).transform(v => Number(v)).refine(n => !Number.isNaN(n)),
            unit: z.string().trim().default('unit').transform(u => u || 'unit')
        })).min(1, 'Please add at least one biomarker with a valid name and numeric value.')
    });

    let payloadRaw;
    try {
        payloadRaw = JSON.parse(manualPayloadRaw);
    } catch {
        return NextResponse.json({ success: false, error: 'Invalid manual entry data format.' }, { status: 400 });
    }

    const parseResult = manualPayloadSchema.safeParse(payloadRaw);
    if (!parseResult.success) {
        return NextResponse.json({ success: false, error: parseResult.error.issues[0]?.message || 'Invalid data.' }, { status: 400 });
    }

    const normalized = parseResult.data.biomarkers;

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
        labValues: analysisResult.biomarkers as ExtractedLabValue[],
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
