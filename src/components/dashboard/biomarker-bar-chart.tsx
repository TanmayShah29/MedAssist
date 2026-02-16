"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Biomarker = {
    name: string;
    value: number;
    unit: string;
    min: number;
    max: number;
    threshold: number;
};

const biomarkers: Biomarker[] = [
    { name: "Hemoglobin", value: 12.8, unit: "g/dL", min: 13.5, max: 17.5, threshold: 13.5 },
    { name: "C-Reactive Protein", value: 8.4, unit: "mg/L", min: 0, max: 10, threshold: 3 },
    { name: "LDL Cholesterol", value: 145, unit: "mg/dL", min: 0, max: 200, threshold: 100 },
    { name: "Albumin", value: 4.2, unit: "g/dL", min: 3.4, max: 5.4, threshold: 3.4 },
];

const BiomarkerBarChart = () => {
    return (
        <div className="medical-card p-6 h-full">
            <div className="flex justify-between items-baseline mb-6">
                <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Biomarker Analysis</h3>
                <span className="text-xs text-text-muted">Last Updated: 14:00</span>
            </div>

            <div className="space-y-4">
                {/* Rigid Header */}
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest pb-2 border-b border-border-subtle">
                    <div className="col-span-4">Analytic</div>
                    <div className="col-span-3 text-right">Result</div>
                    <div className="col-span-2 text-right">Ref.</div>
                    <div className="col-span-3 text-center">Interp.</div>
                </div>

                {/* Surgical Rows */}
                {biomarkers.map((bio) => {
                    const isHigh = bio.value > bio.max || (bio.name === "LDL Cholesterol" && bio.value > bio.threshold) || (bio.name === "C-Reactive Protein" && bio.value > bio.threshold);
                    const isLow = bio.value < bio.min;
                    const isNormal = !isHigh && !isLow;

                    const statusColor = isNormal ? "text-foreground" : isHigh ? "text-red-700" : "text-amber-700";

                    let interpLabel = "Normal";
                    let interpClass = "bg-muted text-slate-600";

                    if (isHigh) { interpLabel = "High"; interpClass = "bg-red-50 text-red-700 border-red-100"; }
                    if (isLow) { interpLabel = "Low"; interpClass = "bg-amber-50 text-amber-700 border-amber-100"; }

                    // Visualization Calculation
                    const rangeMax = bio.max * 1.5;
                    const percent = Math.min(100, (bio.value / rangeMax) * 100);

                    return (
                        <div key={bio.name} className="grid grid-cols-12 gap-2 items-center py-1 group">
                            {/* Name */}
                            <div className="col-span-4 font-medium text-slate-700 text-sm truncate" title={bio.name}>
                                {bio.name}
                            </div>

                            {/* Value - High Contrast */}
                            <div className="col-span-3 text-right">
                                <span className={cn("font-bold font-mono text-sm", statusColor)}>{bio.value}</span>
                                <span className="text-slate-400 text-[10px] ml-1">{bio.unit}</span>
                            </div>

                            {/* Reference */}
                            <div className="col-span-2 text-right text-xs text-slate-400 font-mono">
                                {bio.min}-{bio.max}
                            </div>

                            {/* Status Label + Mini Bar */}
                            <div className="col-span-3 flex flex-col items-center justify-center gap-1">
                                <div className={cn("text-[10px] font-bold px-1.5 rounded border border-transparent", interpClass)}>
                                    {interpLabel}
                                </div>
                                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                    <div className={cn("h-full", isNormal ? "bg-primary" : "bg-critical")} style={{ width: `${percent}%` }} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export { BiomarkerBarChart };
