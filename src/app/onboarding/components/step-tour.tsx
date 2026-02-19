"use client";

import { useOnboardingStore } from "@/lib/onboarding-store";
import { motion } from "framer-motion";
import { ArrowRight, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { saveLabResult } from "@/app/actions/user-data";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function StepTour() {
    const {
        analysisResult,
    } = useOnboardingStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleFinish = async () => {
        setIsLoading(true);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            toast.error("You must be logged in to save results.");
            setIsLoading(false);
            return;
        }

        // Always mark onboarding as complete
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ onboarding_complete: true })
            .eq('id', user.id);

        if (profileError) {
            console.error("Profile update error:", profileError);
            toast.error("Failed to update profile status.");
            setIsLoading(false);
            return;
        }

        // Only save results if we actually have them
        if (analysisResult) {
            const result = await saveLabResult({
                userId: user.id,
                healthScore: analysisResult.healthScore,
                riskLevel: analysisResult.riskLevel,
                summary: analysisResult.summary,
                labValues: analysisResult.biomarkers,
            });

            if (!result.success) {
                toast.error(result.error || "Failed to save results, but profile created.");
            } else {
                toast.success("Results saved successfully!");
            }
        } else {
            toast.success("Welcome to MedAssist!");
        }

        router.push("/dashboard");
    };

    // If no analysis result (user skipped), show empty but happy state
    if (!analysisResult) {
        return (
            <div className="max-w-4xl mx-auto w-full px-6 py-20 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="font-display text-3xl text-[#1C1917] mb-4">
                    You&apos;re all set!
                </h2>
                <p className="text-[#57534E] max-w-md mx-auto mb-8 text-lg">
                    Your profile is created. You can explore the dashboard now and upload your first lab report whenever you&apos;re ready.
                </p>
                <div className="flex justify-center">
                    <button
                        onClick={handleFinish}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-8 py-4 bg-sky-500 
                         hover:bg-sky-600 text-white font-semibold rounded-[14px] 
                         shadow-lg shadow-sky-500/25 transition-all 
                         hover:-translate-y-0.5 disabled:opacity-70"
                    >
                        {isLoading ? "Setting up..." : "Go to Dashboard"}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )
    }

    const criticalItems = analysisResult.biomarkers.filter(v => v.status === "critical");
    const warningItems = analysisResult.biomarkers.filter(v => v.status === "warning");

    return (
        <div className="max-w-4xl mx-auto w-full px-6 py-10">

            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 
                        text-emerald-700 rounded-full text-xs font-semibold mb-4">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Analysis Complete
                </div>
                <h2 className="font-display text-4xl text-[#1C1917] mb-3">
                    Here is what we found
                </h2>
                <p className="text-[#57534E]">
                    We analyzed {analysisResult.biomarkers.length} biomarkers from your report.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

                {/* Health Score Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[20px] border border-[#E8E6DF] p-6 
                     shadow-sm flex flex-col items-center text-center"
                >
                    <div className="w-12 h-12 rounded-[14px] bg-sky-100 
                          flex items-center justify-center mb-4">
                        <Activity className="w-6 h-6 text-sky-600" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase 
                           tracking-[0.12em] text-[#A8A29E] mb-1">
                        Overall Health Score
                    </span>
                    <div className="text-5xl font-display text-[#1C1917] mb-2">
                        {analysisResult.healthScore}
                        <span className="text-2xl text-[#A8A29E]">/100</span>
                    </div>
                    <p className="text-xs text-[#57534E]">
                        Based on {analysisResult.biomarkers.length} biomarkers
                    </p>
                </motion.div>

                {/* Action Items Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-[20px] border border-[#E8E6DF] p-6 
                     shadow-sm col-span-1 md:col-span-2"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-[12px] bg-amber-100 
                            flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-[#1C1917]">Attention Needed</h3>
                            <p className="text-xs text-[#57534E]">
                                {criticalItems.length + warningItems.length} items flagged for review
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {[...criticalItems, ...warningItems].map((item, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 
                                              bg-[#FAFAF7] rounded-[10px] border border-[#E8E6DF]">
                                <div className={cn(
                                    "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                    item.status === "critical" ? "bg-red-500" : "bg-amber-500"
                                )} />
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-medium text-sm text-[#1C1917]">
                                            {item.name}
                                        </span>
                                        <span className="text-xs font-mono text-[#57534E]">
                                            {item.value} {item.unit}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#57534E] leading-relaxed">
                                        {item.aiInterpretation}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={handleFinish}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-8 py-4 bg-sky-500 
                     hover:bg-sky-600 text-white font-semibold rounded-[14px] 
                     shadow-lg shadow-sky-500/25 transition-all 
                     hover:-translate-y-0.5 disabled:bg-sky-300 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Saving..." : "Go to my Dashboard"}
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>

        </div>
    );
}
