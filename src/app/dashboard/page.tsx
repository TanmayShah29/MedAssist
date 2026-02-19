"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Upload,
    Check,
    ChevronRight,
    Beaker,
    TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from "recharts";

interface LabResult {
    id: string;
    health_score: number;
    risk_level: string;
    summary: string;
    created_at: string;
    biomarkers: Biomarker[];
}

interface Biomarker {
    id: string;
    name: string;
    value: number;
    unit: string;
    status: "optimal" | "warning" | "critical";
    reference_range_min: number | null;
    reference_range_max: number | null;
    ai_interpretation: string;
}

interface DashboardData {
    latestLabResult: LabResult | null;
    profile: { first_name: string; last_name: string; blood_type?: string } | null;
    symptoms: string[];
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function DashboardSkeleton() {
    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 pt-20 lg:pt-8 pb-8 space-y-6 animate-pulse">
            <div className="h-8 w-64 bg-[#E8E6DF] rounded-lg" />
            <div className="h-40 bg-[#E8E6DF] rounded-[18px]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 bg-[#E8E6DF] rounded-[14px]" />
                <div className="h-64 bg-[#E8E6DF] rounded-[14px]" />
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        latestLabResult: null,
        profile: null,
        symptoms: [],
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/auth");
                setLoading(false);
                return;
            }

            // Fetch user profile
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("first_name, last_name, blood_type") // Assuming blood_type is available in profiles
                .eq("id", user.id)
                .single();

            if (profileError) {
                logger.error("Error fetching profile for dashboard:", profileError);
                // Continue without profile data
            }

            // Fetch latest lab result with joined biomarkers
            const { data: labResultData, error: labResultError } = await supabase
                .from("lab_results")
                .select(`
                    id,
                    health_score,
                    risk_level,
                    summary,
                    created_at,
                    biomarkers (
                        id,
                        name,
                        value,
                        unit,
                        status,
                        reference_range_min,
                        reference_range_max,
                        ai_interpretation
                    )
                `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (labResultError && labResultError.code !== 'PGRST116') { // PGRST116 means no rows found
                logger.error("Error fetching lab results for dashboard:", labResultError);
            }

            // Fetch user's recorded symptoms (if any)
            const { data: symptomsData, error: symptomsError } = await supabase
                .from("symptoms")
                .select("symptom_text") // Assuming symptom_text column
                .eq("user_id", user.id);

            if (symptomsError) {
                logger.error("Error fetching symptoms for dashboard:", symptomsError);
            }

            setDashboardData({
                latestLabResult: labResultData,
                profile: profileData,
                symptoms: symptomsData?.map(s => s.symptom_text) || [],
            });
            setLoading(false);
        };

        fetchDashboardData();
    }, [router]);

    const { latestLabResult, profile } = dashboardData;
    const healthScore = latestLabResult?.health_score || 0;
    const optimalCount = latestLabResult?.biomarkers?.filter(b => b.status === "optimal").length || 0;
    const warningCount = latestLabResult?.biomarkers?.filter(b => b.status === "warning").length || 0;
    const criticalCount = latestLabResult?.biomarkers?.filter(b => b.status === "critical").length || 0;
    const priorities = latestLabResult?.biomarkers
        ?.filter(b => b.status === "critical" || b.status === "warning")
        .sort((a, b) => (a.status === "critical" ? -1 : 1))
        .slice(0, 2) || []; // Show top 2 priorities

    if (loading) return <DashboardSkeleton />;

    const userName = profile ? `${profile.first_name} ${profile.last_name}` : "User";
    const userBloodType = profile?.blood_type || "N/A";
    const lastUpdated = latestLabResult?.created_at ? new Date(latestLabResult.created_at).toLocaleDateString() : "N/A";

    // ── Empty State ────────────────────────────────────────────────────────
    if (!latestLabResult) {
        return (
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 pt-20 lg:pt-8 pb-8 space-y-6">
                <div>
                    <h1 className="font-display text-3xl text-[#1C1917]">
                        Clinical Overview
                    </h1>
                    <p className="text-sm text-[#A8A29E] mt-1">
                        Welcome, {userName}
                    </p>
                </div>
                <div className="bg-[#F5F4EF] rounded-[18px] border border-[#E8E6DF] p-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center mx-auto mb-5">
                        <Beaker className="w-8 h-8 text-sky-400" />
                    </div>
                    <h2 className="font-display text-xl text-[#1C1917] mb-2">
                        No lab results yet
                    </h2>
                    <p className="text-sm text-[#57534E] max-w-md mx-auto mb-6">
                        Upload your first report to see your health overview.
                        Groq AI will analyze all biomarkers in seconds.
                    </p>
                    <button
                        onClick={() => router.push("/onboarding")}
                        className="inline-flex items-center gap-2 px-6 py-3 
                                   bg-sky-500 hover:bg-sky-600 text-white 
                                   rounded-[10px] text-sm font-semibold 
                                   transition-colors shadow-sm shadow-sky-500/20"
                    >
                        <Upload className="w-4 h-4" />
                        Upload report
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
