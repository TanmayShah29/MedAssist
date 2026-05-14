"use client";

import { useOnboardingStore } from "@/lib/onboarding-store";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Check } from "lucide-react";
import { StepBasicInfo } from "./components/step-basic-info";
import { StepSymptoms } from "./components/step-symptoms";
import { StepUpload } from "./components/step-upload";
import { StepProcessing } from "./components/step-processing";
import { StepTour } from "./components/step-tour";
import { ExtractionErrorBoundary } from "@/components/pipeline/ExtractionErrorBoundary";

const STEP_LABELS = [
    "Profile",
    "Context",
    "Report",
    "Review",
    "Ready",
];

const STEP_CONTEXT = [
    {
        title: "Set your clinical baseline",
        detail: "Reference ranges can depend on age and biological sex. This makes the first analysis less generic.",
    },
    {
        title: "Add the symptoms worth connecting",
        detail: "Symptoms are optional, but they help turn lab values into useful doctor questions.",
    },
    {
        title: "Choose how to bring in results",
        detail: "Upload a PDF, enter values manually, or skip and add a report later from the dashboard.",
    },
    {
        title: "Check the extraction before saving",
        detail: "AI reads the report, then you confirm the values before the dashboard is built.",
    },
    {
        title: "Head into your prep dashboard",
        detail: "Your next screen organizes the report into talking points, trends, and doctor questions.",
    },
];

export default function OnboardingPage() {
    const { currentStep } = useOnboardingStore();
    const router = useRouter();

    // Safety check: if they somehow get here but are done, send them to dashboard
    useEffect(() => {
        const checkStatus = async () => {
            if (typeof window !== 'undefined') {
                const isComplete = document.cookie.includes('onboarding_complete=true');
                if (isComplete) {
                    router.push('/dashboard');
                }
            }
        };
        checkStatus();
    }, [router]);

    return (
        <div className="min-h-[100dvh] bg-[#FAFAF7] flex flex-col">

            {/* Header */}
            <div className="border-b border-[#E8E6DF] bg-[#F5F4EF]/92">
                <div className="max-w-4xl mx-auto px-6 py-4">

                    {/* Logo */}
                    <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-sky-500 
                            flex items-center justify-center">
                                <Shield className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="font-display text-lg text-[#1C1917]">
                                MedAssist
                            </span>
                        </div>
                        <div className="max-w-md sm:text-right">
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-sky-600">
                                Step {currentStep} of {STEP_LABELS.length}
                            </p>
                            <p className="text-sm font-semibold text-[#1C1917] mt-1">
                                {STEP_CONTEXT[currentStep - 1]?.title}
                            </p>
                            <p className="text-xs leading-relaxed text-[#57534E] mt-1">
                                {STEP_CONTEXT[currentStep - 1]?.detail}
                            </p>
                        </div>
                    </div>

                    {/* Progress steps */}
                    <div className="flex items-center gap-0 overflow-x-auto pb-1 scrollbar-hide">
                        {STEP_LABELS.map((label, idx) => {
                            const stepNum = idx + 1;
                            const isComplete = currentStep > stepNum;
                            const isActive = currentStep === stepNum;
                            const isLast = idx === STEP_LABELS.length - 1;

                            return (
                                <div key={label} className="flex items-center grow shrink basis-0 last:flex-none">
                                    <div className="flex flex-col items-center">
                                        {/* Step circle */}
                                        <motion.div
                                            animate={{
                                                backgroundColor: isComplete
                                                    ? "#10B981"
                                                    : isActive
                                                        ? "#0EA5E9"
                                                        : "#E8E6DF",
                                            }}
                                            className="w-7 h-7 rounded-full flex items-center 
                                 justify-center text-xs font-semibold"
                                            style={{ color: isComplete || isActive ? "white" : "#57534E" }}
                                        >
                                            {isComplete ? (
                                                <Check className="w-3.5 h-3.5" />
                                            ) : (
                                                stepNum
                                            )}
                                        </motion.div>
                                        {/* Label */}
                                        <span className={`text-[9px] font-medium mt-1 
                      whitespace-nowrap 
                      ${isActive ? "text-sky-600"
                                                : isComplete ? "text-emerald-600"
                                                    : "text-[#57534E]"}`}>
                                            {label}
                                        </span>
                                    </div>

                                    {/* Connector */}
                                    {!isLast && (
                                        <motion.div
                                            animate={{
                                                backgroundColor: isComplete ? "#10B981" : "#E8E6DF",
                                            }}
                                            className="grow shrink basis-0 h-0.5 mb-4 mx-1"
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Step content */}
            <div className="grow shrink basis-0 flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0.01, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0.01, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="grow shrink basis-0 flex flex-col"
                    >
                        {currentStep === 1 && <StepBasicInfo />}
                        {currentStep === 2 && <StepSymptoms />}
                        {currentStep === 3 && <StepUpload />}
                        {currentStep === 4 && (
                            <ExtractionErrorBoundary>
                                <StepProcessing />
                            </ExtractionErrorBoundary>
                        )}
                        {currentStep === 5 && <StepTour />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
