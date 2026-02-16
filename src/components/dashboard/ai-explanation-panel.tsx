"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Brain, FileText, Activity } from "lucide-react";
import { MotionButton } from "@/components/ui/motion";

interface AIExplanationPanelProps {
    riskLevel: "low" | "moderate" | "high";
}

const AIExplanationPanel = ({ riskLevel = "moderate" }: AIExplanationPanelProps) => {
    return (
        <div className="medical-card p-0 overflow-hidden border border-border-subtle bg-white">
            {/* Clinical Header */}
            <div className="px-6 py-4 border-b border-border-subtle bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Clinical Synthesis</h3>
                </div>
                <span className="text-xs font-mono text-muted-foreground">Model: MED-BERT-v4</span>
            </div>

            <div className="p-6 grid lg:grid-cols-12 gap-8">
                {/* Section 1: Narrative (Cols 7) */}
                <div className="lg:col-span-7 space-y-4 border-r border-border-subtle pr-4">
                    <p className="text-sm text-slate-800 leading-relaxed font-medium">
                        Patient demonstrates inflammatory response pattern consistent with <span className="text-foreground border-b-2 border-primary/20">Active Infection</span>.
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Elevated CRP (8.4 mg/L) coincides with rising risk score (+12%). Hemoglobin remains suppressed (12.8 g/dL), suggesting chronic underlying factor. Compounding risk from age factor (54y).
                    </p>
                    {/* Evidence Trace */}
                    <div>
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Evidence Trace</h4>
                        <div className="bg-background/50 rounded-lg p-3 border border-border space-y-2">
                            <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-bold rounded border border-red-100">CRP High</span>
                            <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded border border-amber-100">HGB Low</span>
                            <span className="px-2 py-1 bg-muted text-slate-700 text-xs font-bold rounded border border-border">History</span>
                        </div>
                    </div>
                </div>

                {/* Section 2: Action Plan (Cols 5) */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                    {/* Recommended Protocol */}
                    <div>
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recommended Protocol</h4>
                        <div className="mt-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                            <div className="flex items-start gap-3">
                                <Activity className="w-4 h-4 text-primary mt-0.5" />
                                <div>
                                    <h5 className="text-sm font-bold text-foreground">Iron Studies & Inflammatory Panel</h5>
                                    <p className="text-xs text-slate-600 mt-1">Priority: High • Schedule within 24h</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                        <MotionButton className="flex-1 bg-primary text-white text-sm font-medium py-2 rounded-lg hover:bg-primary/90 shadow-sm border border-transparent">
                            Approve Order
                        </MotionButton>
                        <MotionButton className="px-4 bg-white text-slate-700 border border-border text-sm font-medium py-2 rounded-lg hover:bg-slate-50">
                            <FileText className="w-4 h-4" />
                        </MotionButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { AIExplanationPanel };
