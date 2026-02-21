"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, Info, Lightbulb, ChevronRight, Activity, AlertCircle } from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine
} from "recharts";

interface Biomarker {
    id: number;
    name: string;
    value: number;
    unit: string;
    status: 'optimal' | 'warning' | 'critical';
    category: string;
    ai_interpretation?: string;
    created_at: string;
    lab_result_id?: number;
}

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

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'optimal': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500' };
            case 'warning': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', dot: 'bg-amber-500' };
            case 'critical': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', dot: 'bg-red-500' };
            default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-100', dot: 'bg-gray-500' };
        }
    };

    const styles = getStatusStyles(biomarker.status);

    // Mock health tips based on category (In a real app, these would come from AI or database)
    const getHealthTips = (category: string, status: string) => {
        if (status === 'optimal') return ["Keep up your current lifestyle and diet.", "Continue regular screening as recommended by your doctor."];

        switch (category.toLowerCase()) {
            case 'hematology': return ["Consider iron-rich foods like spinach and lentils.", "Stay well-hydrated throughout the day.", "Ensure adequate Vitamin C intake to aid iron absorption."];
            case 'metabolic': return ["Increase daily fiber through whole grains and vegetables.", "Focus on complex carbohydrates over simple sugars.", "Incorporate 30 minutes of moderate activity daily."];
            case 'inflammation': return ["Focus on an anti-inflammatory diet (Omega-3s, turmeric).", "Prioritize 7-9 hours of quality sleep.", "Practice stress management techniques like meditation."];
            case 'vitamins': return ["Target 15 minutes of safe sun exposure daily.", "Consider dietary sources like fatty fish or fortified foods.", "Discuss supplementation with your healthcare provider."];
            default: return ["Consult with a healthcare professional about these results.", "Maintain a balanced diet and regular exercise routine.", "Track changes over your next few lab reports."];
        }
    };

    const tips = getHealthTips(biomarker.category, biomarker.status);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-[#FAFAF7] shadow-2xl z-50 overflow-y-auto"
                    >
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-sky-100 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            {biomarker.category}
                                        </span>
                                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${styles.bg} ${styles.text} text-[10px] font-bold border ${styles.border}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                                            {biomarker.status.toUpperCase()}
                                        </div>
                                    </div>
                                    <h2 className="text-3xl font-bold font-display text-[#1C1917]">{biomarker.name}</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-[#57534E]" />
                                </button>
                            </div>

                            {/* Main Value Card */}
                            <div className="bg-white border border-[#E8E6DF] rounded-2xl p-6 mb-8 shadow-sm">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-sm text-[#A8A29E] font-medium mb-1">CURRENT VALUE</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold text-[#1C1917] font-display">{biomarker.value}</span>
                                            <span className="text-lg text-[#57534E]">{biomarker.unit}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-[#A8A29E] font-bold uppercase mb-1">STABILITY</p>
                                        <div className="flex items-center gap-1 text-emerald-600 font-semibold text-sm">
                                            <TrendingUp className="w-4 h-4" />
                                            Stable
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Interpretation */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                                        <Info className="w-4 h-4 text-violet-600" />
                                    </div>
                                    <h3 className="text-lg font-bold font-display text-[#1C1917]">Understanding this value</h3>
                                </div>
                                <div className="bg-violet-50/50 border border-violet-100 rounded-2xl p-5">
                                    <p className="text-[15px] text-[#57534E] leading-relaxed italic">
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
                                        <h3 className="text-lg font-bold font-display text-[#1C1917]">Historical Trend</h3>
                                    </div>
                                </div>

                                {trendData.length > 1 ? (
                                    <div className="bg-white border border-[#E8E6DF] rounded-2xl p-4 h-48">
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
                                                    stroke="#0EA5E9"
                                                    strokeWidth={3}
                                                    dot={{ fill: '#0EA5E9', r: 4, strokeWidth: 2, stroke: 'white' }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="bg-[#F5F4EF] border border-dashed border-[#E8E6DF] rounded-2xl p-8 text-center">
                                        <p className="text-sm text-[#A8A29E]">More reports needed to generate a trend chart</p>
                                    </div>
                                )}
                            </div>

                            {/* Next Steps / Ecosystem Links */}
                            <div className="mb-12">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                                        <ChevronRight className="w-4 h-4 text-sky-600" />
                                    </div>
                                    <h3 className="text-lg font-bold font-display text-[#1C1917]">Recommended Next Steps</h3>
                                </div>
                                <div className="space-y-3">
                                    <a
                                        href="https://www.questdiagnostics.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 bg-white border border-[#E8E6DF] rounded-[14px] hover:border-sky-200 transition-all hover:shadow-md group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center text-sky-600">
                                                <Activity size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-bold text-[#1C1917]">Book Follow-up Lab</p>
                                                <p className="text-[11px] text-[#A8A29E]">Quest Diagnostics · 3 miles away</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-sky-500" />
                                    </a>

                                    <a
                                        href="https://www.naturemade.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 bg-white border border-[#E8E6DF] rounded-[14px] hover:border-emerald-200 transition-all hover:shadow-md group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                                                <Lightbulb size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-bold text-[#1C1917]">Supplement Options</p>
                                                <p className="text-[11px] text-[#A8A29E]">Browse evidence-based options</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500" />
                                    </a>
                                </div>
                                <p className="mt-4 text-[11px] text-[#A8A29E] leading-relaxed">
                                    <strong className="text-[#57534E]">Note:</strong> Links are for convenience. Always discuss any new supplements or diagnostic tests with your physician first.
                                </p>
                            </div>

                            {/* Health Tips / Actionable Advice */}
                            <div className="mb-12">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                        <Lightbulb className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <h3 className="text-lg font-bold font-display text-[#1C1917]">General Wellness Tips</h3>
                                </div>
                                <div className="space-y-3">
                                    {tips.map((tip, idx) => (
                                        <div key={idx} className="flex items-start gap-4 p-4 bg-white border border-[#E8E6DF] rounded-[14px] hover:border-amber-200 transition-colors group">
                                            <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            </div>
                                            <p className="text-sm text-[#57534E] leading-relaxed flex-1">{tip}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer Note */}
                            <div className="mt-8 pt-8 border-t border-[#E8E6DF] text-center bg-amber-50/30 rounded-b-2xl -mx-6 px-6 pb-8">
                                <AlertCircle className="w-5 h-5 text-amber-600 mx-auto mb-3" />
                                <p className="text-[11px] text-[#78716C] leading-relaxed">
                                    <strong className="text-[#44403C]">MANDATORY MEDICAL DISCLAIMER:</strong> MedAssist is an educational tool and does not provide medical diagnoses or treatment advice. Consult with a qualified healthcare professional before making any health decisions.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
