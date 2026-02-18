"use client";

import { useOnboardingStore } from "@/lib/onboarding-store";
import { AnimatePresence, motion } from "motion/react";
import { Shield, Check } from "lucide-react";
import { StepBasicInfo } from "./components/step-basic-info";
import { StepSymptoms } from "./components/step-symptoms";
import { StepUpload } from "./components/step-upload";
import { StepProcessing } from "./components/step-processing";
import { StepTour } from "./components/step-tour";

const STEP_LABELS = [
    "Your Profile",
    "Symptoms",
    "Lab Report",
    "AI Analysis",
    "Your Results",
];

export default function OnboardingPage() {
    const { currentStep } = useOnboardingStore();

    return (
        <div className="min-h-screen bg-[#FAFAF7] flex flex-col">

            {/* Header */}
            <div className="border-b border-[#E8E6DF] bg-[#F5F4EF]">
                <div className="max-w-2xl mx-auto px-6 py-4">

                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-7 h-7 rounded-xl bg-sky-500 
                            flex items-center justify-center">
                            <Shield className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-display text-lg text-[#1C1917]">
                            MedAssist
                        </span>
                    </div>

                    {/* Progress steps */}
                    <div className="flex items-center gap-0">
                        {STEP_LABELS.map((label, idx) => {
                            const stepNum = idx + 1;
                            const isComplete = currentStep > stepNum;
                            const isActive = currentStep === stepNum;
                            const isLast = idx === STEP_LABELS.length - 1;

                            return (
                                <div key={label} className="flex items-center flex-1 last:flex-none">
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
                                            style={{ color: isComplete || isActive ? "white" : "#A8A29E" }}
                                        >
                                            {isComplete ? (
                                                <Check className="w-3.5 h-3.5" />
                                            ) : (
                                                stepNum
                                            )}
                                        </motion.div>
                                        {/* Label */}
                                        <span className={`text-[9px] font-medium mt-1 
                      whitespace-nowrap hidden md:block
                      ${isActive ? "text-sky-600"
                                                : isComplete ? "text-emerald-600"
                                                    : "text-[#A8A29E]"}`}>
                                            {label}
                                        </span>
                                    </div>

                                    {/* Connector */}
                                    {!isLast && (
                                        <motion.div
                                            animate={{
                                                backgroundColor: isComplete ? "#10B981" : "#E8E6DF",
                                            }}
                                            className="flex-1 h-0.5 mb-4 mx-1"
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Step content */}
            <div className="flex-1 flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 flex flex-col"
                    >
                        {currentStep === 1 && <StepBasicInfo />}
                        {currentStep === 2 && <StepSymptoms />}
                        {currentStep === 3 && <StepUpload />}
                        {currentStep === 4 && <StepProcessing />}
                        {currentStep === 5 && <StepTour />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
