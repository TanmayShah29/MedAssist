"use client";

import { useOnboardingStore } from "@/lib/onboarding-store";
import { ArrowRight, CheckCircle2, ClipboardList, MessageSquareText, TrendingUp } from "lucide-react";
import { useState } from "react";
import { completeOnboarding } from "@/app/actions/user-data";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export function StepTour() {
    const { analysisResult } = useOnboardingStore();
    const [isLoading, setIsLoading] = useState(false);

    const handleFinish = async () => {
        setIsLoading(true);

        try {
            // Results were already saved to Supabase by /api/analyze-report.
            // All we need here is to mark onboarding as complete.
            const result = await completeOnboarding();

            if (!result.success) {
                logger.error("Failed to complete onboarding:", result.error);
                toast.error("Could not finalize onboarding. Please try again.");
                setIsLoading(false);
                return;
            }

            toast.success("Welcome! Your health dashboard is ready.");
            window.location.href = "/dashboard";
        } catch (err) {
            logger.error("Non-fatal error completing onboarding:", err);
            window.location.href = "/dashboard";
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-12 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                <CheckCircle2 size={32} />
            </div>
            <h2 className="font-display text-4xl leading-tight text-[#1C1917]">
                {analysisResult ? "Your first prep sheet is ready" : "Your workspace is ready"}
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#57534E]">
                {analysisResult
                    ? `We found ${analysisResult.biomarkers.length} biomarkers. Start with the one-page brief, then review trends and ask follow-up questions.`
                    : 'Your profile is set up. The dashboard will guide you to upload your first report when you are ready.'}
            </p>
            <div className="my-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                    { icon: ClipboardList, title: "Brief", text: "Key results and visit focus" },
                    { icon: TrendingUp, title: "Trends", text: "What changed over time" },
                    { icon: MessageSquareText, title: "Questions", text: "What to ask your doctor" },
                ].map((item) => (
                    <div key={item.title} className="rounded-[14px] border border-[#E8E6DF] bg-white/70 p-4 text-left">
                        <item.icon className="mb-3 h-5 w-5 text-sky-500" />
                        <p className="text-sm font-bold text-[#1C1917]">{item.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-[#57534E]">{item.text}</p>
                    </div>
                ))}
            </div>
            <button
                onClick={() => handleFinish()}
                disabled={isLoading}
                className="btn btn-primary btn-lg mx-auto"
            >
                {isLoading ? 'Saving...' : 'Go to my prep dashboard'}
                {!isLoading && <ArrowRight size={18} />}
            </button>
        </div>
    );
}
