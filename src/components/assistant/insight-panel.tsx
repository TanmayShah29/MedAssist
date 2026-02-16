"use client";

import React from "react";
import { motion } from "framer-motion";
import { AreaChart, LineChart, PieChart } from "reaviz"; // Using generic imports, will refine usage
import { ClinicalInsight } from "@/app/actions/gemini";
import { AlertTriangle, CheckCircle, Activity, ArrowRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightPanelProps {
    insight: ClinicalInsight | null;
    isLoading: boolean;
}

export function InsightPanel({ insight, isLoading }: InsightPanelProps) {
    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4 p-8">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="text-center space-y-1">
                    <h3 className="font-semibold text-foreground animate-pulse">Analyzing Clinical Data...</h3>
                    <p className="text-xs text-muted-foreground">Extracting biomarkers & cross-referencing ranges</p>
                </div>
            </div>
        );
    }

    if (!insight) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50/50">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-border flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Clinical Intelligence Inactive</h3>
                <p className="text-sm text-muted-foreground text-center max-w-[240px] mt-2">
                    Upload a lab report or describe a clinical scenario to activate the analysis engine.
                </p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full flex flex-col overflow-y-auto bg-slate-50/50"
        >
            {/* Header / Summary */}
            <div className="bg-white p-6 border-b border-border shadow-sm relative overflow-hidden">
                <div className={cn(
                    "absolute top-0 left-0 w-1 h-full",
                    insight.riskLevel === 'low' ? "bg-success" :
                        insight.riskLevel === 'moderate' ? "bg-amber-500" : "bg-red-500"
                )} />
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Analysis Result</h2>
                        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                            {insight.type === 'lab' ? "Pathology Report" : "Symptom Triage"}
                            <span className="px-2 py-0.5 rounded text-[10px] bg-muted text-slate-600 border border-border">
                                AI CONFIDENCE: {insight.confidence}%
                            </span>
                        </h1>
                    </div>
                    {insight.riskLevel !== 'low' && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold uppercase">{insight.riskLevel} Risk</span>
                        </div>
                    )}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed border-l-2 border-border pl-4">
                    {insight.summary}
                </p>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6">

                {/* Biomarker Visualizations (If Labs) */}
                {insight.biomarkers && (
                    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-sm">Biomarker Analysis</h3>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Reference Ranges</span>
                        </div>
                        <div className="p-4 space-y-6">
                            {insight.biomarkers.map((bio, i) => {
                                // Calculate position percentage relative to range padded by 20%
                                const rangeSpan = bio.range[1] - bio.range[0];
                                const min = bio.range[0] - (rangeSpan * 0.2);
                                const max = bio.range[1] + (rangeSpan * 0.2);
                                const total = max - min;
                                const percent = Math.min(100, Math.max(0, ((bio.value - min) / total) * 100));

                                // Range box positions
                                const rangeStart = ((bio.range[0] - min) / total) * 100;
                                const rangeWidth = ((rangeSpan) / total) * 100;

                                return (
                                    <div key={i} className="space-y-1.5">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm font-medium text-slate-700">{bio.name}</span>
                                            <span className={cn(
                                                "text-sm font-bold font-mono",
                                                bio.status === 'abnormal' ? "text-amber-600" : "text-foreground"
                                            )}>
                                                {bio.value} <span className="text-xs text-slate-400 font-sans font-normal">{bio.unit}</span>
                                            </span>
                                        </div>
                                        {/* Visualization Bar */}
                                        <div className="h-2.5 bg-muted rounded-full relative overflow-hidden">
                                            {/* Reference Range Zone */}
                                            <div
                                                className="absolute top-0 bottom-0 bg-slate-200/80 rounded-sm"
                                                style={{ left: `${rangeStart}%`, width: `${rangeWidth}%` }}
                                            />
                                            {/* Value Marker */}
                                            <div
                                                className={cn(
                                                    "absolute top-0 bottom-0 w-1.5 rounded-full ring-2 ring-white shadow-sm transition-all duration-1000",
                                                    bio.status === 'abnormal' ? "bg-amber-500" : "bg-success"
                                                )}
                                                style={{ left: `${percent}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                                            <span>{min.toFixed(1)}</span>
                                            <span>Target: {bio.range[0]} - {bio.range[1]}</span>
                                            <span>{max.toFixed(1)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {insight.details.map((detail, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-border shadow-sm flex flex-col justify-between h-20">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{detail.label}</span>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground text-sm leading-tight">{detail.value}</span>
                                {detail.status === 'warning' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                                {detail.status === 'critical' && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recommendations */}
                <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-5">
                    <h3 className="flex items-center gap-2 font-bold text-blue-900 text-sm mb-3">
                        <Shield className="w-4 h-4" />
                        Recommended Actions
                    </h3>
                    <ul className="space-y-3">
                        {insight.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex gap-3 text-sm text-blue-900/80 items-start">
                                <ArrowRight className="w-4 h-4 shrink-0 mt-0.5 opacity-50" />
                                <span className="leading-relaxed">{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </motion.div>
    );
}
