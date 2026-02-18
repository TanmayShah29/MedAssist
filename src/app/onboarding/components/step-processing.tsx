"use client";

import { useOnboardingStore } from "@/lib/onboarding-store";
import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";
import { Check, Shield, Search, Brain, Activity, AlertCircle, RotateCcw, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// Simulation steps (cosmetic animation — runs independently of real API)
const PROCESS_STEPS = [
    { id: "ocr", label: "Scanning document structure...", icon: Search },
    { id: "ner", label: "Groq AI: Extracting biomarkers...", icon: Brain },
    { id: "validation", label: "Validating reference ranges...", icon: Shield },
    { id: "synthesis", label: "Synthesizing health insights...", icon: Activity },
];

export function StepProcessing() {
    const { setStep, completeStep, setExtractedData, setAnalysisResult } = useOnboardingStore();
    const [currentProcess, setCurrentProcess] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const hasStarted = useRef(false);

    const goBackToUpload = () => {
        setError(null);
        setCurrentProcess(0);
        hasStarted.current = false;
        setStep(3);
    };

    const runProcessing = async () => {
        try {
            setError(null);

            // Get file from onboarding store
            const file = useOnboardingStore.getState().uploadedFile;
            const symptoms = useOnboardingStore.getState().selectedSymptoms;

            if (!file || !(file instanceof File)) {
                // File is missing or was lost during serialization — go back to upload
                goBackToUpload();
                return;
            }

            // Step 1-2: Extract PDF text (client-side)
            const { extractTextFromPDF, isPDFReadable } = await import("@/lib/pdf-extractor");
            const pdfText = await extractTextFromPDF(file);

            if (!isPDFReadable(pdfText)) {
                setError("This PDF appears to be scanned or image-only. Text extraction failed. Please try a digital PDF.");
                return;
            }

            // Step 3-8: Call analyze API
            const response = await fetch("/api/analyze-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: pdfText,
                    symptoms,
                    fileName: file.name,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Analysis failed");
                return;
            }

            // Save to onboarding store
            useOnboardingStore.getState().setAnalysisResult({
                biomarkers: data.biomarkers,
                healthScore: data.healthScore,
                riskLevel: data.riskLevel,
                summary: data.summary,
            });

            // Advance to next step
            onComplete();
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        }
    };

    const onComplete = () => {
        completeStep(4);
        setStep(5);
    };

    useEffect(() => {
        if (hasStarted.current) return;
        hasStarted.current = true;

        // Cosmetic animation — runs independently of real API
        const interval = setInterval(() => {
            setCurrentProcess((curr) => {
                if (curr >= PROCESS_STEPS.length - 1) {
                    clearInterval(interval);
                    return curr;
                }
                return curr + 1;
            });
        }, 1500);

        // Kick off real processing in parallel
        runProcessing();

        return () => clearInterval(interval);
    }, []);

    // Error state
    if (error) {
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
                                Analysis Error
                            </h3>
                            <p className="text-sm text-[#57534E] leading-relaxed">
                                {error}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setError(null);
                            setCurrentProcess(0);
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

                    <p className="mt-3 text-xs text-[#A8A29E] text-center leading-relaxed">
                        <strong>Tip:</strong> Scanned or image-only PDFs can&apos;t be read.
                        Use a digitally generated PDF from your lab portal.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto w-full px-6 py-20 flex flex-col items-center">

            {/* Animated Orbiting Ring */}
            <div className="relative w-32 h-32 mb-12 flex items-center justify-center">
                {/* Outer ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 8 }}
                    className="absolute inset-0 rounded-full border border-sky-100"
                />
                {/* Spinning gradient segment */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 3 }}
                    className="absolute inset-0 rounded-full border-t-2 border-sky-500"
                />

                {/* Inner Icon */}
                <div className="w-16 h-16 rounded-2xl bg-sky-50 
                        flex items-center justify-center shadow-sm">
                    <Brain className="w-8 h-8 text-sky-500 animate-pulse" />
                </div>
            </div>

            <h2 className="font-display text-2xl text-[#1C1917] mb-8 text-center">
                Analysing your data...
            </h2>

            {/* Process list */}
            <div className="w-full max-w-sm space-y-4">
                {PROCESS_STEPS.map((step, idx) => {
                    const isComplete = currentProcess > idx;
                    const isCurrent = currentProcess === idx;
                    const isPending = currentProcess < idx;

                    const Icon = step.icon;

                    return (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0.5, y: 10 }}
                            animate={{
                                opacity: isPending ? 0.4 : 1,
                                y: 0,
                                scale: isCurrent ? 1.02 : 1
                            }}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-[12px] border transition-all",
                                isCurrent
                                    ? "bg-white border-sky-200 shadow-md shadow-sky-100"
                                    : isComplete
                                        ? "bg-emerald-50/50 border-emerald-100"
                                        : "bg-[#F5F4EF] border-transparent"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                isComplete ? "bg-emerald-500" : isCurrent ? "bg-sky-500" : "bg-[#E8E6DF]"
                            )}>
                                {isComplete ? (
                                    <Check className="w-4 h-4 text-white" />
                                ) : (
                                    <Icon className="w-4 h-4 text-white" />
                                )}
                            </div>
                            <span className={cn(
                                "text-sm font-medium",
                                isComplete ? "text-emerald-700" : isCurrent ? "text-sky-700" : "text-[#A8A29E]"
                            )}>
                                {step.label}
                            </span>
                            {isCurrent && (
                                <div className="ml-auto flex gap-1">
                                    <span className="w-1 h-1 bg-sky-500 rounded-full animate-bounce" />
                                    <span className="w-1 h-1 bg-sky-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                                    <span className="w-1 h-1 bg-sky-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

        </div>
    );
}
