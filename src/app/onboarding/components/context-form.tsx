import { useOnboardingStore } from "@/lib/onboarding-store";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { BLOOD_TYPES, SYMPTOM_OPTIONS } from "@/lib/constants";
import { useState } from "react";

export function ContextForm({ onComplete }: { onComplete: () => void }) {
    const { basicInfo, setBasicInfo, selectedSymptoms, toggleSymptom } = useOnboardingStore();
    const canAdvance = basicInfo.firstName && basicInfo.age && basicInfo.sex;

    return (
        <motion.div 
            initial={{ opacity: 0.01, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto w-full px-6 py-10 flex flex-col gap-10"
        >
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-500 mb-2">
                    Step 2 of 4
                </p>
                <h2 className="font-display text-3xl text-[#0F172A] mb-2">
                    Add your clinical context
                </h2>
                <p className="text-[#475569] text-sm leading-relaxed">
                    While we analyze your report, this helps the AI interpret the markers accurately for your specific demographics.
                </p>
            </div>

            {/* Profile Section */}
            <div className="space-y-5 bg-white p-6 rounded-[16px] border border-[#EBEAE4] shadow-sm">
                <h3 className="text-[14px] font-bold text-[#0F172A]">1. Basic Profile</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8] mb-1.5 block">
                            First name *
                        </label>
                        <input
                            type="text"
                            value={basicInfo.firstName}
                            onChange={e => setBasicInfo({ firstName: e.target.value })}
                            placeholder="John"
                            className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#EBEAE4] rounded-[10px] text-[15px] focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8] mb-1.5 block">
                            Last name
                        </label>
                        <input
                            type="text"
                            value={basicInfo.lastName}
                            onChange={e => setBasicInfo({ lastName: e.target.value })}
                            placeholder="Doe"
                            className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#EBEAE4] rounded-[10px] text-[15px] focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8] mb-1.5 block">
                            Age *
                        </label>
                        <input
                            type="number"
                            value={basicInfo.age}
                            onChange={e => setBasicInfo({ age: parseInt(e.target.value, 10) || "" })}
                            placeholder="32"
                            className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#EBEAE4] rounded-[10px] text-[15px] focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8] mb-1.5 block">
                            Biological sex *
                        </label>
                        <div className="flex gap-2">
                            {["male", "female", "other"].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setBasicInfo({ sex: s as any })}
                                    className={cn(
                                        "grow py-3 rounded-[10px] text-sm font-medium border transition-all capitalize",
                                        basicInfo.sex === s
                                            ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                                            : "bg-[#FFFFFF] text-[#475569] border-[#EBEAE4] hover:border-sky-300"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Symptoms Section */}
            <div className="space-y-4 bg-white p-6 rounded-[16px] border border-[#EBEAE4] shadow-sm">
                <h3 className="text-[14px] font-bold text-[#0F172A]">2. How are you feeling? <span className="text-[#94A3B8] font-normal">(Optional)</span></h3>
                <div className="flex flex-wrap gap-2">
                    {SYMPTOM_OPTIONS.map((symptom) => {
                        const selected = selectedSymptoms.includes(symptom.label);
                        return (
                            <motion.button
                                key={symptom.label}
                                onClick={() => toggleSymptom(symptom.label)}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-all",
                                    selected
                                        ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                                        : "bg-[#FFFFFF] text-[#475569] border-[#EBEAE4] hover:border-sky-300 hover:bg-sky-50/50"
                                )}
                            >
                                {selected && <Check className="w-3 h-3" />}
                                {symptom.label}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Next button */}
            <div className="flex justify-end pt-2 pb-8">
                <motion.button
                    onClick={() => {
                        if (canAdvance) onComplete();
                    }}
                    disabled={!canAdvance}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                        "flex items-center gap-2 px-8 py-3 rounded-[10px] text-sm font-semibold transition-all",
                        canAdvance
                            ? "bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20"
                            : "bg-[#EBEAE4] text-[#94A3B8] cursor-not-allowed"
                    )}
                >
                    Continue to Review
                    <ChevronRight className="w-4 h-4" />
                </motion.button>
            </div>
        </motion.div>
    );
}
