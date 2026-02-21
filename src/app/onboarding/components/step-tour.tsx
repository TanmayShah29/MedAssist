"use client";

import { useOnboardingStore } from "@/lib/onboarding-store";
import { motion } from "framer-motion";
import { ArrowRight, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { saveLabResult, completeOnboarding } from "@/app/actions/user-data";
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

        try {
            // 1. Only save results if we actually have them
            if (analysisResult) {
                const result = await saveLabResult({
                    userId: user.id,
                    healthScore: analysisResult.healthScore,
                    riskLevel: analysisResult.riskLevel,
                    summary: analysisResult.summary,
                    labValues: analysisResult.biomarkers || [],
                });

                if (!result.success) {
                    console.error("Failed to save results:", result.error);
                }
            }

            // 2. Mark onboarding as complete via Server Action (handles both DB and server-side Cookie)
            const result = await completeOnboarding();

            if (!result.success) {
                console.error("Failed to complete onboarding:", result.error);
                // Still navigate — don't block the user
            }

            window.location.href = "/dashboard";
        } catch (err) {
            console.error("Non-fatal error completing onboarding:", err);
            window.location.href = "/dashboard";
        }
    };

    // (Removed null check for analysisResult so fallback UI always renders)

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
                Your health data is loaded and waiting. Upload your next report after your upcoming blood test to start tracking trends.
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
            >
                {isLoading ? 'Saving...' : 'Go to my dashboard →'}
            </button>
        </div>
    );
}
