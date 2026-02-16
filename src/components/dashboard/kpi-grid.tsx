"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Users, Activity, Clock, ShieldCheck } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

const KPIS = [
    { label: "Active Patients", value: "2,405", change: "+12%", trend: "up", icon: Users },
    { label: "Critical Alerts", value: "14", change: "-5%", trend: "down", icon: Activity },
    { label: "Avg Response Time", value: "12m", change: "-8%", trend: "down", icon: Clock },
    { label: "Compliance Score", value: "98.5%", change: "+2%", trend: "up", icon: ShieldCheck },
];

export function KPIGrid() {
    return (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {KPIS.map((kpi, idx) => (
                <StaggerItem key={idx}>
                    <Card className="p-6 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 rounded-lg bg-surface-elevated text-accent-primary group-hover:text-accent-teal transition-colors duration-300">
                                <kpi.icon size={20} />
                            </div>
                            <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${kpi.trend === "up"
                                    ? "text-accent-teal bg-accent-teal/10"
                                    : "text-accent-primary bg-accent-primary/10"
                                }`}>
                                {kpi.change}
                                {kpi.trend === "up" ? <ArrowUpRight size={14} className="ml-1" /> : <ArrowDownRight size={14} className="ml-1" />}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-semibold tracking-tight text-text-primary">{kpi.value}</h3>
                            <p className="text-sm text-text-muted font-medium uppercase tracking-wide">{kpi.label}</p>
                        </div>
                    </Card>
                </StaggerItem>
            ))}
        </StaggerContainer>
    );
}
