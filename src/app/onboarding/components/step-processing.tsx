"use client";

import { useOnboardingStore } from "@/lib/onboarding-store";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Check, Search, Brain, Activity, AlertCircle, RotateCcw, ArrowLeft, FileText, BarChart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Real processing stages related to API lifecycle
type ProcessingState = "uploading" | "analyzing" | "finalizing" | "complete" | "error";

const STAGES = [
    { message: 'Reading your lab report...', icon: '📄' },
    { message: 'Identifying biomarkers...', icon: '🔬' },
    { message: 'Comparing reference ranges...', icon: '📊' },
    { message: 'Generating interpretations...', icon: '🧠' },
    { message: 'Calculating health score...', icon: '💯' },
    { message: 'Almost done...', icon: '✨' },
];

const getErrorMessage = (error: string) => {
    if (error.includes('Rate limit') || error.includes('429'))
        return { title: 'Too many requests', detail: 'Groq AI is rate limited. Please wait 60 seconds and try again.', canRetry: true }
    if (error.includes('Unauthorized') || error.includes('401'))
        return { title: 'Session expired', detail: 'Your session has expired. Please sign in again.', canRetry: false, redirect: '/auth' }
    if (error.includes('invalid format'))
        return { title: 'AI parsing error', detail: 'The AI had trouble reading this report format. Try a different PDF.', canRetry: true }
    return { title: 'Something went wrong', detail: error, canRetry: true }
}

export function StepProcessing() {
    const { setStep, completeStep, setAnalysisResult } = useOnboardingStore();
    const [state, setState] = useState<ProcessingState>("uploading");
    const [processingStage, setProcessingStage] = useState(0);
    const [errorData, setErrorData] = useState<{ title: string, detail: string, canRetry: boolean, redirect?: string } | null>(null);
    const hasStarted = useRef(false);

    // Cycle through stages
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (state === 'uploading' || state === 'analyzing' || state === 'finalizing') {
            interval = setInterval(() => {
                setProcessingStage(prev => (prev + 1) % STAGES.length);
            }, 1500);
        }
        return () => clearInterval(interval);
    }, [state]);

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
            setProcessingStage(0);

            // Get file from onboarding store
            const file = useOnboardingStore.getState().uploadedFile;
            const symptoms = useOnboardingStore.getState().selectedSymptoms;

            if (!file || !(file instanceof File)) {
                goBackToUpload();
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
                labValues: analysisData.details || [],
                entities: [],
                healthScore: analysisData.healthScore || 0,
                riskLevel: analysisData.riskLevel || "low",
            });

            setAnalysisResult(analysisData);

            // Success animation delay
            setTimeout(() => {
                setState("complete");
                // Show success state for 1s then proceed
                setTimeout(() => {
                    onComplete();
                }, 1000);
            }, 800);

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
    if (state === "complete") {
        const { extractedLabValues } = useOnboardingStore.getState();
        return (
            <div className="max-w-lg mx-auto w-full px-6 py-20 flex flex-col items-center justify-center min-h-[400px]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="text-6xl mb-6">✅</div>
                    <h3 className="text-[#1C1917] text-[24px] font-bold font-display mb-2">
                        Analysis complete!
                    </h3>
                    <p className="text-[#57534E] text-[16px]">
                        Found {extractedLabValues.length || 0} biomarkers
                    </p>
                </motion.div>
            </div>
        );
    }

    // Processing State
    return (
        <div className="max-w-lg mx-auto w-full px-6 py-20 flex flex-col items-center">

            {/* Animated Pipeline */}
            <div className="relative w-32 h-32 mb-12 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 8 }}
                    className="absolute inset-0 rounded-full border border-sky-100"
                />
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 2 }}
                    className="absolute inset-0 rounded-full border-t-2 border-sky-500"
                />
                <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center shadow-sm text-4xl">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={processingStage}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.2 }}
                        >
                            {STAGES[processingStage].icon}
                        </motion.span>
                    </AnimatePresence>
                </div>
            </div>

            {/* Stage Message */}
            <div className="text-center mb-8 h-16">
                <AnimatePresence mode="wait">
                    <motion.h2
                        key={processingStage}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="font-display text-xl text-[#1C1917] font-medium"
                    >
                        {STAGES[processingStage].message}
                    </motion.h2>
                </AnimatePresence>
            </div>

            {/* Progress Indicators */}
            <div className="w-full max-w-sm space-y-3">
                <div className="h-1.5 w-full bg-[#E8E6DF] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-sky-500"
                        initial={{ width: "0%" }}
                        animate={{ width: `${((processingStage + 1) / STAGES.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <p className="text-center text-xs text-[#A8A29E] uppercase tracking-wider font-semibold">
                    Processing
                </p>
            </div>
        </div>
    );
}
