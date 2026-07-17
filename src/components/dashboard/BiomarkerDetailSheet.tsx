"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, Info, Lightbulb, ChevronRight, Activity, AlertCircle } from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from "recharts";
import { Biomarker } from "@/types/medical";
import { getPatientStatus } from "@/lib/patient-status";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    biomarker: Biomarker | null;
    history: Biomarker[];
}

export function BiomarkerDetailSheet({ isOpen, onClose, biomarker, history }: Props) {
    if (!biomarker) return null;

    // Filter history for this specific biomarker name
    const trendData = history
        .filter(b => b.name === biomarker.name)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(b => ({
            date: new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: b.value,
        }));

    const styles = getPatientStatus(biomarker.status);

    const getDoctorQuestions = (category: string, status: string) => {
        if (status === 'optimal') return ["Should we keep monitoring this marker at the same interval?", "Does this result change anything about my follow-up plan?"];

        switch (category.toLowerCase()) {
            case 'hematology': return ["Could we review whether this result needs repeat testing?", "Are iron, ferritin, B12, bleeding risk, or inflammation relevant context for this value?", "Which symptoms would make this more urgent to review?"];
            case 'metabolic': return ["Should this be interpreted with fasting status, diet, medications, or prior results?", "Would repeat testing or a related marker help clarify the pattern?", "What target range should we monitor over time?"];
            case 'inflammation': return ["Could recent illness, injury, medication, or symptoms explain this result?", "Should this be repeated or paired with another marker?", "What symptoms should prompt earlier follow-up?"];
            case 'vitamins': return ["Should we review diet, supplements, medications, or absorption issues?", "What level and retest timeline makes sense for me?", "Should any supplement changes be clinician-guided?"];
            default: return ["What could explain this result in the context of my history?", "Should this be rechecked, and when?", "Are there symptoms, medications, or supplements that could affect this value?"];
        }
    };

    const questions = getDoctorQuestions(biomarker.category, biomarker.status);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0.01 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0.01 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm transform-gpu z-50 gpu-accelerate"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-[#FDFDFB] shadow-2xl z-50 overflow-y-auto px-safe"
                        style={{ WebkitOverflowScrolling: 'touch', height: '-webkit-fill-available' }}
                    >
                        <div className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-sky-100 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            {biomarker.category}
                                        </span>
                                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${styles.bgClass} ${styles.textClass} text-[10px] font-bold border ${styles.borderClass}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${styles.dotClass}`} />
                                            {styles.label.toUpperCase()}
                                        </div>
                                    </div>
                                    <h2 className="text-3xl font-bold font-display text-[#0F172A]">{biomarker.name}</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    aria-label="Close detail panel"
                                    className="p-3 -m-1 hover:bg-gray-100 active:scale-90 rounded-full transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                                    style={{ WebkitAppearance: 'none' }}
                                >
                                    <X className="w-6 h-6 text-[#475569]" />
                                </button>
                            </div>

                            {/* Main Value Card */}
                            <div className="bg-white border border-[#EBEAE4] rounded-2xl p-6 mb-8 shadow-sm">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-sm text-[#64748B] font-medium mb-1">CURRENT VALUE</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold text-[#0F172A] font-display">{biomarker.value}</span>
                                            <span className="text-lg text-[#475569]">{biomarker.unit}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-[#64748B] font-bold uppercase mb-1">STABILITY</p>
                                        <div className="flex items-center gap-1 text-emerald-600 font-semibold text-sm">
                                            <TrendingUp className="w-4 h-4" />
                                            Stable
                                        </div>
                                    </div>
                                </div>

                                {biomarker.reference_range_min !== undefined && biomarker.reference_range_min !== null &&
                                    biomarker.reference_range_max !== undefined && biomarker.reference_range_max !== null &&
                                    biomarker.reference_range_max > biomarker.reference_range_min && (
                                        <div className="mt-4 pt-4 border-t border-[#EBEAE4]">
                                            <div className="flex justify-between text-xs text-[#64748B] font-medium mb-2">
                                                <span>Min: {biomarker.reference_range_min}</span>
                                                <span>Max: {biomarker.reference_range_max}</span>
                                            </div>
                                            <div className="h-2 w-full bg-[#EBEAE4] rounded-full relative overflow-hidden">
                                                <div
                                                className={`absolute top-0 bottom-0 left-0 rounded-full transition-[width] duration-700 ease-out ${styles.barClass}`}
                                                style={{
                                                width: `${Math.max(0, Math.min(100, ((Number(biomarker.value) - biomarker.reference_range_min) / (biomarker.reference_range_max - biomarker.reference_range_min)) * 100))}%`,
                                                minWidth: '4px'
                                                }}
                                                />
                                            </div>
                                        </div>
                                    )}
                            </div>

                            {/* AI Interpretation */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                                        <Info className="w-4 h-4 text-violet-600" />
                                    </div>
                                    <h3 className="text-lg font-bold font-display text-[#0F172A]">Understanding this value</h3>
                                </div>
                                <div className="bg-violet-50/50 border border-violet-100 rounded-2xl p-5">
                                    <p className="text-[15px] text-[#475569] leading-relaxed italic">
                                        &ldquo;{biomarker.ai_interpretation || "Our AI is analyzing the details of this specific biomarker. Please check back shortly."}&rdquo;
                                    </p>
                                </div>
                            </div>

                            {/* Trend Chart */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                                            <Activity className="w-4 h-4 text-sky-600" />
                                        </div>
                                        <h3 className="text-lg font-bold font-display text-[#0F172A]">Historical Trend</h3>
                                    </div>
                                </div>

                                {trendData.length > 1 ? (
                                    <div className="bg-white border border-[#EBEAE4] rounded-2xl p-4 h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={trendData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F1EF" vertical={false} />
                                                <XAxis dataKey="date" hide />
                                                <YAxis hide domain={['auto', 'auto']} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                    labelStyle={{ fontWeight: 'bold' }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke="#0ea5e9"
                                                    strokeWidth={3}
                                                    dot={{ fill: '#0ea5e9', r: 4, strokeWidth: 2, stroke: 'white' }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="bg-[#FFFFFF] border border-dashed border-[#EBEAE4] rounded-2xl p-8 text-center">
                                        <p className="text-sm text-[#64748B]">More reports needed to generate a trend chart</p>
                                    </div>
                                )}
                            </div>

                            {/* Evidence and discussion points */}
                            <div className="mb-12">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                                        <ChevronRight className="w-4 h-4 text-sky-600" />
                                    </div>
                                    <h3 className="text-lg font-bold font-display text-[#0F172A]">Evidence to review</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-white border border-[#EBEAE4] rounded-[14px] transition-all duration-200 hover:border-sky-200 hover:shadow-sm hover:-translate-y-0.5 group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center text-sky-600 transition-transform duration-200 group-hover:scale-110">
                                                <Activity size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-bold text-[#0F172A]">Exact value and range</p>
                                                <p className="text-[11px] text-[#64748B]">{biomarker.value} {biomarker.unit}{biomarker.reference_range_min != null && biomarker.reference_range_max != null ? ` · range ${biomarker.reference_range_min}-${biomarker.reference_range_max} ${biomarker.unit}` : " · no range found in report"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white border border-[#EBEAE4] rounded-[14px] transition-all duration-200 hover:border-emerald-200 hover:shadow-sm hover:-translate-y-0.5 group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 transition-transform duration-200 group-hover:scale-110">
                                                <Lightbulb size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-bold text-[#0F172A]">Why this may matter</p>
                                                <p className="text-[11px] text-[#64748B]">{styles.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-4 text-[11px] text-[#64748B] leading-relaxed">
                                    <strong className="text-[#475569]">Note:</strong> This is appointment context, not a diagnosis or treatment recommendation.
                                </p>
                            </div>

                            {/* Questions */}
                            <div className="mb-12">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                        <Lightbulb className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <h3 className="text-lg font-bold font-display text-[#0F172A]">What to ask</h3>
                                </div>
                                <div className="space-y-3">
                                    {questions.map((question, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-4 p-4 bg-white border border-[#EBEAE4] rounded-[14px] hover:border-amber-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 group stagger-fade-sm"
                                            style={{ animationDelay: `${idx * 60}ms` }}
                                        >
                                            <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            </div>
                                            <p className="text-sm text-[#475569] leading-relaxed grow shrink basis-0">{question}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer Note */}
                            <div className="mt-8 pt-8 border-t border-[#EBEAE4] text-center bg-amber-50/30 rounded-b-2xl -mx-6 px-6 pb-8">
                                <AlertCircle className="w-5 h-5 text-amber-600 mx-auto mb-3" />
                                <p className="text-[11px] text-[#64748B] leading-relaxed">
                                    <strong className="text-[#44403C]">Medical safety:</strong> MedAssist is educational, AI can make mistakes, and it does not provide diagnoses, treatment advice, or prescriptions. Discuss results with a qualified healthcare professional. For urgent symptoms, seek urgent or emergency care.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
