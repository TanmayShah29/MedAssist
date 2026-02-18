"use client";

import { useOnboardingStore } from "@/lib/onboarding-store";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

export function StepBasicInfo() {
    const { basicInfo, setBasicInfo, setStep, completeStep } = useOnboardingStore();

    const canAdvance = basicInfo.firstName && basicInfo.age && basicInfo.sex;

    return (
        <div className="max-w-lg mx-auto w-full px-6 py-10 flex flex-col gap-8">

            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] 
                      text-sky-500 mb-2">
                    Step 1 of 5
                </p>
                <h2 className="font-display text-3xl text-[#1C1917] mb-2">
                    Tell us about yourself
                </h2>
                <p className="text-[#57534E] text-sm">
                    This lets Groq AI personalise its analysis for your
                    age, sex and biology.
                </p>
            </div>

            {/* Why we ask — data flow explanation */}
            <div className="bg-[#E0F2FE] rounded-[12px] border border-[#BAE6FD] 
                      p-4 flex gap-3">
                <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center 
                        justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sky-600 text-[10px] font-bold">i</span>
                </div>
                <div>
                    <p className="text-xs font-semibold text-sky-800 mb-1">
                        How this data is used
                    </p>
                    <p className="text-xs text-sky-700 leading-relaxed">
                        Your age and sex are used to calculate personalised reference
                        ranges. For example, Hemoglobin optimal range differs by sex.
                        Blood type appears on your profile and emergency card.
                    </p>
                </div>
            </div>

            {/* Form fields */}
            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-semibold uppercase 
                               tracking-[0.12em] text-[#A8A29E] mb-1.5 block">
                            First name *
                        </label>
                        <input
                            type="text"
                            value={basicInfo.firstName}
                            onChange={e => setBasicInfo({ firstName: e.target.value })}
                            placeholder="John"
                            className="w-full px-4 py-3 bg-[#F5F4EF] border border-[#E8E6DF]
                         rounded-[10px] text-[16px] text-[#1C1917] 
                         placeholder-[#A8A29E]
                         focus:outline-none focus:border-sky-400 
                         focus:ring-2 focus:ring-sky-100 transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-semibold uppercase 
                               tracking-[0.12em] text-[#A8A29E] mb-1.5 block">
                            Last name
                        </label>
                        <input
                            type="text"
                            value={basicInfo.lastName}
                            onChange={e => setBasicInfo({ lastName: e.target.value })}
                            placeholder="Doe"
                            className="w-full px-4 py-3 bg-[#F5F4EF] border border-[#E8E6DF]
                         rounded-[10px] text-[16px] text-[#1C1917] 
                         placeholder-[#A8A29E]
                         focus:outline-none focus:border-sky-400 
                         focus:ring-2 focus:ring-sky-100 transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-semibold uppercase 
                               tracking-[0.12em] text-[#A8A29E] mb-1.5 block">
                            Age *
                        </label>
                        <input
                            type="number"
                            value={basicInfo.age}
                            onChange={e => setBasicInfo({ age: e.target.value })}
                            placeholder="32"
                            min="1" max="120"
                            className="w-full px-4 py-3 bg-[#F5F4EF] border border-[#E8E6DF]
                         rounded-[10px] text-[16px] text-[#1C1917]
                         placeholder-[#A8A29E]
                         focus:outline-none focus:border-sky-400 
                         focus:ring-2 focus:ring-sky-100 transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-semibold uppercase 
                               tracking-[0.12em] text-[#A8A29E] mb-1.5 block">
                            Biological sex *
                        </label>
                        <div className="flex gap-2">
                            {["male", "female", "other"].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setBasicInfo({ sex: s as any })}
                                    className={cn(
                                        "flex-1 py-3 rounded-[10px] text-sm font-medium",
                                        "border transition-all capitalize",
                                        basicInfo.sex === s
                                            ? "bg-sky-500 text-white border-sky-500"
                                            : "bg-[#F5F4EF] text-[#57534E] border-[#E8E6DF] hover:border-sky-300"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-semibold uppercase 
                             tracking-[0.12em] text-[#A8A29E] mb-1.5 block">
                        Blood type
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {BLOOD_TYPES.map(bt => (
                            <button
                                key={bt}
                                onClick={() => setBasicInfo({ bloodType: bt })}
                                className={cn(
                                    "px-3 py-2 rounded-[8px] text-sm font-medium border transition-all",
                                    basicInfo.bloodType === bt
                                        ? "bg-sky-500 text-white border-sky-500"
                                        : "bg-[#F5F4EF] text-[#57534E] border-[#E8E6DF] hover:border-sky-300"
                                )}
                            >
                                {bt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Next button */}
            <div className="flex justify-end pt-2">
                <motion.button
                    onClick={() => {
                        if (!canAdvance) return;
                        completeStep(1);
                        setStep(2);
                    }}
                    disabled={!canAdvance}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-[10px]",
                        "text-sm font-semibold transition-all",
                        canAdvance
                            ? "bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20"
                            : "bg-[#E8E6DF] text-[#A8A29E] cursor-not-allowed"
                    )}
                >
                    Continue to symptoms
                    <ChevronRight className="w-4 h-4" />
                </motion.button>
            </div>
        </div>
    );
}
