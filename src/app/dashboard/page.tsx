"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import {
    Upload,
    Check,
    ChevronRight,
    Activity,
    Calendar,
    FileText,
    AlertCircle,
    Beaker
} from "lucide-react";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────
interface DashboardBiomarker {
    id: string;
    name: string;
    value: number;
    unit: string;
    status: "optimal" | "warning" | "critical";
    reference_min: number | null;
    reference_max: number | null;
    category: string;
    confidence: number;
    ai_interpretation: string;
    created_at: string;
}

interface DashboardData {
    biomarkers: DashboardBiomarker[];
    symptoms: { symptom: string }[];
    profile: { first_name: string; last_name: string } | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function calculateHealthScore(biomarkers: DashboardBiomarker[]): number {
    if (!biomarkers.length) return 0;
    const optimal = biomarkers.filter(b => b.status === "optimal").length;
    const warning = biomarkers.filter(b => b.status === "warning").length;
    const total = biomarkers.length;
    return Math.round(((optimal * 1) + (warning * 0.5)) / total * 100);
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function DashboardSkeleton() {
    return (
        <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6 animate-pulse">
            <div className="h-8 w-64 bg-[#E8E6DF] rounded-lg" />
            <div className="h-40 bg-[#E8E6DF] rounded-[18px]" />
            <div className="grid grid-cols-3 gap-4">
                <div className="h-24 bg-[#E8E6DF] rounded-[14px]" />
                <div className="h-24 bg-[#E8E6DF] rounded-[14px]" />
                <div className="h-24 bg-[#E8E6DF] rounded-[14px]" />
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="h-64 bg-[#E8E6DF] rounded-[14px]" />
                <div className="h-64 bg-[#E8E6DF] rounded-[14px]" />
            </div>
        </div>
    );
}

// ── Charts ─────────────────────────────────────────────────────────────────
function WellnessTrendChart({ biomarkers }: { biomarkers: DashboardBiomarker[] }) {
    if (biomarkers.length === 0) return null;

    // Use real biomarker scores as bar heights (normalized 0-100)
    const bars = biomarkers.slice(0, 7).map(b => {
        if (b.status === "optimal") return 90;
        if (b.status === "warning") return 55;
        return 25;
    });

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-end justify-between h-full gap-2 px-2 pb-2">
                {bars.map((h, i) => (
                    <div key={i} className="w-full bg-sky-100 rounded-t-sm relative group">
                        <div
                            style={{ height: `${h}%` }}
                            className="absolute bottom-0 w-full bg-sky-500 rounded-t-sm transition-all duration-500 group-hover:bg-sky-600"
                        />
                    </div>
                ))}
            </div>
            {biomarkers.length <= 1 && (
                <p className="text-xs text-[#A8A29E] text-center mt-2">
                    Upload more reports over time to see trends.
                </p>
            )}
        </div>
    );
}

function SystemBalanceRadar() {
    return (
        <div className="relative h-full nav-link flex items-center justify-center">
            <div className="absolute inset-0 border border-slate-200 rounded-full scale-50" />
            <div className="absolute inset-0 border border-slate-200 rounded-full scale-75" />
            <div className="absolute inset-0 border border-slate-200 rounded-full scale-100" />
            <svg viewBox="0 0 100 100" className="w-full h-full p-4 overflow-visible">
                <polygon points="50,10 90,40 70,90 30,90 10,40" fill="rgba(14, 165, 233, 0.15)" stroke="#0EA5E9" strokeWidth="2" />
            </svg>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData>({
        biomarkers: [],
        symptoms: [],
        profile: null,
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/auth");
                return;
            }

            const { data: biomarkers } = await supabase
                .from("biomarkers")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            const { data: symptoms } = await supabase
                .from("symptoms")
                .select("*")
                .eq("user_id", user.id);

            const { data: profile } = await supabase
                .from("profiles")
                .select("first_name, last_name")
                .eq("id", user.id)
                .single();

            setData({
                biomarkers: biomarkers || [],
                symptoms: symptoms || [],
                profile,
            });
            setLoading(false);
        };

        fetchDashboardData();
    }, [router]);

    // Loading state
    if (loading) return <DashboardSkeleton />;

    // Derived values
    const { biomarkers, symptoms, profile } = data;
    const healthScore = calculateHealthScore(biomarkers);
    const optimalCount = biomarkers.filter(b => b.status === "optimal").length;
    const warningCount = biomarkers.filter(b => b.status === "warning").length;
    const criticalCount = biomarkers.filter(b => b.status === "critical").length;
    const priorities = biomarkers
        .filter(b => b.status === "critical" || b.status === "warning")
        .sort((a, b) => (a.status === "critical" ? -1 : 1))
        .slice(0, 3);

    const userName = profile ? `${profile.first_name} ${profile.last_name}` : "User";

    // ── Empty state ────────────────────────────────────────────────────────
    if (biomarkers.length === 0) {
        return (
            <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
                <div>
                    <h1 className="font-display text-3xl text-[#1C1917]">
                        Clinical Overview
                    </h1>
                    <p className="text-[#A8A29E] text-sm mt-1">
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

    // ── Main dashboard with real data ──────────────────────────────────────
    return (
        <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">

            {/* PAGE HEADER */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="font-display text-3xl text-[#1C1917]">
                        Clinical Overview
                    </h1>
                    <p className="text-[#A8A29E] text-sm mt-1">
                        {userName} · {biomarkers.length} biomarkers tracked ·
                        Last updated {biomarkers[0]?.created_at ? new Date(biomarkers[0].created_at).toLocaleDateString() : "recently"}
                    </p>
                </div>
                <button
                    onClick={() => router.push("/onboarding")}
                    className="flex items-center gap-2 px-4 py-2.5 
                               bg-sky-500 hover:bg-sky-600 text-white 
                               rounded-[10px] text-sm font-medium 
                               transition-colors shadow-sm shadow-sky-500/20"
                >
                    <Upload className="w-4 h-4" />
                    Upload Report
                </button>
            </div>


            {/* ROW 1: HEALTH SCORE HERO */}
            <div className="bg-[#E0F2FE] rounded-[18px] border border-[#BAE6FD] p-6">
                <div className="flex items-center justify-between">

                    {/* Score */}
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] 
                          text-sky-400 mb-1">
                            Overall Health Score
                        </p>
                        <div className="flex items-baseline gap-3">
                            <span className="font-display text-6xl text-sky-700">{healthScore}</span>
                            <span className="text-sky-400 text-xl">/100</span>
                        </div>
                        <p className="text-sky-600 text-sm mt-1">
                            Based on {biomarkers.length} biomarker{biomarkers.length !== 1 ? "s" : ""}
                        </p>
                    </div>

                    {/* Progress ring */}
                    <div className="relative w-28 h-28">
                        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none"
                                stroke="#BAE6FD" strokeWidth="8" />
                            <circle cx="50" cy="50" r="42" fill="none"
                                stroke="#0EA5E9" strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 42}`}
                                strokeDashoffset={`${2 * Math.PI * 42 * (1 - healthScore / 100)}`} />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center 
                             font-display text-xl text-sky-700">
                            {healthScore}%
                        </span>
                    </div>

                    {/* Status counts */}
                    <div className="flex gap-4">
                        <div className="text-center px-5 py-3 bg-[#ECFDF5] 
                            rounded-[12px] border border-emerald-200">
                            <p className="font-display text-2xl text-emerald-600">{optimalCount}</p>
                            <p className="text-xs text-emerald-600 mt-0.5">Optimal</p>
                        </div>
                        <div className="text-center px-5 py-3 bg-[#FFFBEB] 
                            rounded-[12px] border border-amber-200">
                            <p className="font-display text-2xl text-amber-600">{warningCount}</p>
                            <p className="text-xs text-amber-600 mt-0.5">Monitor</p>
                        </div>
                        <div className="text-center px-5 py-3 bg-[#FEF2F2] 
                            rounded-[12px] border border-red-200">
                            <p className="font-display text-2xl text-red-600">{criticalCount}</p>
                            <p className="text-xs text-red-600 mt-0.5">Action</p>
                        </div>
                    </div>

                </div>
            </div>


            {/* ROW 2: TODAY'S PRIORITIES */}
            {priorities.length > 0 && (
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] 
                          text-[#A8A29E] mb-3">
                        Today&apos;s Priorities
                    </p>
                    <div className="space-y-3">
                        {priorities.map(b => {
                            const isCritical = b.status === "critical";
                            return (
                                <div
                                    key={b.id}
                                    className={cn(
                                        "rounded-[14px] border p-4 flex items-start gap-4",
                                        isCritical
                                            ? "bg-[#FEF2F2] border-[#FECACA]"
                                            : "bg-[#FFFBEB] border-[#FDE68A]"
                                    )}
                                >
                                    <div className={cn(
                                        "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                                        isCritical ? "bg-red-500" : "bg-amber-500"
                                    )} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#1C1917]">
                                            {b.name} — {b.value} {b.unit}
                                        </p>
                                        <p className="text-xs text-[#57534E] mt-0.5">
                                            {b.ai_interpretation || `Status: ${b.status}`}
                                        </p>
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => router.push(`/assistant?q=What+does+my+${encodeURIComponent(b.name)}+level+mean`)}
                                                className={cn(
                                                    "px-3 py-1.5 text-white text-xs font-medium rounded-[8px] transition-colors",
                                                    isCritical
                                                        ? "bg-red-500 hover:bg-red-600"
                                                        : "bg-amber-500 hover:bg-amber-600"
                                                )}
                                            >
                                                Ask AI what this means →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}


            {/* ROW 3: TWO COLUMN */}
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 md:gap-5 items-stretch">

                {/* LEFT COLUMN */}
                <div className="flex flex-col gap-4 md:gap-5">

                    {/* Wellness Trend Chart */}
                    <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] p-4 md:p-5 flex flex-col flex-1 min-h-[280px] md:min-h-[320px]">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-display text-lg text-[#44403C]">Wellness Trend</h3>
                            </div>
                            <AnimatedTabs
                                tabs={[
                                    { id: "3m", label: "3M" },
                                    { id: "6m", label: "6M" },
                                    { id: "1y", label: "1Y" },
                                    { id: "all", label: "ALL" },
                                ]}
                                variant="boxed"
                                size="sm"
                                defaultTab="6m"
                            />
                        </div>
                        <div className="flex-1 min-h-[200px]">
                            <WellnessTrendChart biomarkers={biomarkers} />
                        </div>
                    </div>

                    {/* System Balance Radar */}
                    <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] 
                          p-5 flex flex-col flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] 
                          text-[#A8A29E] mb-1">
                            System Balance
                        </p>
                        <p className="text-base font-semibold text-[#1C1917] mb-4">
                            Body systems overview
                        </p>
                        <div className="flex-1 min-h-[180px]">
                            <SystemBalanceRadar />
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN */}
                <div className="flex flex-col gap-5">

                    {/* Biomarker Breakdown */}
                    <div className="bg-[#0F172A] rounded-[14px] border border-[#334155] 
                          p-5 flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] 
                            text-[#475569]">
                                Biomarker Breakdown
                            </p>
                            <span className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 
                                 animate-pulse" />
                                <span className="text-[10px] text-emerald-500 font-mono">
                                    {biomarkers.length} tracked
                                </span>
                            </span>
                        </div>
                        <div className="flex-1 space-y-2.5">
                            {biomarkers.slice(0, 6).map(b => (
                                <div key={b.id}
                                    className="flex items-center gap-2.5 py-1.5 border-b 
                                border-[#1E293B] last:border-0">
                                    <div className={cn(
                                        "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
                                        b.status === "optimal" ? "bg-emerald-500" :
                                            b.status === "warning" ? "bg-amber-500" : "bg-red-500"
                                    )}>
                                        <Check className="w-2.5 h-2.5 text-white" />
                                    </div>
                                    <span className="text-xs text-[#94A3B8] font-mono flex-1">
                                        {b.name}
                                    </span>
                                    <span className="text-[10px] text-[#475569] font-mono">
                                        {b.value} {b.unit}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reported Symptoms */}
                    <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] 
                          p-5 flex flex-col flex-1">
                        <p className="text-base font-semibold text-[#1C1917] mb-4">
                            Reported Symptoms
                        </p>
                        <div className="flex-1 space-y-2.5">
                            {symptoms.length > 0 ? (
                                symptoms.map((s, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-[#FAFAF7] 
                                        rounded-[10px] border border-[#E8E6DF]">
                                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                        <span className="text-sm text-[#1C1917]">{s.symptom}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-[#A8A29E]">No symptoms reported</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>


            {/* ROW 4: UPLOAD REPORT SECTION */}
            <div className="bg-[#F5F4EF] rounded-[18px] border border-[#E8E6DF] p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-base font-semibold text-[#1C1917]">
                            Have new lab results?
                        </p>
                        <p className="text-sm text-[#57534E] mt-0.5">
                            Upload your report and Groq AI will analyze all biomarkers
                            in seconds — updating your entire dashboard automatically.
                        </p>
                    </div>
                </div>
                <div
                    onClick={() => router.push("/onboarding")}
                    className="border-2 border-dashed border-[#D9D6CD] rounded-[12px] 
                        p-8 text-center hover:border-sky-400 hover:bg-sky-50/30 
                        transition-all cursor-pointer group"
                >
                    <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center 
                          justify-center mx-auto mb-3 
                          group-hover:bg-sky-200 transition-colors">
                        <Upload className="w-5 h-5 text-sky-500" />
                    </div>
                    <p className="text-sm font-medium text-[#57534E]">
                        Drop your lab report here or{" "}
                        <span className="text-sky-500 hover:text-sky-600 cursor-pointer">
                            click to browse
                        </span>
                    </p>
                    <p className="text-xs text-[#A8A29E] mt-1">
                        Supports PDF, JPG, PNG · Maximum 10MB
                    </p>
                    <p className="text-xs text-[#A8A29E] mt-0.5">
                        Groq AI will extract all values automatically
                    </p>
                </div>
            </div>

        </div>
    );
}
