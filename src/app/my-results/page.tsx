"use client";

import React, { useState } from "react";
import { Calendar, ChevronRight, Info, AlertTriangle, CheckCircle, ArrowRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data for Lab Results
const LAB_RESULTS = [
    {
        id: "hemoglobin",
        name: "Hemoglobin",
        category: "Hematology",
        date: "Feb 14, 2024",
        value: 12.8,
        unit: "g/dL",
        range: [13.5, 17.5],
        status: "abnormal",
        trend: "down",
        description: "Hemoglobin carries oxygen in your blood. A slightly low level can happen due to diet or minor blood loss.",
        history: [13.2, 13.0, 12.8]
    },
    {
        id: "crp",
        name: "C-Reactive Protein (CRP)",
        category: "Inflammation",
        date: "Feb 14, 2024",
        value: 8.4,
        unit: "mg/L",
        range: [0, 10],
        status: "normal",
        trend: "stable",
        description: "CRP is a marker of inflammation. Your levels are within the normal range, indicating no active infection.",
        history: [6.2, 7.1, 8.4]
    },
    {
        id: "wbc",
        name: "White Blood Cell Count",
        category: "Hematology",
        date: "Feb 14, 2024",
        value: 11.2,
        unit: "K/uL",
        range: [4.5, 11.0],
        status: "abnormal",
        trend: "up",
        description: "A slightly elevated WBC count can be a sign of stress or a minor immune response.",
        history: [9.8, 10.5, 11.2]
    },
    {
        id: "vit_d",
        name: "Vitamin D (25-OH)",
        category: "Vitamins",
        date: "Feb 10, 2024",
        value: 42,
        unit: "ng/mL",
        range: [30, 100],
        status: "normal",
        trend: "up",
        description: "Your Vitamin D levels are optimal. This supports bone health and immune function.",
        history: [32, 38, 42]
    }
];

export default function MyResultsPage() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const categories = ["All", "Hematology", "Inflammation", "Vitamins", "Metabolic"];
    const filteredResults = selectedCategory === "All"
        ? LAB_RESULTS
        : LAB_RESULTS.filter(r => r.category === selectedCategory);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">My Lab Results</h1>
                    <p className="text-muted-foreground mt-1">Review your biomarkers with clinical context.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                        <Calendar className="w-4 h-4" />
                        Last 30 Days
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                            selectedCategory === cat
                                ? "bg-slate-900 text-white shadow-md"
                                : "bg-white text-slate-600 border border-border hover:bg-slate-50"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Results Grid (Cards instead of Table) */}
            <div className="space-y-4">
                {filteredResults.map((result) => (
                    <div
                        key={result.id}
                        className={cn(
                            "group bg-white rounded-2xl border transition-all duration-300 overflow-hidden",
                            expandedId === result.id
                                ? "border-emerald-500 shadow-lg ring-1 ring-emerald-500/20"
                                : "border-border shadow-sm hover:shadow-md hover:border-emerald-200"
                        )}
                    >
                        {/* Card Header (Always Visible) */}
                        <div
                            onClick={() => setExpandedId(expandedId === result.id ? null : result.id)}
                            className="p-6 cursor-pointer flex flex-col md:flex-row items-center gap-6"
                        >
                            {/* 1. Name & Category */}
                            <div className="flex-1 w-full">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-foreground text-lg">{result.name}</h3>
                                    {result.status === 'abnormal' && (
                                        <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                            Attention
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{result.category}</span>
                                    <span>•</span>
                                    <span>{result.date}</span>
                                </div>
                            </div>

                            {/* 2. Value Display */}
                            <div className="w-full md:w-32 flex flex-col items-center md:items-end">
                                <div className="flex items-baseline gap-1">
                                    <span className={cn(
                                        "text-2xl font-bold font-mono tracking-tight",
                                        result.status === 'abnormal' ? "text-amber-600" : "text-foreground"
                                    )}>
                                        {result.value}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-medium">{result.unit}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                    Range: {result.range[0]} - {result.range[1]}
                                </span>
                            </div>

                            {/* 3. Visual Range Bar */}
                            <div className="w-full md:w-48 hidden md:block">
                                <RangeBar
                                    value={result.value}
                                    min={result.range[0]}
                                    max={result.range[1]}
                                    status={result.status}
                                />
                            </div>

                            {/* 4. Expand Action */}
                            <div className="hidden md:flex w-8 h-8 rounded-full bg-slate-50 items-center justify-center group-hover:bg-muted transition-colors">
                                <ChevronRight className={cn(
                                    "w-5 h-5 text-slate-400 transition-transform duration-300",
                                    expandedId === result.id && "rotate-90 text-emerald-600"
                                )} />
                            </div>
                        </div>

                        {/* Expanded Content */}
                        <div className={cn(
                            "grid transition-all duration-300 ease-in-out bg-slate-50/50 border-t border-slate-100",
                            expandedId === result.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        )}>
                            <div className="overflow-hidden">
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                                    {/* Left: Explanation */}
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                                <Info className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground text-sm">Medical Context</h4>
                                                <p className="text-sm text-slate-600 leading-relaxed mt-1">
                                                    {result.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-white rounded-xl border border-border">
                                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Clinical Action</h5>
                                            {result.status === 'abnormal' ? (
                                                <ul className="space-y-2">
                                                    <li className="flex gap-2 text-sm text-amber-800 font-medium">
                                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                                        Monitor for fatigue or shortness of breath.
                                                    </li>
                                                    <li className="flex gap-2 text-sm text-slate-700">
                                                        <ArrowRight className="w-4 h-4 shrink-0" />
                                                        Consider iron-rich foods or supplementation.
                                                    </li>
                                                </ul>
                                            ) : (
                                                <div className="flex gap-2 text-sm text-success-dark font-medium items-center">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Levels are optimal. Continue current lifestyle.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Trend & History */}
                                    <div>
                                        <h4 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-emerald-600" />
                                            Historical Trend
                                        </h4>
                                        {/* Simple visualization of the last 3 values */}
                                        <div className="flex items-end justify-between h-32 gap-4 pb-2 border-b border-border">
                                            {result.history.map((val, i) => {
                                                const height = (val / (Math.max(...result.history) * 1.2)) * 100;
                                                return (
                                                    <div key={i} className="flex flex-col items-center gap-2 w-full">
                                                        <div
                                                            className={cn(
                                                                "w-full rounded-t-lg transition-all hover:opacity-80",
                                                                i === result.history.length - 1 ? "bg-success" : "bg-slate-300"
                                                            )}
                                                            style={{ height: `${height}%` }}
                                                        />
                                                        <span className="text-xs font-mono text-muted-foreground">{val}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono uppercase">
                                            <span>3 Months Ago</span>
                                            <span>Last Month</span>
                                            <span>Today</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Visual Range Component
function RangeBar({ value, min, max, status }: { value: number, min: number, max: number, status: string }) {
    // Math to position ticks
    const rangeSpan = max - min;
    const padding = rangeSpan * 0.5; // 50% padding on sides
    const plotMin = min - padding;
    const plotMax = max + padding;
    const totalSpan = plotMax - plotMin;

    const getPercent = (val: number) => Math.min(100, Math.max(0, ((val - plotMin) / totalSpan) * 100));

    return (
        <div className="relative w-full h-8 flex items-center">
            {/* Track */}
            <div className="absolute left-0 right-0 h-1.5 bg-muted rounded-full overflow-hidden">
                {/* Target Zone */}
                <div
                    className="absolute h-full bg-slate-300/50"
                    style={{ left: `${getPercent(min)}%`, width: `${getPercent(max) - getPercent(min)}%` }}
                />
            </div>

            {/* Value Indicator */}
            <div
                className={cn(
                    "absolute w-3 h-3 rounded-full border-2 border-white shadow-sm transition-all",
                    status === 'abnormal' ? "bg-amber-500" : "bg-success"
                )}
                style={{ left: `${getPercent(value)}%` }}
            />

            {/* Labels */}
            <div className="absolute top-4 w-full flex justify-between text-[9px] text-slate-400 font-mono">
                <span style={{ left: `${getPercent(min)}%`, position: 'absolute', transform: 'translateX(-50%)' }}>
                    {min}
                </span>
                <span style={{ left: `${getPercent(max)}%`, position: 'absolute', transform: 'translateX(-50%)' }}>
                    {max}
                </span>
            </div>
        </div>
    )
}
