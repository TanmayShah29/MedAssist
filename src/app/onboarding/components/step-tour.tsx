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
