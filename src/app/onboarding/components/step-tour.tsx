"use client";

import { useOnboardingStore } from "@/lib/onboarding-store";
import { ArrowRight, CheckCircle2 } from "lucide-react";
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
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#D1FAE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto'
            }}>
                <CheckCircle2 size={32} color="#10B981" />
            </div>
            <h2 style={{
                fontFamily: 'Instrument Serif',
                fontSize: 32,
                color: '#1C1917',
                margin: '0 0 12px 0'
            }}>
                Your dashboard is ready
            </h2>
            <p style={{ fontSize: 15, color: '#57534E', marginBottom: 32, maxWidth: 360, margin: '0 auto 32px auto' }}>
                {analysisResult
                    ? `We found ${analysisResult.biomarkers.length} biomarkers in your report. Your health data is loaded and waiting.`
                    : 'Your profile is set up. Upload your first lab report to see your health overview.'}
            </p>
            <button
                onClick={() => handleFinish()}
                disabled={isLoading}
                style={{
                    background: '#0EA5E9',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    padding: '14px 36px',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1
                }}
                className="flex items-center gap-2 mx-auto"
            >
                {isLoading ? 'Saving...' : 'Go to my dashboard'}
                {!isLoading && <ArrowRight size={18} />}
            </button>
        </div>
    );
}
