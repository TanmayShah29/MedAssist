import { NextRequest, NextResponse } from 'next/server';
import { validateEnv } from '@/lib/env';
import { extractTextFromPdf, ImageBasedPdfError } from '@/services/extractionService';
import { analyzeLabText } from '@/services/aiAnalysisService';
import { getUserBiomarkerHistory, saveLabResult } from '@/app/actions/user-data';
import { ExtractedLabValue } from '@/lib/onboarding-store';
import { checkRateLimit } from '@/services/rateLimitService';
import { logger } from '@/lib/logger';
import { getAuthClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { MAX_FILE_SIZE_BYTES, MAX_UPLOADS_PER_HOUR } from '@/lib/constants';

/** Client can use this to show clean image-based PDF message and manual entry option. */
export const IMAGE_BASED_PDF_ERROR_CODE = 'IMAGE_BASED_PDF';

export const maxDuration = 60;
export const runtime = "nodejs";

const formSymptomsSchema = z.array(z.string().trim().min(1)).max(30).catch([]);
const GENERIC_ANALYSIS_ERROR = 'We could not analyze this report right now. Please try again in a moment, or enter the values manually.';

function toDebugPayload(error: unknown, stage: string, extra: Record<string, unknown> = {}) {
    const err = error as Error & { cause?: unknown; status?: number; code?: string };
    return {
        stage,
        name: err?.name || typeof error,
        message: err?.message || String(error),
        stack: err?.stack || null,
        cause: err?.cause ? String(err.cause) : null,
        status: err?.status ?? null,
        code: err?.code ?? null,
        ...extra,
    };
}

function parseFormSymptoms(raw: FormDataEntryValue | null): string[] {
    if (typeof raw !== 'string' || raw.trim() === '') return [];

    try {
        const parsed = JSON.parse(raw);
        const result = formSymptomsSchema.parse(parsed);
        return Array.from(new Set(result));
    } catch {
        return [];
    }
}

function isConfigurationError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return /missing required environment variables|environment variables|supabase_service_role_key/i.test(message);
}

function includeDebug(debug: Record<string, unknown>) {
    return process.env.NODE_ENV === 'production' ? undefined : debug;
}

export async function POST(req: NextRequest) {
    try {
        validateEnv();
        const rateLimitResult = await checkRateLimit();
        if (!rateLimitResult.success) {
            logger.warn(`Rate limit exceeded: ${rateLimitResult.message}`);
            return NextResponse.json(
                    {
                        success: false,
                        error: rateLimitResult.message,
                        debug: includeDebug({ stage: 'rate-limit', ...rateLimitResult }),
                },
                { status: 429, headers: { 'Retry-After': (rateLimitResult.retryAfter || 60).toString() } }
            );
        }

        // Require auth to prevent quota abuse
        const supabaseAuth = await getAuthClient();
        const { data: { user: authUser } } = await supabaseAuth.auth.getUser();
        if (!authUser) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Sign in to analyze reports.',
                    debug: includeDebug({ stage: 'auth', message: 'No Supabase auth user returned for request cookies.' }),
                },
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
        if (uploadCount !== null && uploadCount >= MAX_UPLOADS_PER_HOUR) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Rate limit exceeded. You can analyze up to ${MAX_UPLOADS_PER_HOUR} reports per hour. Please try again later.`,
                    debug: includeDebug({ stage: 'user-upload-limit', uploadCount, max: MAX_UPLOADS_PER_HOUR }),
                },
                { status: 429 }
            );
        }

        logger.info('[Analyze] NODE_ENV:', process.env.NODE_ENV);
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const manualPayloadRaw = formData.get('manualPayload') as string | null;
        const requestSymptoms = parseFormSymptoms(formData.get('symptoms'));
        const shouldSave = formData.get('save') !== 'false';

        // ── Manual entry path (no file) ──
        if (!file && manualPayloadRaw) {
            return await handleManualEntry(manualPayloadRaw, requestSymptoms);
        }

        if (!file) {
            return NextResponse.json({
                success: false,
                error: 'No file uploaded. Upload a PDF or use manual entry.',
                debug: includeDebug({ stage: 'request-parse', fields: Array.from(formData.keys()) }),
            }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json({
                success: false,
                error: `File size exceeds ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit.`,
                debug: includeDebug({ stage: 'file-validation', fileName: file.name, fileSize: file.size, max: MAX_FILE_SIZE_BYTES }),
            }, { status: 400 });
        }

        // Some mobile browsers upload PDFs with an empty or generic MIME type.
        // The magic-byte check below is the authoritative content validation.
        const fileName = file.name.toLowerCase();
        const isAcceptableMime = !file.type || file.type === 'application/pdf' || file.type === 'application/octet-stream';
        if (!fileName.endsWith('.pdf') || !isAcceptableMime) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid file type. Only PDF files are accepted.',
                    debug: includeDebug({ stage: 'file-validation', fileName: file.name, fileType: file.type }),
                },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Section 1e — PDF Magic Bytes validation (%PDF-)
        if (buffer.length < 5 || buffer.toString('utf8', 0, 5) !== '%PDF-') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid file content. The file does not appear to be a valid PDF.',
                    debug: includeDebug({
                        stage: 'pdf-magic-bytes',
                        fileName: file.name,
                        fileSize: file.size,
                        firstBytes: buffer.toString('utf8', 0, Math.min(12, buffer.length)),
                    }),
                },
                { status: 400 }
            );
        }

        logger.info("Starting text extraction...");
        let extractedText: string;
        try {
            const result = await extractTextFromPdf(buffer, file.type, file.name);
            extractedText = result.text;
        } catch (extractErr) {
            if (extractErr instanceof ImageBasedPdfError) {
                return NextResponse.json(
                    {
                        success: false,
                        error: extractErr.message,
                        code: IMAGE_BASED_PDF_ERROR_CODE,
                        debug: includeDebug(toDebugPayload(extractErr, 'text-extraction', { fileName: file.name, fileSize: file.size })),
                    },
                    { status: 400 }
                );
            }
            throw extractErr;
        }

        if (!extractedText || extractedText.trim().length < 100) {
            return NextResponse.json({
                success: false,
                error: 'Could not extract enough text from this PDF. Please ensure it is a digital lab report and not a scan or photo.',
                code: IMAGE_BASED_PDF_ERROR_CODE,
                debug: includeDebug({
                    stage: 'text-extraction-length',
                    fileName: file.name,
                    extractedLength: extractedText?.trim().length ?? 0,
                    preview: extractedText?.slice(0, 500) ?? '',
                }),
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
        const savedSymptoms = (symptomsResult.data || []).map((s: { symptom: string }) => s.symptom);
        const userSymptoms = Array.from(new Set([...requestSymptoms, ...savedSymptoms]));
        logger.info(`Fetched ${history.length} historical biomarkers for user ${authUser.id}`);

        logger.info("Starting AI analysis...");
        const analysisResult = await analyzeLabText(extractedText, { symptoms: userSymptoms, history });

        // 6. Data Persistence
        if (shouldSave) {
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
                plainSummary: analysisResult.plainSummary,
                longitudinalInsights: analysisResult.longitudinalInsights,
            });

            if (!saveResult.success) {
                logger.error("Failed to save via action:", saveResult.error);
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Analysis finished, but we could not save the results. Please try again.',
                        debug: includeDebug({
                            stage: 'save-report',
                            saveResult,
                            biomarkerCount: analysisResult.biomarkers.length,
                            fileName: file.name,
                        }),
                    },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({
            success: true,
            saved: shouldSave,
            fileName: file.name,
            extractedText,
            analysis: JSON.stringify(analysisResult)
        });

    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            logger.error("Validation Error:", error.issues);
            return NextResponse.json({
                success: false,
                error: 'AI analysis validation failed. The report format may be unsupported.',
                details: process.env.NODE_ENV === 'production' ? undefined : error.issues,
                debug: includeDebug(toDebugPayload(error, 'zod-validation', { issues: error.issues })),
            }, { status: 422 });
        }
        if (error instanceof ImageBasedPdfError) {
            return NextResponse.json(
                {
                    success: false,
                    error: error.message,
                    code: IMAGE_BASED_PDF_ERROR_CODE,
                    debug: includeDebug(toDebugPayload(error, 'image-based-pdf')),
                },
                { status: 400 }
            );
        }

        const debug = toDebugPayload(error, 'pipeline-catch');
        logger.error("Pipeline Error:", debug);
        return NextResponse.json({
            success: false,
            error: isConfigurationError(error) ? GENERIC_ANALYSIS_ERROR : ((error as Error).message || GENERIC_ANALYSIS_ERROR),
            debug: includeDebug(debug),
        }, { status: 500 });
    }
}

/** Build synthetic lab text from manual payload and run AI + save. */
async function handleManualEntry(manualPayloadRaw: string, requestSymptoms: string[]): Promise<NextResponse> {
    const supabase = await getAuthClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({
            success: false,
            error: 'You must be signed in to save results.',
            debug: includeDebug({ stage: 'manual-auth', message: 'No Supabase auth user returned for manual entry request.' }),
        }, { status: 401 });
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
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Invalid manual entry data format.',
            debug: includeDebug(toDebugPayload(error, 'manual-payload-json', { manualPayloadRaw })),
        }, { status: 400 });
    }

    const parseResult = manualPayloadSchema.safeParse(payloadRaw);
    if (!parseResult.success) {
        return NextResponse.json({
            success: false,
            error: parseResult.error.issues[0]?.message || 'Invalid data.',
            debug: includeDebug(toDebugPayload(parseResult.error, 'manual-payload-validation', { issues: parseResult.error.issues })),
        }, { status: 400 });
    }

    const normalized = parseResult.data.biomarkers;

    const syntheticText = normalized
        .map((b) => `${b.name}: ${b.value} ${b.unit}`)
        .join('\n');
    const preamble = 'Lab values (manually entered by user — ONLY extract these specific values, do not add any others):\n';
    const fullText = preamble + syntheticText;

    const [history, symptomsResult] = await Promise.all([
        getUserBiomarkerHistory(user.id),
        supabase.from('symptoms').select('symptom').eq('user_id', user.id)
    ]);
    const savedSymptoms = (symptomsResult.data || []).map((s: { symptom: string }) => s.symptom);
    const userSymptoms = Array.from(new Set([...requestSymptoms, ...savedSymptoms]));
    const analysisResult = await analyzeLabText(fullText, { symptoms: userSymptoms, history });

    const saveResult = await saveLabResult({
        userId: user.id,
        healthScore: analysisResult.healthScore,
        riskLevel: analysisResult.riskLevel,
        summary: analysisResult.summary,
        labValues: analysisResult.biomarkers as ExtractedLabValue[],
        fileName: 'Manual entry',
        rawOcrText: undefined,
        rawAiJson: analysisResult,
        symptomConnections: analysisResult.symptomConnections,
        plainSummary: analysisResult.plainSummary,
        longitudinalInsights: analysisResult.longitudinalInsights,
    });

    if (!saveResult.success) {
        logger.error("Failed to save manual report:", saveResult.error);
        return NextResponse.json({
            success: false,
            error: 'Analysis finished, but we could not save the results. Please try again.',
            debug: includeDebug({ stage: 'manual-save-report', saveResult, biomarkerCount: analysisResult.biomarkers.length }),
        }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        extractedText: fullText,
        analysis: JSON.stringify(analysisResult)
    });
}
