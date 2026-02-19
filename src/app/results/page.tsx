"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Search,
    Filter,
    ArrowUpRight,
    BrainCircuit,
    Sparkles,
    X
} from "lucide-react";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ResultRow } from "@/components/results/result-row";

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

// ── Helpers ────────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Metabolic", "Hormonal", "Cardiovascular", "Liver", "Kidney"];

// ── Components ─────────────────────────────────────────────────────────────

function ResultSkeleton() {
    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 pt-20 lg:pt-8 pb-8 space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-[#E8E6DF] rounded-lg" />
            <div className="h-12 w-full bg-[#E8E6DF] rounded-[18px]" />
            <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] gap-6">
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 bg-[#E8E6DF] rounded-[12px]" />
                    ))}
                </div>
                <div className="h-[500px] bg-[#E8E6DF] rounded-[18px] hidden lg:block" />
            </div>
        </div>
    );
}

export default function ResultsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
    const [activeCategory, setActiveCategory] = useState("All");
    const [selectedResult, setSelectedResult] = useState<Biomarker | null>(null);
    const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/auth");
                return;
            }

            const { data } = await supabase
                .from("biomarkers")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (data) {
                setBiomarkers(data);
                // Pre-select first warning/critical item, or first item
                const priority = data.find(b => b.status !== "optimal");
                setSelectedResult(priority || data[0] || null);
            }
            setLoading(false);
        };

        fetchData();
    }, [router]);

    // Handle selection (Desktop vs Mobile)
    const handleSelect = (biomarker: Biomarker) => {
        setSelectedResult(biomarker);
        if (window.innerWidth < 1024) {
            setIsMobilePanelOpen(true);
        }
    };

    // Derived Data
    const tabs = CATEGORIES.map(c => ({ id: c, label: c }));

    const filteredBiomarkers = activeCategory === "All"
        ? biomarkers
        : biomarkers.filter(b => b.category === activeCategory);

    const optimalCount = biomarkers.filter(b => b.status === "optimal").length;
    const warningCount = biomarkers.filter(b => b.status === "warning").length;
    const criticalCount = biomarkers.filter(b => b.status === "critical").length;

    if (loading) return <ResultSkeleton />;

    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 pt-20 lg:pt-8 pb-32">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-display text-3xl text-[#1C1917]">
                        Lab Results
                    </h1>
                    <p className="text-sm text-[#A8A29E] mt-1">
                        Analysis of {biomarkers.length} biomarkers
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2.5 rounded-[10px] border border-[#E8E6DF] text-[#57534E] hover:bg-[#F5F4EF] transition-colors">
                        <Search className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 rounded-[10px] border border-[#E8E6DF] text-[#57534E] hover:bg-[#F5F4EF] transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1917] hover:bg-black text-white rounded-[10px] text-sm font-semibold transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-8">
                <div className="bg-[#ECFDF5] rounded-[12px] border border-emerald-200 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                        {optimalCount}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-emerald-800">Optimal</p>
                        <p className="text-xs text-emerald-600">Within range</p>
                    </div>
                </div>
                <div className="bg-[#FFFBEB] rounded-[12px] border border-amber-200 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-lg">
                        {warningCount}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-amber-800">Monitor</p>
                        <p className="text-xs text-amber-600">Slight variation</p>
                    </div>
                </div>
                <div className="bg-[#FEF2F2] rounded-[12px] border border-red-200 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg">
                        {criticalCount}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-red-800">Action</p>
                        <p className="text-xs text-red-600">Requires attention</p>
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="mb-6 sticky top-20 z-20 bg-[#FAFAF9]/95 backdrop-blur-sm py-2 -mx-4 px-4 md:mx-0 md:px-0">
                <AnimatedTabs
                    tabs={tabs}
                    defaultTab={activeCategory}
                    onChange={setActiveCategory}
                    className="w-full md:w-auto"
                />
            </div>

            {/* Results Grid - 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] gap-6 items-start relative">

                {/* LIST COLUMN */}
                <div className="bg-white rounded-[18px] border border-[#E8E6DF] shadow-sm overflow-hidden min-h-[500px]">
                    <div className="px-5 py-3 border-b border-[#E8E6DF] bg-[#F5F4EF]/50 flex justify-between text-xs font-semibold text-[#A8A29E] uppercase tracking-wider">
                        <span>Biomarker</span>
                        <div className="flex gap-16 mr-8">
                            <span>Result</span>
                            <span className="hidden sm:block">Reference</span>
                        </div>
                    </div>
                    <div className="divide-y divide-[#E8E6DF]">
                        {filteredBiomarkers.length === 0 ? (
                            <div className="p-12 text-center text-[#A8A29E]">
                                No biomarkers found in this category.
                            </div>
                        ) : (
                            filteredBiomarkers.map((biomarker) => (
                                <ResultRow
                                    key={biomarker.id}
                                    name={biomarker.name}
                                    value={biomarker.value}
                                    unit={biomarker.unit}
                                    status={biomarker.status}
                                    range={{
                                        min: biomarker.reference_min ?? 0,
                                        max: biomarker.reference_max ?? 100
                                    }}
                                    isSelected={selectedResult?.id === biomarker.id}
                                    onClick={() => handleSelect(biomarker)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* CONTEXT PANEL (Desktop Sticky) */}
                <div className="hidden lg:block sticky top-24">
                    {selectedResult ? (
                        <div className="bg-[#F5F4EF] rounded-[24px] border border-[#E8E6DF] p-2 shadow-sm">
                            <div className="bg-white rounded-[20px] border border-[#E8E6DF] p-6 mb-3">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={cn(
                                                "w-2 h-2 rounded-full",
                                                selectedResult.status === "critical" ? "bg-red-500" :
                                                    selectedResult.status === "warning" ? "bg-amber-500" : "bg-emerald-500"
                                            )} />
                                            <p className="text-xs font-medium text-[#A8A29E] uppercase tracking-wider">
                                                {selectedResult.category}
                                            </p>
                                        </div>
                                        <h3 className="font-display text-2xl text-[#1C1917]">
                                            {selectedResult.name}
                                        </h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-display text-2xl text-[#1C1917]">
                                            {selectedResult.value}
                                        </p>
                                        <p className="text-xs text-[#A8A29E]">
                                            {selectedResult.unit}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Dark AI Card - NESTED */}
                            <div className="bg-[#0F172A] rounded-[20px] p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Sparkles className="w-24 h-24" />
                                </div>

                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                        <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                                    </div>
                                    <span className="text-xs font-medium text-indigo-300 uppercase tracking-widest">
                                        Groq Analysis
                                    </span>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        {selectedResult.ai_interpretation}
                                    </p>

                                    {selectedResult.status !== 'optimal' && (
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                            <p className="text-xs font-semibold text-white mb-1">
                                                Recommended Action
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                Consider scheduling a follow-up if levels persist for 2 weeks.
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-2">
                                        <button className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-semibold transition-colors">
                                            Ask AI Assistant
                                        </button>
                                        <button className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold transition-colors border border-white/10">
                                            View History
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[400px] flex items-center justify-center text-[#A8A29E] bg-[#F5F4EF] rounded-[24px] border border-[#E8E6DF]">
                            Select a biomarker to view details
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Bottom Sheet (AnimatePresence) */}
            <AnimatePresence>
                {isMobilePanelOpen && selectedResult && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobilePanelOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 bg-[#FAFAF9] rounded-t-[24px] p-6 z-50 lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)] max-h-[85vh] overflow-y-auto"
                        >
                            <div className="w-12 h-1.5 bg-[#E8E6DF] rounded-full mx-auto mb-6" />

                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="font-display text-2xl text-[#1C1917]">
                                        {selectedResult.name}
                                    </h3>
                                    <p className="text-[#A8A29E] text-sm">
                                        {selectedResult.category} Response
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsMobilePanelOpen(false)}
                                    className="p-2 bg-[#E8E6DF] rounded-full"
                                >
                                    <X className="w-4 h-4 text-[#57534E]" />
                                </button>
                            </div>

                            {/* Content duplicated from Desktop Panel for Mobile */}
                            <div className="bg-[#0F172A] rounded-[20px] p-6 text-white mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <BrainCircuit className="w-4 h-4 text-indigo-400" />
                                    <span className="text-xs font-medium text-indigo-300 uppercase">
                                        Groq Analysis
                                    </span>
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                                    {selectedResult.ai_interpretation}
                                </p>
                                <button className="w-full py-3 bg-indigo-600 rounded-xl text-sm font-semibold">
                                    Ask AI Assistant
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* AI Analysis Footer (Fixed Bottom) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-2xl z-30 hidden md:block">
                <div className="bg-[#1C1917]/90 backdrop-blur-md rounded-full shadow-2xl border border-white/10 p-1.5 pl-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm text-white font-medium">
                            Analysis complete. 3 items require attention.
                        </span>
                    </div>
                    <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-full text-xs font-semibold text-white transition-colors">
                        View Report
                    </button>
                </div>
            </div>

        </div>
    );
}
