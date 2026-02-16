"use client";

import React from "react";
import { ArrowUp } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, ReferenceLine } from "recharts";
import { useStore } from "@/store/useStore";

export function HealthScoreCard() {
    const { riskAnalysis, healthTrend } = useStore();
    const structuralScore = riskAnalysis?.structuralScore || 0;
    const reliabilityScore = riskAnalysis?.reliabilityAdjustedScore || 0;
    const tier = riskAnalysis?.overallTier || "Unknown";
    const confidence = riskAnalysis?.metrics?.confidenceLevel || 0;
    const assumption = riskAnalysis?.missingDomainAssumption || "neutral";
    const trendDir = (riskAnalysis?.trajectory as string) === "Improving" ? "+" : (riskAnalysis?.trajectory as string) === "Worsening" ? "-" : "";

    return (
        <div className="w-full md:w-[450px] bg-card border border-border rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h3 className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Health Intelligence</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-bold text-foreground">{structuralScore}</span>
                        <span className="text-lg text-muted-foreground font-normal">/100</span>
                    </div>
                    <div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-2 inline-block mr-2
                            ${tier === 'Optimal' ? 'bg-success/10 text-success' :
                                tier === 'Monitor' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>
                            {tier}
                        </span>
                        {riskAnalysis?.criticalOverrideTriggered && (
                            <span className="text-[10px] font-bold text-destructive bg-destructive/5 px-1.5 py-0.5 rounded ml-1">
                                ! OVERRIDE
                            </span>
                        )}

                        {riskAnalysis?.dataValidationStatus === 'anomalous' && (
                            <div className="mt-1 text-[10px] font-bold text-destructive flex items-center gap-1">
                                ⚠️ Data Anomalies
                            </div>
                        )}

                        <div className="flex flex-col mt-2 gap-0.5">
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                                Rel Score: {reliabilityScore} | Conf: {confidence}%
                            </span>
                            <span className="text-[10px] text-muted-foreground/60">
                                Assumption: {assumption}
                            </span>
                        </div>
                    </div>
                </div>
                {/* Simulated Trend for Demo */}
                <div className="flex items-center gap-1 text-success text-sm font-semibold bg-success/10 px-2 py-1 rounded-lg">
                    <ArrowUp className="w-4 h-4" />
                    +3.2%
                </div>
            </div>
            <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={healthTrend}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="score" stroke="var(--color-success)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                        <ReferenceLine y={85} stroke="var(--color-text-muted)" strokeDasharray="3 3" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Phase 4: Insight Display */}
            {riskAnalysis && useStore.getState().insightAnalysis && (
                <div className="mt-4 border-t border-border pt-3">
                    <h4 className="text-[10px] uppercase font-bold text-muted-foreground mb-2">
                        Priority Insights
                    </h4>
                    <div className="space-y-2">
                        {useStore.getState().insightAnalysis?.insights.slice(0, 2).map((insight, idx) => (
                            <div key={idx} className="bg-primary/5 rounded p-2 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-foreground">{insight.domain}</span>
                                        <span className={`text-[9px] px-1.5 rounded-full 
                                            ${insight.severity === 'Critical' ? 'bg-destructive text-white' :
                                                insight.severity === 'High' ? 'bg-orange-500/20 text-orange-600' :
                                                    'bg-blue-500/20 text-blue-600'}`}>
                                            {insight.classification}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight flex items-center gap-1.5">
                                        <span className={`font-semibold ${insight.recommendedActions[0]?.interventionLevel === 'Immediate' ? 'text-destructive' :
                                            insight.recommendedActions[0]?.interventionLevel === 'Urgent' ? 'text-orange-600' :
                                                insight.recommendedActions[0]?.interventionLevel === 'Hold' ? 'text-muted-foreground' : ''
                                            }`}>
                                            {insight.recommendedActions[0]?.interventionLevel === 'Hold' ? '⚠️ ' : ''}
                                            {insight.recommendedActions[0]?.interventionLevel}
                                        </span>
                                        <span className="text-muted-foreground/40">•</span>
                                        <span>{insight.recommendedActions[0]?.actionType}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-mono opacity-50 block">{insight.finalPriorityScore}</span>
                                    {insight.confidence < 60 && <span className="text-[8px] text-orange-500 block">Verify Data</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
