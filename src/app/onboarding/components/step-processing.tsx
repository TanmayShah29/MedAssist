"use client";

import { useOnboardingStore } from "@/lib/onboarding-store";
import type { AnalysisResultDraft, ExtractedLabValue } from "@/lib/onboarding-store";
import { motion } from "framer-motion";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Check, AlertCircle, RotateCcw, ArrowLeft, ArrowRight, Loader2, ChevronLeft, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveProfileFromSession, saveReviewedReportFromSession } from "@/app/actions/user-data";

// Real processing stages related to API lifecycle
type ProcessingState = "uploading" | "analyzing" | "finalizing" | "complete" | "error";

const IMAGE_BASED_MSG = 'This file appears to be image-based. Please upload a digital lab report or enter values manually.';

function deriveReviewedScore(biomarkers: ExtractedLabValue[]) {
    if (biomarkers.length === 0) return 0;
    const optimal = biomarkers.filter((b) => b.status === "optimal").length;
    const warning = biomarkers.filter((b) => b.status === "warning").length;
    const critical = biomarkers.filter((b) => b.status === "critical").length;
    return Math.max(0, Math.min(100, Math.round(((optimal * 100) + (warning * 65) + (critical * 25)) / biomarkers.length)));
}

function deriveRiskLevel(biomarkers: ExtractedLabValue[]): "low" | "moderate" | "high" {
    if (biomarkers.some((b) => b.status === "critical")) return "high";
    if (biomarkers.some((b) => b.status === "warning")) return "moderate";
    return "low";
}

const getErrorMessage = (error: string) => {
    if (error.includes('Rate limit') || error.includes('429'))
        return { title: 'High Traffic / Rate Limit', detail: 'The AI service is currently busy (Rate Limit). Please wait a moment and try again.', canRetry: true }
    if (error.includes('Unauthorized') || error.includes('401'))
        return { title: 'Session expired', detail: 'Your session has expired. Please sign in again.', canRetry: false, redirect: '/auth?mode=login' }
    if (error.includes('invalid format'))
        return { title: 'AI parsing error', detail: 'The AI had trouble reading this report format. Try a different PDF.', canRetry: true }
    if (error.includes('image-based') || error === IMAGE_BASED_MSG)
        return { title: 'Image-based PDF', detail: IMAGE_BASED_MSG, canRetry: true, isImageBased: true }
    return { title: 'Something went wrong', detail: error, canRetry: true }
}

function ReviewExtractedValues({
    analysisResult,
    onComplete,
}: {
    analysisResult: AnalysisResultDraft;
    onComplete: () => void;
}) {
    const { setAnalysisResult } = useOnboardingStore();
    const [rows, setRows] = useState<ExtractedLabValue[]>(analysisResult.biomarkers);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const reviewedScore = deriveReviewedScore(rows);
    const reviewedRiskLevel = deriveRiskLevel(rows);
    const optimalCount = rows.filter((b) => b.status === "optimal").length;
    const warningCount = rows.filter((b) => b.status === "warning").length;
    const criticalCount = rows.filter((b) => b.status === "critical").length;

    const updateRow = (index: number, patch: Partial<ExtractedLabValue>) => {
        setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    };

    const addRow = () => {
        setRows((prev) => [
            ...prev,
            {
                name: "",
                value: 0,
                unit: "unit",
                status: "optimal",
                referenceMin: null,
                referenceMax: null,
                rangePosition: 50,
                confidence: 0.6,
                aiInterpretation: "Manually added during review.",
                trend: "",
                category: "other",
            },
        ]);
    };

    const removeRow = (index: number) => {
        setRows((prev) => prev.filter((_, i) => i !== index));
    };

    const saveReviewed = async () => {
        const validRows = rows
            .map((row) => ({
                ...row,
                name: row.name.trim(),
                unit: row.unit.trim() || "unit",
                value: Number(row.value),
                referenceMin: row.referenceMin === null ? null : Number(row.referenceMin),
                referenceMax: row.referenceMax === null ? null : Number(row.referenceMax),
            }))
            .filter((row) => row.name && !Number.isNaN(row.value));

        if (validRows.length === 0) {
            setSaveError("Keep at least one biomarker with a name and numeric value.");
            return;
        }

        setIsSaving(true);
        setSaveError(null);

        const reviewedResult: AnalysisResultDraft = {
            ...analysisResult,
            biomarkers: validRows,
            healthScore: reviewedScore,
            riskLevel: reviewedRiskLevel,
        };

        const result = await saveReviewedReportFromSession({
            fileName: analysisResult.fileName || "Reviewed Lab Report",
            healthScore: reviewedResult.healthScore,
            riskLevel: reviewedResult.riskLevel,
            summary: reviewedResult.summary,
            biomarkers: reviewedResult.biomarkers,
            rawOcrText: reviewedResult.rawOcrText,
            rawAiJson: reviewedResult.rawAiJson,
            symptomConnections: reviewedResult.symptomConnections,
            plainSummary: reviewedResult.plainSummary,
        });

        setIsSaving(false);

        if (!result.success) {
            setSaveError(result.error || "Could not save reviewed report.");
            return;
        }

        setAnalysisResult(reviewedResult);
        onComplete();
    };

    return (
        <motion.div
            initial={{ opacity: 0.01, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto w-full px-6 py-10"
        >
            <div className="mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-500 mb-2">
                    Review extracted data
                </p>
                <h2 className="font-display text-3xl text-[#1C1917] mb-2">
                    Confirm what we found
                </h2>
                <p className="text-sm text-[#57534E] max-w-2xl">
                    AI can misread PDFs. Check the names, values, units, and statuses before we build your dashboard.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="rounded-[12px] border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-2xl font-bold text-emerald-700">{optimalCount}</p>
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Optimal</p>
                </div>
                <div className="rounded-[12px] border border-amber-100 bg-amber-50 p-4">
                    <p className="text-2xl font-bold text-amber-700">{warningCount}</p>
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Monitor</p>
                </div>
                <div className="rounded-[12px] border border-red-100 bg-red-50 p-4">
                    <p className="text-2xl font-bold text-red-700">{criticalCount}</p>
                    <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Action</p>
                </div>
            </div>

            <div className="rounded-[16px] border border-[#E8E6DF] bg-white overflow-hidden shadow-sm">
                <div className="hidden md:grid grid-cols-[1.4fr_0.8fr_0.8fr_1fr_44px] gap-3 px-4 py-3 bg-[#F5F4EF] border-b border-[#E8E6DF] text-[10px] font-bold uppercase tracking-[0.12em] text-[#A8A29E]">
                    <span>Name</span>
                    <span>Value</span>
                    <span>Unit</span>
                    <span>Status</span>
                    <span />
                </div>

                <div className="max-h-[420px] overflow-y-auto">
                    {rows.map((row, index) => (
                        <div key={`${row.name}-${index}`} className="grid grid-cols-1 md:grid-cols-[1.4fr_0.8fr_0.8fr_1fr_44px] gap-3 p-4 border-b border-[#E8E6DF] last:border-b-0">
                            <input
                                value={row.name}
                                onChange={(e) => updateRow(index, { name: e.target.value })}
                                placeholder="Biomarker"
                                className="rounded-[10px] border border-[#E8E6DF] bg-[#FAFAF7] px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                            />
                            <input
                                value={String(row.value)}
                                onChange={(e) => updateRow(index, { value: Number(e.target.value) })}
                                inputMode="decimal"
                                placeholder="Value"
                                className="rounded-[10px] border border-[#E8E6DF] bg-[#FAFAF7] px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                            />
                            <input
                                value={row.unit}
                                onChange={(e) => updateRow(index, { unit: e.target.value })}
                                placeholder="Unit"
                                className="rounded-[10px] border border-[#E8E6DF] bg-[#FAFAF7] px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                            />
                            <select
                                value={row.status}
                                onChange={(e) => updateRow(index, { status: e.target.value as ExtractedLabValue["status"] })}
                                className="rounded-[10px] border border-[#E8E6DF] bg-[#FAFAF7] px-3 py-2 text-sm capitalize focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                            >
                                <option value="optimal">Optimal</option>
                                <option value="warning">Monitor</option>
                                <option value="critical">Action needed</option>
                            </select>
                            <button
                                type="button"
                                onClick={() => removeRow(index)}
                                className="h-10 w-10 rounded-[10px] text-[#A8A29E] hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center"
                                aria-label={`Remove ${row.name || "row"}`}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <button
                type="button"
                onClick={addRow}
                className="mt-4 flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-700"
            >
                <Plus className="w-4 h-4" />
                Add missing value
            </button>

            {saveError && (
                <div className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {saveError}
                </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#A8A29E]">Reviewed health score</p>
                    <p className="font-display text-3xl text-[#1C1917]">{reviewedScore}<span className="text-sm text-[#57534E] font-sans"> / 100</span></p>
                </div>
                <button
                    onClick={saveReviewed}
                    disabled={isSaving}
                    className="min-h-[44px] rounded-[10px] bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-sky-500/20 hover:bg-sky-600 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving reviewed report...
                        </>
                    ) : (
                        <>
                            Save and build dashboard
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
}

export function StepProcessing() {
    const { setStep, completeStep, setAnalysisResult, analysisResult } = useOnboardingStore();
    const [state, setState] = useState<ProcessingState>("uploading");
    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [errorData, setErrorData] = useState<{ title: string, detail: string, canRetry: boolean, redirect?: string, isImageBased?: boolean } | null>(null);
    const hasStarted = useRef(false);

    // New stages configuration with durations
    const stages = useMemo(() => [
        { step: 1, label: 'Scanning your lab report...', detail: 'OCR reading every value on the page', duration: 8000 },
        { step: 2, label: 'Identifying biomarkers...', detail: 'Finding hemoglobin, glucose, vitamins and more', duration: 6000 },
        { step: 3, label: 'Comparing reference ranges...', detail: 'Checking what\'s optimal, what needs attention', duration: 5000 },
        { step: 4, label: 'Generating plain English explanations...', detail: 'Making medical jargon actually understandable', duration: 5000 },
        { step: 5, label: 'Calculating your health score...', detail: 'Building your personal health overview', duration: 4000 },
    ], []);

    // Cycle through stages based on duration
    useEffect(() => {
        if (state === 'error' || state === 'complete') return;

        let timer: NodeJS.Timeout;


        // Only start the internal timer loop if we are in a processing state
        if (state === 'uploading' || state === 'analyzing' || state === 'finalizing') {
            // If we just started (index 0), kick off the chain. 
            // If we are already mid-way (e.g. re-render), this effect might reset unless carefully managed.
            // Simplest approach for this specific request: just run the chain from current index if not already complete.
            if (currentStageIndex < stages.length) {
                timer = setTimeout(() => {
                    setCurrentStageIndex(prev => Math.min(prev + 1, stages.length - 1));
                }, stages[currentStageIndex]?.duration || 0);
            }
        }

        return () => clearTimeout(timer);
    }, [currentStageIndex, state, stages]); // Dependency on currentStageIndex allows the chain to continue

    const goBackToUpload = () => {
        setErrorData(null);
        setState("uploading");
        hasStarted.current = false;
        setStep(3);
    };

    const runProcessing = useCallback(async () => {
        try {
            setErrorData(null);
            setState("uploading");
            setCurrentStageIndex(0);

            // Get file from onboarding store
            const file = useOnboardingStore.getState().uploadedFile;
            const symptoms = useOnboardingStore.getState().selectedSymptoms;

            if (!file || !(file instanceof File)) {
                setErrorData({
                    title: "Session Interrupted",
                    detail: "Your uploaded file was lost due to a page refresh. Please go back and re-upload.",
                    canRetry: false
                });
                setState("error");
                hasStarted.current = false;
                return;
            }

            // Get basic info from onboarding store
            const basicInfo = useOnboardingStore.getState().basicInfo;

            // Create FormData for upload
            const formData = new FormData();
            formData.append("file", file);
            formData.append("symptoms", JSON.stringify(symptoms));
            formData.append("save", "false");

            // Persist profile context before analysis so this first report can use it.
            try {
                await saveProfileFromSession({
                    first_name: basicInfo.firstName || undefined,
                    last_name: basicInfo.lastName || undefined,
                    age: basicInfo.age ? Number(basicInfo.age) : undefined,
                    sex: basicInfo.sex || undefined,
                    blood_type: basicInfo.bloodType || undefined,
                    symptoms,
                });
            } catch (_profileErr) {
                // Non-blocking — the API also receives symptoms directly.
            }

            setState("analyzing");

            const response = await fetch("/api/analyze-report", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                let errorMessage = data.error || "Analysis failed";
                if (response.status === 413) errorMessage = "File is too large (max 10MB)";
                else if (response.status === 429) errorMessage = "Rate limit exceeded";
                else if (response.status === 504) errorMessage = "Analysis timed out";
                if (data.code === 'IMAGE_BASED_PDF') errorMessage = IMAGE_BASED_MSG;

                setErrorData(getErrorMessage(errorMessage));
                setState("error");
                return;
            }

            setState("finalizing");

            let analysisData: { biomarkers?: unknown[]; healthScore?: number; riskLevel?: string; summary?: string };
            try {
                if (!data.analysis || typeof data.analysis !== 'string') {
                    throw new Error('Invalid response from server');
                }
                analysisData = JSON.parse(data.analysis) as typeof analysisData;
            } catch {
                setErrorData({ title: 'Server Error', detail: 'Invalid response. Please try again.', canRetry: true });
                setState("error");
                return;
            }

            // Map API BiomarkerResult[] to ExtractedLabValue[] (add rangePosition, trend if missing)
            const rawBiomarkers = (analysisData.biomarkers || []) as Record<string, unknown>[];
            const labValues: ExtractedLabValue[] = rawBiomarkers.map((b) => ({
                name: (b.name as string) || "",
                value: (b.value as number) ?? 0,
                unit: (b.unit as string) || "",
                status: (b.status as ExtractedLabValue["status"]) || "optimal",
                referenceMin: (b.referenceMin as number | null) ?? null,
                referenceMax: (b.referenceMax as number | null) ?? null,
                rangePosition: (b.rangePosition as number) ?? 50,
                confidence: (b.confidence as number) ?? 0.8,
                aiInterpretation: (b.aiInterpretation as string) || "See your doctor for interpretation.",
                trend: (b.trend as string) ?? "",
                category: ["hematology", "inflammation", "metabolic", "vitamins", "other"].includes((b.category as string) || "")
                    ? (b.category as ExtractedLabValue["category"])
                    : "other",
            }));

            useOnboardingStore.getState().setExtractedData({
                labValues,
                entities: [],
                healthScore: analysisData.healthScore || 0,
                riskLevel: (analysisData.riskLevel as "low" | "moderate" | "high") || "low",
            });

            setAnalysisResult({
                biomarkers: labValues,
                healthScore: analysisData.healthScore || 0,
                riskLevel: analysisData.riskLevel || "low",
                summary: analysisData.summary || "",
                fileName: data.fileName || file.name,
                rawOcrText: data.extractedText,
                rawAiJson: analysisData,
                symptomConnections: (analysisData as AnalysisResultDraft).symptomConnections,
                plainSummary: (analysisData as AnalysisResultDraft).plainSummary,
            });

            setState("complete");

            // Keep profile context fresh after analysis as well.
            try {
                await saveProfileFromSession({
                    first_name: basicInfo.firstName || undefined,
                    last_name: basicInfo.lastName || undefined,
                    age: basicInfo.age ? Number(basicInfo.age) : undefined,
                    sex: basicInfo.sex || undefined,
                    blood_type: basicInfo.bloodType || undefined,
                    symptoms,
                });
            } catch (_profileErr) {
                // Non-blocking — profile save failure shouldn't block onboarding
            }

        } catch (err: unknown) {
            setErrorData(getErrorMessage((err as Error).message || "Network error"));
            setState("error");
        }
    }, [setAnalysisResult]);

    const onComplete = () => {
        completeStep(4);
        setStep(5);
    };

    useEffect(() => {
        if (hasStarted.current) return;
        hasStarted.current = true;
        runProcessing();
    }, [runProcessing]);

    // Error State
    if (state === "error" && errorData) {
        return (
            <div className="max-w-lg mx-auto w-full px-6 py-20 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0.01, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full p-6 rounded-[16px] border-l-4 border-[#EF4444] bg-[#FFF1F2] shadow-sm"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-[#991B1B]" />
                        </div>
                        <div className="grow shrink basis-0">
                            <h3 className="font-display text-lg font-bold text-[#991B1B] mb-1">
                                {errorData.title}
                            </h3>
                            <p className="text-sm text-[#57534E] leading-relaxed">
                                {errorData.detail}
                            </p>
                        </div>
                    </div>

                    {errorData.canRetry && (
                        <button
                            onClick={() => {
                                setErrorData(null);
                                hasStarted.current = false;
                                runProcessing();
                            }}
                            className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 
                                       rounded-[10px] bg-sky-500 hover:bg-sky-600 
                                       text-white text-sm font-semibold transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Try again
                        </button>
                    )}

                    {errorData.redirect && (
                        <a href={errorData.redirect} className="mt-6 block w-full">
                            <button
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 
                                           rounded-[10px] bg-sky-500 hover:bg-sky-600 
                                           text-white text-sm font-semibold transition-colors"
                            >
                                Sign in again
                            </button>
                        </a>
                    )}

                    {errorData.isImageBased && (
                        <p className="mt-3 text-[13px] text-[#57534E] text-center">
                            You can go back and enter your lab values manually instead.
                        </p>
                    )}
                    <button
                        onClick={goBackToUpload}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 
                                   rounded-[10px] text-[#57534E] hover:bg-white/50
                                   text-sm font-semibold transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Upload a different file
                    </button>
                </motion.div>
            </div>
        );
    }

    if (state === "complete" && analysisResult) {
        return <ReviewExtractedValues analysisResult={analysisResult} onComplete={onComplete} />;
    }

    // Processing State (Default)
    return (
        <div className="max-w-lg mx-auto w-full px-6 py-12">

            {/* Warning Banner */}
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 16px', marginBottom: 32 }}>
                <p style={{ color: '#92400E', fontSize: 14, margin: 0, fontWeight: 500 }} className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" /> Please don't close or refresh this page while we analyze your report
                </p>
            </div>

            {/* Vertical Stepper */}
            <div className="space-y-6 relative">
                {/* Vertical Line */}
                <div className="absolute left-[15px] top-[15px] bottom-[15px] w-[2px] bg-[#E8E6DF] z-0" />

                {stages.map((stage, index) => {
                    const isActive = index === currentStageIndex;
                    const isCompleted = index < currentStageIndex;
                    const isPending = index > currentStageIndex;

                    return (
                        <div key={stage.step} className="relative z-10 flex items-start gap-4">
                            {/* Circle Indicator */}
                            <motion.div
                                animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                                transition={isActive ? { repeat: Infinity, duration: 2 } : {}}
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0 transition-colors duration-300",
                                    isActive && "bg-sky-500 border-sky-500 text-white shadow-md shadow-sky-200",
                                    isCompleted && "bg-emerald-500 border-emerald-500 text-white",
                                    isPending && "bg-white border-[#E8E6DF] text-[#A8A29E]"
                                )}
                            >
                                {isCompleted ? <Check className="w-4 h-4" /> : stage.step}
                            </motion.div>

                            {/* Text Content */}
                            <div className={cn(
                                "pt-1 transition-opacity duration-300",
                                isPending ? "opacity-40" : "opacity-100"
                            )}>
                                <h3 className={cn(
                                    "text-[15px] font-medium leading-none mb-1.5",
                                    isActive ? "text-sky-700 font-bold" : "text-[#1C1917]"
                                )}>
                                    {stage.label}
                                </h3>
                                <p className="text-[13px] text-[#57534E] leading-snug">
                                    {stage.detail}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 text-center">
                <p className="text-xs text-[#A8A29E] font-medium">This usually takes 20–40 seconds</p>
                <button
                    onClick={goBackToUpload}
                    className="mt-4 text-sm text-[#57534E] hover:text-[#1C1917] font-medium flex items-center gap-1.5 mx-auto"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Upload a different file
                </button>
            </div>
        </div>
    );
}
