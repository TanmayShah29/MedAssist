import { NextRequest, NextResponse } from 'next/server';
import { extractPdfText } from '@/lib/extractPdfText';
import { extractAndInterpretBiomarkers } from '@/lib/groq-medical';
import { checkRateLimit } from '@/services/rateLimitService';
import { logger } from '@/lib/logger';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const maxDuration = 60;
export const runtime = "nodejs";

function validateAndRecalculateScore(groqScore: number, biomarkers: any[]): number {
    if (!groqScore || groqScore < 0 || groqScore > 100) {
        const optimal = biomarkers.filter(b => b.status === 'optimal').length
        const warning = biomarkers.filter(b => b.status === 'warning').length
        const critical = biomarkers.filter(b => b.status === 'critical').length
        const total = biomarkers.length

        if (total === 0) return 0

        const rawScore = ((optimal * 100) + (warning * 75) + (critical * 40)) / total
        const floor = optimal > 0 ? 50 : 30
        return Math.round(Math.max(floor, rawScore))
    }
    return groqScore
}

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

        // 4. Analyze with Groq (Extraction + Interpretation)
        logger.info("Starting analysis with Groq (groq-medical)...");

        // Passing empty symptoms array as we don't have them in this request context yet
        const analysisResult = await extractAndInterpretBiomarkers(extractedText, []);
        analysisResult.healthScore = validateAndRecalculateScore(analysisResult.healthScore, analysisResult.biomarkers);

        // 5. EXTRACTED DATA PERSISTENCE
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
            const fileName = file.name;
            const { data: labResult, error: labError } = await supabase
                .from('lab_results')
                .insert({
                    user_id: user.id,
                    file_name: fileName || 'Lab Report',
                    processed: true,
                    processing_time_ms: Date.now() - startTime,
                    health_score: analysisResult.healthScore
                })
                .select()
                .single()

            if (labError) {
                console.error('Lab result insert error:', labError)
                throw new Error('Failed to save lab result: ' + labError.message)
            }

            // B. Save Biomarkers
            const result = analysisResult; // mapping to user provided code variable name
            if (result.biomarkers?.length > 0) {
                const { error: bioError } = await supabase
                    .from('biomarkers')
                    .insert(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        result.biomarkers.map((b: any) => ({
                            user_id: user.id,
                            lab_result_id: labResult.id,
                            name: b.name,
                            value: b.value,
                            unit: b.unit,
                            status: normalizeStatus(b.status),
                            reference_range_min: b.referenceMin ?? null, // Use flat fields
                            reference_range_max: b.referenceMax ?? null, // Use flat fields
                            category: b.category ?? 'other',
                            confidence: b.confidence ?? 0.8,
                            ai_interpretation: b.aiInterpretation ?? ''
                        }))
                    )

                if (bioError) {
                    console.error('Biomarker insert error:', bioError)
                    throw new Error('Failed to save biomarkers: ' + bioError.message)
                }
            }
        }

        return NextResponse.json({
            success: true,
            extractedText,
            analysis: JSON.stringify(analysisResult)
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
