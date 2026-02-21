"use client";

import { useOnboardingStore } from "@/lib/onboarding-store";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Check, Search, Brain, Activity, AlertCircle, RotateCcw, ArrowLeft, ArrowRight, FileText, BarChart, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Real processing stages related to API lifecycle
type ProcessingState = "uploading" | "analyzing" | "finalizing" | "complete" | "error";

const getErrorMessage = (error: string) => {
    if (error.includes('Rate limit') || error.includes('429'))
        return { title: 'High Traffic / Rate Limit', detail: 'The AI service is currently busy (Rate Limit). Please wait a moment and try again.', canRetry: true }
    if (error.includes('Unauthorized') || error.includes('401'))
        return { title: 'Session expired', detail: 'Your session has expired. Please sign in again.', canRetry: false, redirect: '/login' }
    if (error.includes('invalid format'))
        return { title: 'AI parsing error', detail: 'The AI had trouble reading this report format. Try a different PDF.', canRetry: true }
    return { title: 'Something went wrong', detail: error, canRetry: true }
}

export function StepProcessing() {
    const { setStep, completeStep, setAnalysisResult, analysisResult } = useOnboardingStore();
    const [state, setState] = useState<ProcessingState>("uploading");
    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [errorData, setErrorData] = useState<{ title: string, detail: string, canRetry: boolean, redirect?: string } | null>(null);
    const hasStarted = useRef(false);

    // New stages configuration with durations
    const stages = [
        { step: 1, label: 'Scanning your lab report...', detail: 'OCR reading every value on the page', duration: 8000 },
        { step: 2, label: 'Identifying biomarkers...', detail: 'Finding hemoglobin, glucose, vitamins and more', duration: 6000 },
        { step: 3, label: 'Comparing reference ranges...', detail: 'Checking what\'s optimal, what needs attention', duration: 5000 },
        { step: 4, label: 'Generating plain English explanations...', detail: 'Making medical jargon actually understandable', duration: 5000 },
        { step: 5, label: 'Calculating your health score...', detail: 'Building your personal health overview', duration: 4000 },
    ]

    // Cycle through stages based on duration
    useEffect(() => {
        if (state === 'error' || state === 'complete') return;

        let timer: NodeJS.Timeout;

        const processStage = (index: number) => {
            if (index >= stages.length) return;

            setCurrentStageIndex(index);

            timer = setTimeout(() => {
                if (index < stages.length - 1) {
                    processStage(index + 1);
                }
            }, stages[index].duration);
        };

        // Only start the internal timer loop if we are in a processing state
        if (state === 'uploading' || state === 'analyzing' || state === 'finalizing') {
            // If we just started (index 0), kick off the chain. 
            // If we are already mid-way (e.g. re-render), this effect might reset unless carefully managed.
            // Simplest approach for this specific request: just run the chain from current index if not already complete.
            if (currentStageIndex < stages.length) {
                timer = setTimeout(() => {
                    setCurrentStageIndex(prev => Math.min(prev + 1, stages.length - 1));
                }, stages[currentStageIndex].duration);
            }
        }

        return () => clearTimeout(timer);
    }, [currentStageIndex, state]); // Dependency on currentStageIndex allows the chain to continue

    const goBackToUpload = () => {
        setErrorData(null);
        setState("uploading");
        hasStarted.current = false;
        setStep(3);
    };

    const runProcessing = async () => {
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

            // Create FormData for upload
            const formData = new FormData();
            formData.append("file", file);
            formData.append("symptoms", JSON.stringify(symptoms));

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

                setErrorData(getErrorMessage(errorMessage));
                setState("error");
                return;
            }

            setState("finalizing");

            const analysisData = JSON.parse(data.analysis);

            // Save to store
            useOnboardingStore.getState().setExtractedData({
                labValues: analysisData.biomarkers || [],
                entities: [],
                healthScore: analysisData.healthScore || 0,
                riskLevel: analysisData.riskLevel || "low",
            });

            setAnalysisResult(analysisData);

            setState("complete");

        } catch (err: unknown) {
            setErrorData(getErrorMessage((err as Error).message || "Network error"));
            setState("error");
        }
    };

    const onComplete = () => {
        completeStep(4);
        setStep(5);
    };

    useEffect(() => {
        if (hasStarted.current) return;
        hasStarted.current = true;
        runProcessing();
    }, []);

    // Error State
    if (state === "error" && errorData) {
        return (
            <div className="max-w-lg mx-auto w-full px-6 py-20 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full p-6 rounded-[16px] border-l-4 border-[#EF4444] bg-[#FFF1F2] shadow-sm"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-[#991B1B]" />
                        </div>
                        <div className="flex-1">
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

    // Success State
    if (state === "complete" && analysisResult) {
        const biomarkerCount = analysisResult.biomarkers.length;
        const healthScore = analysisResult.healthScore;
        const optimalCount = analysisResult.biomarkers.filter((b: any) => b.status === "optimal").length;
        const warningCount = analysisResult.biomarkers.filter((b: any) => b.status === "warning").length;
        const criticalCount = analysisResult.biomarkers.filter((b: any) => b.status === "critical").length;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '48px 24px', maxWidth: 600, margin: '0 auto' }}
            >
                <p style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#A8A29E',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: 8
                }}>
                    DATA EXTRACTED
                </p>
                <h2 style={{
                    fontFamily: 'Instrument Serif',
                    fontSize: 32,
                    color: '#1C1917',
                    margin: '0 0 8px 0'
                }}>
                    Want to see your health score?
                </h2>
                <p style={{ fontSize: 15, color: '#57534E', marginBottom: 32 }}>
                    We found {biomarkerCount} biomarkers in your report. Here is what they mean.
                </p>

                {/* Health score display */}
                <div style={{
                    background: '#F5F4EF',
                    border: '1px solid #E8E6DF',
                    borderRadius: 18,
                    padding: '32px 24px',
                    marginBottom: 24,
                    maxWidth: 400,
                    margin: '0 auto 24px auto'
                }}>
                    <div style={{
                        fontFamily: 'Instrument Serif',
                        fontSize: 72,
                        fontWeight: 700,
                        color: '#0EA5E9',
                        lineHeight: 1
                    }}>
                        {healthScore}
                    </div>
                    <div style={{ fontSize: 14, color: '#57534E', marginTop: 8 }}>
                        out of 100
                    </div>
                    <div style={{
                        marginTop: 16,
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 16
                    }}>
                        <span style={{ fontSize: 13, color: '#10B981', fontWeight: 500 }}>
                            {optimalCount} optimal
                        </span>
                        <span style={{ fontSize: 13, color: '#F59E0B', fontWeight: 500 }}>
                            {warningCount} monitor
                        </span>
                        <span style={{ fontSize: 13, color: '#EF4444', fontWeight: 500 }}>
                            {criticalCount} action needed
                        </span>
                    </div>
                </div>

                <button onClick={() => onComplete()} style={{
                    background: '#0EA5E9',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px 32px',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer'
                }} className="flex items-center gap-2 mx-auto">
                    See full breakdown
                    <ArrowRight size={18} />
                </button>
            </motion.div>
        );
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
            </div>
        </div>
    );
}
