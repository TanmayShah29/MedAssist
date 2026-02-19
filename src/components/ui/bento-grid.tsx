"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────
export interface BentoItem {
    id: string;
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    // Span controls — how many columns/rows this cell occupies
    colSpan?: 1 | 2 | 3 | 4;
    rowSpan?: 1 | 2;
    // Visual style
    dark?: boolean;     // Use dark slate-900 background
    accent?: boolean;   // Use sky-500 tinted background
    noPadding?: boolean;
    // Animation delay (stagger)
    delay?: number;
}

export interface BentoGridProps {
    items: BentoItem[];
    cols?: 2 | 3 | 4;
    className?: string;
    animate?: boolean;
}

// ── Col span classes ───────────────────────────────────────────────────────
const colSpanClasses = {
    1: "col-span-1",
    2: "col-span-1 md:col-span-2",
    3: "col-span-1 md:col-span-2 lg:col-span-3",
    4: "col-span-1 md:col-span-2 lg:col-span-4",
};

const rowSpanClasses = {
    1: "row-span-1",
    2: "row-span-1 md:row-span-2",
};

const gridColsClasses = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

// ── Bento Cell ─────────────────────────────────────────────────────────────
function BentoCell({
    item,
    animate,
}: {
    item: BentoItem;
    animate: boolean;
}) {
    const content = (
        <div
            className={cn(
                "relative rounded-2xl border overflow-hidden transition-shadow duration-200",
                "hover:shadow-md",
                item.dark
                    ? "bg-slate-900 border-slate-700"
                    : item.accent
                        ? "bg-sky-50 border-sky-200"
                        : "bg-white border-slate-200",
                item.noPadding ? "" : "p-5",
                colSpanClasses[item.colSpan || 1],
                rowSpanClasses[item.rowSpan || 1],
                item.className
            )}
        >
            {/* Optional header */}
            {(item.title || item.description) && !item.noPadding && (
                <div className="mb-4">
                    {item.title && (
                        <h3 className={cn(
                            "text-sm font-semibold",
                            item.dark ? "text-white" : item.accent ? "text-sky-900" : "text-slate-900"
                        )}>
                            {item.title}
                        </h3>
                    )}
                    {item.description && (
                        <p className={cn(
                            "text-xs mt-0.5",
                            item.dark ? "text-slate-400" : item.accent ? "text-sky-600" : "text-slate-500"
                        )}>
                            {item.description}
                        </p>
                    )}
                </div>
            )}
            {item.children}
        </div>
    );

    if (animate) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.35,
                    delay: item.delay ?? 0,
                    ease: [0.21, 0.47, 0.32, 0.98],
                }}
                className={cn(
                    colSpanClasses[item.colSpan || 1],
                    rowSpanClasses[item.rowSpan || 1],
                )}
            >
                {/* Re-render without col/row spans since motion.div handles it */}
                <div className={cn(
                    "h-full relative rounded-2xl border overflow-hidden transition-shadow duration-200 hover:shadow-md",
                    item.dark
                        ? "bg-slate-900 border-slate-700"
                        : item.accent
                            ? "bg-sky-50 border-sky-200"
                            : "bg-white border-slate-200",
                    item.noPadding ? "" : "p-5",
                    item.className
                )}>
                    {(item.title || item.description) && !item.noPadding && (
                        <div className="mb-4">
                            {item.title && (
                                <h3 className={cn(
                                    "text-sm font-semibold",
                                    item.dark ? "text-white" : item.accent ? "text-sky-900" : "text-slate-900"
                                )}>
                                    {item.title}
                                </h3>
                            )}
                            {item.description && (
                                <p className={cn(
                                    "text-xs mt-0.5",
                                    item.dark ? "text-slate-400" : item.accent ? "text-sky-600" : "text-slate-500"
                                )}>
                                    {item.description}
                                </p>
                            )}
                        </div>
                    )}
                    {item.children}
                </div>
            </motion.div>
        );
    }

    return content;
}

// ── Main Component ─────────────────────────────────────────────────────────
export function BentoGrid({
    items,
    cols = 4,
    className,
    animate = true,
}: BentoGridProps) {
    return (
        <div className={cn(
            "grid gap-4 auto-rows-[180px]",
            gridColsClasses[cols],
            className
        )}>
            {items.map((item, idx) => (
                <BentoCell
                    key={item.id}
                    item={{ ...item, delay: item.delay ?? idx * 0.05 }}
                    animate={animate}
                />
            ))}
        </div>
    );
}

// ── Pre-built MedAssist Dashboard Bento ───────────────────────────────────
// Use this as the dashboard layout directly
export function DashboardBento({
    healthScore = 78,
    riskLevel = "Low",
    biomarkerWarnings = 2,
    trend = "+12%",
    children,
}: {
    healthScore?: number;
    riskLevel?: string;
    biomarkerWarnings?: number;
    trend?: string;
    children?: React.ReactNode;
}) {
    const items: BentoItem[] = [
        {
            id: "health-score",
            colSpan: 2,
            rowSpan: 1,
            accent: true,
            children: (
                <div className="flex items-center justify-between h-full">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-1">
                            Health Score
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold text-sky-700">{healthScore}</span>
                            <span className="text-sky-400 text-lg">/100</span>
                        </div>
                        <p className="text-xs text-sky-600 mt-1">Top 15% for your age group</p>
                    </div>
                    <div className="w-24 h-24 relative flex items-center justify-center">
                        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#BAE6FD" strokeWidth="8" />
                            <motion.circle
                                cx="50" cy="50" r="40"
                                fill="none"
                                stroke="#0EA5E9"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 40}`}
                                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - healthScore / 100) }}
                                transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                            />
                        </svg>
                        <span className="absolute text-lg font-bold text-sky-700">{healthScore}%</span>
                    </div>
                </div>
            ),
        },
        {
            id: "risk",
            colSpan: 1,
            children: (
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                        Risk Profile
                    </p>
                    <p className="text-3xl font-bold text-emerald-600">{riskLevel}</p>
                    <p className="text-xs text-slate-500 mt-1">Based on recent biomarkers</p>
                </div>
            ),
        },
        {
            id: "biomarkers",
            colSpan: 1,
            children: (
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                        Biomarkers
                    </p>
                    <p className="text-3xl font-bold text-amber-600">{biomarkerWarnings} Warnings</p>
                    <p className="text-xs text-slate-500 mt-1">Requires monitoring</p>
                </div>
            ),
        },
        {
            id: "pipeline",
            colSpan: 2,
            rowSpan: 2,
            dark: true,
            title: "Live Analysis Pipeline",
            children: children,
        },
        {
            id: "trend",
            colSpan: 2,
            children: (
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                        30 Day Trend
                    </p>
                    <p className="text-3xl font-bold text-emerald-600">Improving {trend}</p>
                    <p className="text-xs text-slate-500 mt-1">Consistent improvement</p>
                </div>
            ),
        },
    ];

    return <BentoGrid items={items} cols={4} />;
}
