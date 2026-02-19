"use client";

import { useOnboardingStore } from "@/lib/onboarding-store";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SYMPTOM_OPTIONS } from "@/lib/constants";

export function StepSymptoms() {
    const {
        selectedSymptoms,
        toggleSymptom,
        setStep,
        completeStep,
    } = useOnboardingStore();

    return (
        <div className="max-w-lg mx-auto w-full px-6 py-10 flex flex-col gap-8">

            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] 
                      text-sky-500 mb-2">
                    Step 2 of 5
                </p>
                <h2 className="font-display text-3xl text-[#1C1917] mb-2">
                    How are you feeling?
                </h2>
                <p className="text-[#57534E] text-sm">
                    Select all symptoms you are currently experiencing.
                    Groq AI will cross-reference these with your lab values.
                </p>
            </div>

            {/* Data flow explanation */}
            <div className="bg-[#E0F2FE] rounded-[12px] border border-[#BAE6FD] p-4 flex gap-3">
                <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center 
                        justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sky-600 text-[10px] font-bold">i</span>
                </div>
                <div>
                    <p className="text-xs font-semibold text-sky-800 mb-1">
                        How symptoms power the AI
                    </p>
                    <p className="text-xs text-sky-700 leading-relaxed">
                        Your symptoms appear as highlighted entities in the
                        AI Assistant. Groq AI correlates them with your
                        lab values — for example, fatigue + low hemoglobin =
                        flagged as potentially significant.
                    </p>
                </div>
            </div>

            {/* Symptom chips */}
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] 
                      text-[#A8A29E] mb-3">
                    Select all that apply
                </p>
                <div className="flex flex-wrap gap-2">
                    {SYMPTOM_OPTIONS.map((symptom) => {
                        const selected = selectedSymptoms.includes(symptom.label);
                        return (
                            <motion.button
                                key={symptom.label}
                                onClick={() => toggleSymptom(symptom.label)}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    "flex items-center gap-1.5 px-3.5 py-2 rounded-full",
                                    "text-sm font-medium border transition-all",
                                    selected
                                        ? "bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-200"
                                        : "bg-[#F5F4EF] text-[#57534E] border-[#E8E6DF] hover:border-sky-300 hover:bg-sky-50/50"
                                )}
                            >
                                {selected && <Check className="w-3 h-3" />}
                                {symptom.label}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Selected count */}
            {selectedSymptoms.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#F5F4EF] rounded-[12px] border border-[#E8E6DF] p-4"
                >
                    <p className="text-xs font-semibold text-[#1C1917] mb-2">
                        {selectedSymptoms.length} symptom
                        {selectedSymptoms.length > 1 ? "s" : ""} selected
                    </p>
                    <p className="text-xs text-[#57534E]">
                        Groq AI will analyse these against your lab report
                        and flag correlations in your dashboard.
                    </p>
                </motion.div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
                <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px]
                     text-sm font-medium text-[#57534E] 
                     hover:bg-[#E8E6DF] transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>

                <motion.button
                    onClick={() => {
                        completeStep(2);
                        setStep(3);
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-6 py-3 
                     bg-sky-500 hover:bg-sky-600 text-white 
                     rounded-[10px] text-sm font-semibold 
                     transition-all shadow-sm shadow-sky-500/20"
                >
                    {selectedSymptoms.length === 0
                        ? "Skip for now"
                        : "Upload lab report"}
                    <ChevronRight className="w-4 h-4" />
                </motion.button>
            </div>
        </div>
    );
}
