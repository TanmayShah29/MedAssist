"use client";

import React from "react";
import { useStore } from "@/store/useStore";
import { Activity, TrendingUp, AlertTriangle, ShieldCheck, LucideIcon } from "lucide-react";

export function MetricsRow() {
    const { healthScore, biomarkers, labs } = useStore();

    // Determine Risk Level
    const riskLevel = healthScore > 85 ? 'Low' : healthScore > 70 ? 'Moderate' : 'High';

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 1. Health Score (Dominant) */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group hover:border-primary/20 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity className="w-16 h-16 text-primary" />
                </div>
                <div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Health Score</div>
                    <div className="text-4xl font-extrabold text-foreground tracking-tight flex items-baseline gap-2">
                        {healthScore}
                        <span className="text-lg text-success font-bold">+2.4</span>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${healthScore}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium mt-2">Top 12% for age group</p>
                </div>
            </div>

            {/* 2. Risk Profile */}
            <StatCard
                label="Risk Profile"
                value="Low"
                sub="Stable since Jan"
                icon={ShieldCheck}
                colorClass="text-success bg-success/10"
            />

            {/* 3. Flagged Markers */}
            <StatCard
                label="Biomarkers Flagged"
                value={biomarkers.filter(b => b.status === "critical" || b.status === "warning").length}
                sub="Requires attention"
                icon={AlertTriangle}
                colorClass="text-warning bg-warning/10"
            />

            {/* 4. Trend */}
            <StatCard
                label="30-Day Trend"
                value="Improving"
                sub="Optimization on track"
                icon={TrendingUp}
                colorClass="text-primary bg-primary/10"
            />
        </div>
    );
}

function StatCard({ label, value, sub, icon: Icon, colorClass }: { label: string, value: string | number, sub: string, icon: LucideIcon, colorClass: string }) {
    return (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-center gap-1 group hover:border-primary/20 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</div>
                <div className={`p-2 rounded-lg ${colorClass} group-hover:bg-opacity-80 transition-colors`}>
                    <Icon className="w-4 h-4" />
                </div>
            </div>
            <div className="text-2xl font-bold text-foreground tracking-tight">{value}</div>
            <div className="text-xs font-medium text-muted-foreground mt-1 group-hover:text-foreground transition-colors">{sub}</div>
        </div>
    );
}
