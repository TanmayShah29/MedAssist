"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string;
    unit: string;
    status: 'optimal' | 'warning' | 'critical';
    trend: 'up' | 'down' | 'stable';
    className?: string;
}

export function MetricCard({ title, value, unit, status, trend, className }: MetricCardProps) {
    // Determine color based on status
    const statusColor =
        status === 'critical' ? 'text-destructive bg-destructive/10 border-destructive/20' :
            status === 'warning' ? 'text-warning bg-warning/10 border-warning/20' :
                'text-success bg-success/10 border-success/20';

    const chartColor =
        status === 'critical' ? 'var(--color-error)' :
            status === 'warning' ? 'var(--color-warning)' :
                'var(--color-success)';

    const TrendIcon =
        trend === 'up' ? ArrowUpRight :
            trend === 'down' ? ArrowDownRight :
                Minus;

    // Fake sparkline data based on trend
    const data = trend === 'up'
        ? [{ v: 10 }, { v: 12 }, { v: 11 }, { v: 14 }, { v: 13 }, { v: 15 }, { v: 18 }]
        : trend === 'down'
            ? [{ v: 18 }, { v: 16 }, { v: 17 }, { v: 14 }, { v: 15 }, { v: 12 }, { v: 10 }]
            : [{ v: 10 }, { v: 11 }, { v: 10 }, { v: 11 }, { v: 10 }, { v: 11 }, { v: 10 }];

    const trendLabel = trend === 'up' ? 'Trending Up' : trend === 'down' ? 'Trending Down' : 'Stable';

    return (
        <article
            className={cn("group relative bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:border-primary", className)}
            tabIndex={0}
            aria-label={`${title}: ${value} ${unit}. Status: ${status}. Trend: ${trendLabel}.`}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider">{title}</span>
                <span className={cn("flex items-center gap-0.5 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full border", statusColor)}>
                    <TrendIcon className="w-3 h-3" aria-hidden="true" />
                    {trend}
                </span>
            </div>

            <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-bold text-foreground tracking-tight">{value}</span>
                <span className="text-xs text-muted-foreground font-medium">{unit}</span>
            </div>

            {/* Micro-Chart */}
            <div className="h-8 w-full opacity-40 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="v"
                            stroke={chartColor}
                            strokeWidth={2}
                            fill={`url(#grad-${title})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </article>
    );
}
