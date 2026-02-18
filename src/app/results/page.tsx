"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
    Upload,
    ChevronRight,
    MessageSquare,
    FlaskConical,
    Brain,
    Beaker
} from "lucide-react";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────────────
interface Biomarker {
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

// ── Range Position Helper ──────────────────────────────────────────────────
function getRangePosition(value: number, refMin: number | null, refMax: number | null): number {
    if (refMin != null && refMax != null && refMax > refMin) {
        return Math.min(100, Math.max(0, ((value - refMin) / (refMax - refMin)) * 100));
    }
    return 50; // center if no reference range
}

function formatRange(refMin: number | null, refMax: number | null): string {
    if (refMin != null && refMax != null) return `${refMin} - ${refMax}`;
    if (refMin != null) return `≥ ${refMin}`;
    if (refMax != null) return `< ${refMax}`;
    return "—";
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function ResultsSkeleton() {
    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-8 w-48 bg-[#E8E6DF] rounded-lg" />
                <div className="h-10 w-40 bg-[#E8E6DF] rounded-[10px]" />
            </div>
            <div className="h-10 w-96 bg-[#E8E6DF] rounded-full" />
            <div className="grid grid-cols-3 gap-4">
                <div className="h-20 bg-[#E8E6DF] rounded-[12px]" />
                <div className="h-20 bg-[#E8E6DF] rounded-[12px]" />
                <div className="h-20 bg-[#E8E6DF] rounded-[12px]" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
                <div className="space-y-0 rounded-[18px] border border-[#E8E6DF] overflow-hidden">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 bg-[#E8E6DF] border-b border-[#D9D6CD] last:border-0" />
                    ))}
                </div>
                <div className="hidden lg:block h-80 bg-[#E8E6DF] rounded-[18px]" />
            </div>
        </div>
    );
}

// ── Mobile Bottom Sheet ────────────────────────────────────────────────────
function MobileContextSheet({
    result,
    open,
    onClose,
}: {
    result: Biomarker | null;
    open: boolean;
    onClose: () => void;
}) {
    if (!result) return null;

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 400, damping: 40 }}
                        className="
                            lg:hidden fixed bottom-0 left-0 right-0 z-50
                            bg-[#F5F4EF] rounded-t-[24px]
                            border-t border-[#E8E6DF] p-5
                            pb-[calc(1.25rem+env(safe-area-inset-bottom))]
                            max-h-[85vh] overflow-y-auto shadow-2xl
                        "
                    >
                        <div className="w-10 h-1 bg-[#D9D6CD] rounded-full mx-auto mb-6" />
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-display text-2xl text-[#1C1917]">
                                    {result.name}
                                </h3>
                                <div className="flex items-center gap-3 mt-2">
                                    <span
                                        className={cn(
                                            "px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
                                            result.status === "critical"
                                                ? "bg-red-100 text-red-700"
                                                : result.status === "warning"
                                                    ? "bg-amber-100 text-amber-700"
                                                    : "bg-emerald-100 text-emerald-700"
                                        )}
                                    >
                                        {result.status}
                                    </span>
                                    <span className="text-sm text-[#57534E]">
                                        {result.value} {result.unit}
                                    </span>
                                </div>
                            </div>

                            {/* Range bar */}
                            <div className="bg-[#FAFAF7] p-4 rounded-xl border border-[#E8E6DF]">
                                <p className="text-xs font-semibold text-[#A8A29E] uppercase tracking-widest mb-2">
                                    Reference Range
                                </p>
                                <div className="relative h-2 bg-[#E8E6DF] rounded-full mb-1">
                                    <div
                                        className={cn(
                                            "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm",
                                            result.status === "optimal" ? "bg-emerald-500" :
                                                result.status === "warning" ? "bg-amber-500" : "bg-red-500"
                                        )}
                                        style={{ left: `${getRangePosition(result.value, result.reference_min, result.reference_max)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-[#A8A29E]">
                                    Range: {formatRange(result.reference_min, result.reference_max)}
                                </p>
                            </div>

                            <div className="bg-[#FAFAF7] p-4 rounded-xl border border-[#E8E6DF]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Brain className="w-4 h-4 text-sky-500" />
                                    <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
                                        AI Analysis
                                    </span>
                                </div>
                                <p className="text-sm text-[#44403C] leading-relaxed">
                                    {result.ai_interpretation || "No analysis available for this biomarker."}
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    window.location.href = `/assistant?q=Tell+me+more+about+my+${result.name}`;
                                }}
                                className="w-full py-3 bg-sky-500 text-white rounded-xl font-medium shadow-sm active:scale-[0.98] transition-all"
                            >
                                Discuss with AI Assistant
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ResultsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
    const [allBiomarkers, setAllBiomarkers] = useState<Biomarker[]>([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [selectedResult, setSelectedResult] = useState<Biomarker | null>(null);

    const fetchResults = useCallback(async (category?: string) => {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push("/auth");
            return;
        }

        let query = supabase
            .from("biomarkers")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (category && category !== "all") {
            query = query.eq("category", category);
        }

        const { data } = await query;
        setBiomarkers(data || []);

        // Also fetch all for counts (only on initial load)
        if (!category || category === "all") {
            setAllBiomarkers(data || []);
        }

        setLoading(false);
    }, [router]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    const handleCategoryChange = (category: string) => {
        setActiveCategory(category);
        setSelectedResult(null);
        fetchResults(category);
    };

    // Derive counts from allBiomarkers (full unfiltered set)
    const optimalCount = allBiomarkers.filter(b => b.status === "optimal").length;
    const warningCount = allBiomarkers.filter(b => b.status === "warning").length;
    const criticalCount = allBiomarkers.filter(b => b.status === "critical").length;

    // Category counts for tabs
    const categoryCount = (cat: string) => {
        if (cat === "all") return allBiomarkers.length;
        return allBiomarkers.filter(b => b.category === cat).length;
    };

    if (loading && biomarkers.length === 0) return <ResultsSkeleton />;

    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-8 pt-20 lg:pt-8 bg-[#FAFAF7] min-h-screen">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-display text-3xl text-[#1C1917]">Lab Results</h1>
                    <p className="text-sm text-[#A8A29E] mt-1">
                        {allBiomarkers.length} biomarker{allBiomarkers.length !== 1 ? "s" : ""} analyzed
                        {allBiomarkers[0]?.created_at && ` · Last updated ${new Date(allBiomarkers[0].created_at).toLocaleDateString()}`}
                    </p>
                </div>
                <button
                    onClick={() => router.push("/onboarding")}
                    className="flex items-center justify-center gap-2 px-4 py-3 md:py-2.5 bg-sky-500 
                               hover:bg-sky-600 text-white rounded-[10px] text-sm 
                               font-medium transition-colors w-full md:w-auto active:scale-[0.98]"
                >
                    <Upload className="w-4 h-4" />
                    Upload New Report
                </button>
            </div>

            {/* TABS */}
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-2 mb-4 scrollbar-none">
                <div className="min-w-max">
                    <AnimatedTabs
                        tabs={[
                            { id: "all", label: "All", count: categoryCount("all") },
                            { id: "hematology", label: "Hematology", count: categoryCount("hematology") },
                            { id: "inflammation", label: "Inflammation", count: categoryCount("inflammation") },
                            { id: "metabolic", label: "Metabolic", count: categoryCount("metabolic") },
                            { id: "vitamins", label: "Vitamins", count: categoryCount("vitamins") },
                        ]}
                        variant="pill"
                        onChange={handleCategoryChange}
                    />
                </div>
            </div>

            {/* STATUS SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-8">
                <div className="bg-[#ECFDF5] rounded-[12px] border border-emerald-200 
                        p-4 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <div>
                        <p className="font-display text-2xl text-emerald-600">{optimalCount}</p>
                        <p className="text-xs text-emerald-600 font-medium">Optimal Range</p>
                    </div>
                </div>
                <div className="bg-[#FFFBEB] rounded-[12px] border border-amber-200 
                        p-4 flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full bg-amber-500 flex-shrink-0", warningCount > 0 && "animate-pulse")} />
                    <div>
                        <p className="font-display text-2xl text-amber-600">{warningCount}</p>
                        <p className="text-xs text-amber-600 font-medium">Needs Attention</p>
                    </div>
                </div>
                <div className="bg-[#FEF2F2] rounded-[12px] border border-red-200 
                        p-4 flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full bg-red-500 flex-shrink-0", criticalCount > 0 && "animate-ping")} />
                    <div>
                        <p className="font-display text-2xl text-red-600">{criticalCount}</p>
                        <p className="text-xs text-red-600 font-medium">Critical Action</p>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start relative">

                {/* LEFT: RESULTS LIST */}
                <div className="bg-[#F5F4EF] rounded-[18px] border border-[#E8E6DF] overflow-hidden shadow-sm">
                    {biomarkers.length === 0 ? (
                        <div className="p-10 text-center">
                            <div className="w-12 h-12 rounded-full bg-[#E8E6DF] flex items-center justify-center mx-auto mb-3">
                                <Beaker className="w-6 h-6 text-[#A8A29E]" />
                            </div>
                            <p className="text-sm text-[#A8A29E]">No results for this category.</p>
                        </div>
                    ) : (
                        biomarkers.map((result) => {
                            const rangePos = getRangePosition(result.value, result.reference_min, result.reference_max);
                            return (
                                <div
                                    key={result.id}
                                    onClick={() => setSelectedResult(result)}
                                    className={cn(
                                        "group flex items-center justify-between p-4 md:p-5 border-b border-[#E8E6DF] last:border-0 cursor-pointer transition-all",
                                        selectedResult?.id === result.id ? "bg-[#EFECE5]" : "hover:bg-[#EFEDE6]",
                                        "min-h-[64px]"
                                    )}
                                >
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full flex-shrink-0",
                                            result.status === "critical" ? "bg-red-500" :
                                                result.status === "warning" ? "bg-amber-500" :
                                                    "bg-emerald-500"
                                        )} />
                                        <div>
                                            <p className="font-medium text-[#1C1917] text-base">{result.name}</p>
                                            <div className="flex items-center gap-2 md:hidden mt-0.5">
                                                <span className="text-xs text-[#78716C] font-semibold">
                                                    {result.value} {result.unit}
                                                </span>
                                                {result.status !== "optimal" && (
                                                    <span className={cn(
                                                        "text-[10px] px-1.5 rounded-full font-bold uppercase",
                                                        result.status === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                                    )}>
                                                        {result.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 md:gap-6">
                                        {/* Range bar — desktop */}
                                        <div className="hidden md:block w-24">
                                            <div className="relative h-1.5 bg-[#E8E6DF] rounded-full">
                                                <div
                                                    className={cn(
                                                        "absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm",
                                                        result.status === "optimal" ? "bg-emerald-500" :
                                                            result.status === "warning" ? "bg-amber-500" : "bg-red-500"
                                                    )}
                                                    style={{ left: `${rangePos}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="text-right hidden md:block">
                                            <p className="font-mono text-sm font-medium text-[#44403C]">
                                                {result.value} <span className="text-[#A8A29E] text-xs">{result.unit}</span>
                                            </p>
                                            <p className="text-[10px] text-[#A8A29E] mt-0.5">
                                                Range: {formatRange(result.reference_min, result.reference_max)}
                                            </p>
                                        </div>

                                        <div className={cn(
                                            "px-2.5 py-1 rounded-full text-xs font-semibold min-w-[80px] text-center hidden md:block",
                                            result.status === "critical" ? "bg-red-100 text-red-700" :
                                                result.status === "warning" ? "bg-amber-100 text-amber-700" :
                                                    "bg-emerald-100 text-emerald-700"
                                        )}>
                                            {result.status}
                                        </div>

                                        <ChevronRight className={cn(
                                            "w-5 h-5 text-[#A8A29E] transition-transform",
                                            selectedResult?.id === result.id ? "translate-x-1 text-[#1C1917]" : "group-hover:translate-x-1"
                                        )} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* RIGHT: CONTEXT PANEL (Desktop Sticky only) */}
                <div className="hidden lg:block sticky top-8">
                    {selectedResult ? (
                        <div className="bg-[#1C2B3A] rounded-[18px] border border-[#334155] p-6 text-white shadow-xl">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block",
                                        selectedResult.status === "critical" ? "bg-red-500/20 text-red-300" :
                                            selectedResult.status === "warning" ? "bg-amber-500/20 text-amber-300" :
                                                "bg-emerald-500/20 text-emerald-300"
                                    )}>
                                        {selectedResult.status} Analysis
                                    </span>
                                    <h2 className="font-display text-2xl text-white">
                                        {selectedResult.name}
                                    </h2>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-xl text-sky-400">
                                        {selectedResult.value}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {selectedResult.unit}
                                    </p>
                                </div>
                            </div>

                            {/* Range visualization */}
                            <div className="mb-5 px-1">
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">
                                    Reference Range
                                </p>
                                <div className="relative h-2 bg-slate-700 rounded-full mb-1">
                                    <div
                                        className={cn(
                                            "absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-[#1C2B3A] shadow-lg",
                                            selectedResult.status === "optimal" ? "bg-emerald-400" :
                                                selectedResult.status === "warning" ? "bg-amber-400" : "bg-red-400"
                                        )}
                                        style={{ left: `${getRangePosition(selectedResult.value, selectedResult.reference_min, selectedResult.reference_max)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500">
                                    {formatRange(selectedResult.reference_min, selectedResult.reference_max)}
                                </p>
                            </div>

                            {/* AI Card */}
                            <div className="bg-[#0F172A] rounded-xl p-4 border border-[#334155] mb-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                                        <Brain className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-xs font-semibold text-purple-200">
                                        MedAssist Intelligence
                                    </span>
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    {selectedResult.ai_interpretation || "No analysis available for this biomarker."}
                                </p>
                            </div>

                            <button
                                onClick={() => router.push(`/assistant?q=Tell+me+more+about+my+${selectedResult.name}`)}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-sky-900/20"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Discuss implications
                            </button>
                        </div>
                    ) : (
                        <div className="bg-[#F5F4EF] rounded-[18px] border border-[#E8E6DF] p-8 text-center flex flex-col items-center justify-center min-h-[300px] border-dashed">
                            <div className="w-12 h-12 rounded-full bg-[#E8E6DF] flex items-center justify-center mb-3">
                                <FlaskConical className="w-6 h-6 text-[#A8A29E]" />
                            </div>
                            <h3 className="font-display text-lg text-[#44403C] mb-1">
                                Select a biomarker
                            </h3>
                            <p className="text-sm text-[#A8A29E] max-w-[200px]">
                                Click on any result on the left to see detailed AI analysis and trends.
                            </p>
                        </div>
                    )}
                </div>

                {/* MOBILE CONTEXT SHEET */}
                <MobileContextSheet
                    result={selectedResult}
                    open={!!selectedResult}
                    onClose={() => setSelectedResult(null)}
                />

            </div>
        </div>
    );
}
