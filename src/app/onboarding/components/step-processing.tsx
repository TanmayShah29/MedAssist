"use client";

import { useOnboardingStore } from "@/lib/onboarding-store";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Check, Search, Brain, Activity, AlertCircle, RotateCcw, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// Real processing stages related to API lifecycle
type ProcessingState = "uploading" | "analyzing" | "finalizing" | "complete" | "error";

export function StepProcessing() {
    const { setStep, completeStep, setAnalysisResult } = useOnboardingStore();
    const [state, setState] = useState<ProcessingState>("uploading");
    const [error, setError] = useState<string | null>(null);
    const hasStarted = useRef(false);

    const goBackToUpload = () => {
        setError(null);
        setState("uploading");
        hasStarted.current = false;
        setStep(3);
    };

    const runProcessing = async () => {
        try {
            setError(null);
            setState("uploading");

            // Get file from onboarding store
            const file = useOnboardingStore.getState().uploadedFile;
            const symptoms = useOnboardingStore.getState().selectedSymptoms;

            if (!file || !(file instanceof File)) {
                goBackToUpload();
                return;
            }

            // Create FormData for multipart/form-data upload
            const formData = new FormData();
            formData.append("file", file);
            formData.append("symptoms", JSON.stringify(symptoms)); // Send symptoms as stringified JSON field

            setState("analyzing"); // File read complete, sending to API

            const response = await fetch("/api/analyze-report", {
                method: "POST",
                // Do NOT set Content-Type header; browser sets it with boundary for FormData
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle specific status codes if needed
                if (response.status === 413) {
                    setError("File is too large for the server. Please try a smaller file (max 10MB) or compress it.");
                } else if (response.status === 429) {
                    setError("Too many requests (Rate Limit). Please wait a minute and try again.");
                } else if (response.status === 504) {
                    setError("Analysis timed out. The AI took too long. Try cropping the image to just the results table.");
                } else {
                    setError(data.error || "Analysis failed. Please try again.");
                }
                setState("error");
                return;
            }

            setState("finalizing");

            // The `analysis` field is a JSON string, parse it first.
            const analysisData = JSON.parse(data.analysis);

            // Save to onboarding store using the correct action
            useOnboardingStore.getState().setExtractedData({
                labValues: analysisData.details || [],
                entities: [], // `analysisData` may not have entities, default to empty
                healthScore: analysisData.healthScore || 0,
                riskLevel: analysisData.riskLevel || "low",
            });

            // Also save the raw analysis if needed elsewhere
            setAnalysisResult(analysisData);

            // Short delay to show "Finalizing" state for UX
            setTimeout(() => {
                setState("complete");
                onComplete();
            }, 800);

        } catch (err: unknown) {
            setError((err as Error).message || "Network error. Please check your connection.");
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

    // Error state
    if (state === "error" || error) {
        return (
            <div className="max-w-lg mx-auto w-full px-6 py-20 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full p-6 rounded-[16px] border-2 border-[#EF4444] bg-red-50"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-[#EF4444]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-display text-lg text-[#1C1917] mb-1">
                                Analysis Failed
                            </h3>
                            <p className="text-sm text-[#57534E] leading-relaxed">
                                {error}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setError(null);
                            hasStarted.current = false;
                            runProcessing();
                        }}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 
                                   rounded-[10px] bg-[#EF4444] hover:bg-red-600 
                                   text-white text-sm font-semibold transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Try again
                    </button>

                    <button
                        onClick={goBackToUpload}
                        className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 
                                   rounded-[10px] border border-[#E8E6DF] bg-white hover:bg-[#F5F4EF]
                                   text-[#57534E] text-sm font-semibold transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Upload a different file
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto w-full px-6 py-20 flex flex-col items-center">

            {/* Status Icon */}
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
                <div className="w-16 h-16 rounded-2xl bg-sky-50 
                        flex items-center justify-center shadow-sm">
                    {state === "analyzing" ? (
                        <Brain className="w-8 h-8 text-sky-500 animate-pulse" />
                    ) : state === "uploading" ? (
                        <Search className="w-8 h-8 text-sky-500 animate-pulse" />
                    ) : (
                        <Activity className="w-8 h-8 text-sky-500 animate-pulse" />
                    )}
                </div>
            </div>

            <h2 className="font-display text-2xl text-[#1C1917] mb-8 text-center">
                {state === "uploading" && "Reading document..."}
                {state === "analyzing" && "Groq AI is analyzing..."}
                {state === "finalizing" && "Preparing your results..."}
            </h2>

            {/* Stages */}
            <div className="w-full max-w-sm space-y-4">
                {/* Uploading Stage */}
                <ProcessingItem
                    label="Scanning document structure..."
                    isActive={state === "uploading"}
                    isComplete={state !== "uploading"}
                />
                {/* Analyzing Stage */}
                <ProcessingItem
                    label="Identifying biomarkers & values..."
                    isActive={state === "analyzing"}
                    isComplete={state === "finalizing" || state === "complete"}
                />
                {/* Finalizing Stage */}
                <ProcessingItem
                    label="Generating health insights..."
                    isActive={state === "finalizing"}
                    isComplete={state === "complete"}
                />
            </div>
        </div>
    );
}

function ProcessingItem({ label, isActive, isComplete }: { label: string, isActive: boolean, isComplete: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0.5, y: 10 }}
            animate={{
                opacity: isActive || isComplete ? 1 : 0.4,
                y: 0,
                scale: isActive ? 1.02 : 1
            }}
            className={cn(
                "flex items-center gap-4 p-4 rounded-[12px] border transition-all",
                isActive
                    ? "bg-white border-sky-200 shadow-md shadow-sky-100"
                    : isComplete
                        ? "bg-emerald-50/50 border-emerald-100"
                        : "bg-[#F5F4EF] border-transparent"
            )}
        >
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                isComplete ? "bg-emerald-500" : isActive ? "bg-sky-500" : "bg-[#E8E6DF]"
            )}>
                {isComplete ? (
                    <Check className="w-4 h-4 text-white" />
                ) : (
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                )}
            </div>
            <span className={cn(
                "text-sm font-medium",
                isComplete ? "text-emerald-700" : isActive ? "text-sky-700" : "text-[#A8A29E]"
            )}>
                {label}
            </span>
        </motion.div>
    )
}
