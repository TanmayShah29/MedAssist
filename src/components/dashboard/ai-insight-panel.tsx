"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { RiskIndicator } from "@/components/ui/risk-indicator";
import { BrainCircuit, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

export function AIInsightPanel() {
    return (
        <Card className="p-6 h-full relative overflow-hidden bg-gradient-to-br from-bg-secondary to-bg-tertiary border-accent-primary/20">
            {/* ── Header ── */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary">
                        <BrainCircuit size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">Clinical Intelligence</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1.5 text-xs text-accent-teal font-medium">
                                <Sparkles size={12} />
                                Analysis Complete
                            </span>
                            <span className="text-xs text-text-muted">•</span>
                            <span className="text-xs text-text-muted">Just now</span>
                        </div>
                    </div>
                </div>
                <RiskIndicator level="moderate" pulse label="Moderate Risk Identified" />
            </div>

            {/* ── Content ── */}
            <div className="space-y-4">
                <div className="p-4 rounded-xl bg-surface-elevated border border-border-subtle">
                    <div className="flex gap-3">
                        <AlertCircle className="shrink-0 text-risk-moderate mt-0.5" size={18} />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-text-primary">Sepsis Marker Elevation</p>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                Patient #8492 shows a 15% increase in lactate levels (2.1 to 2.4 mmol/L) over the last 4 hours, correlating with a mild hypotensive trend. Early intervention protocol recommended.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-glass border border-border-subtle/50">
                    <div className="flex gap-3">
                        <CheckCircle2 className="shrink-0 text-accent-teal mt-0.5" size={18} />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-text-primary">Medication Adherence</p>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                Standard protocol adherence is at 98%. No missed doses reported in the last 24h cycle.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Actions ── */}
            <div className="mt-6 pt-4 border-t border-border-subtle flex gap-3">
                <button className="flex-1 py-2.5 rounded-lg bg-accent-primary text-white text-sm font-medium hover:bg-accent-primary-hover transition-colors shadow-lg shadow-accent-primary/10">
                    Review Protocol
                </button>
                <button className="flex-1 py-2.5 rounded-lg bg-transparent border border-border-subtle text-text-primary text-sm font-medium hover:bg-surface-elevated transition-colors">
                    Dismiss
                </button>
            </div>
        </Card>
    );
}
