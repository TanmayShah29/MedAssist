"use client";

import React from "react";
import { Biomarker } from "@/store/useStore";

interface Props {
    biomarkers: Biomarker[];
}

export function RiskAnalysisChart({ biomarkers }: Props) {
    const riskItems = biomarkers.filter(b => b.status !== 'optimal').slice(0, 3);

    return (
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm h-full">
            <h3 className="font-bold text-foreground mb-6">Risk Factors</h3>

            {riskItems.length === 0 ? (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                    No elevated risks detected.
                </div>
            ) : (
                <div className="space-y-6">
                    {riskItems.map((item) => (
                        <div key={item.id} className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-foreground">{item.name}</span>
                                <span className={item.status === 'critical' ? 'text-destructive font-bold' : 'text-warning font-bold'}>
                                    {item.status === 'critical' ? 'Requires Action' : 'Monitor'}
                                </span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${item.status === 'critical' ? 'bg-critical' : 'bg-warning'}`}
                                    style={{ width: item.status === 'critical' ? '85%' : '60%' }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
