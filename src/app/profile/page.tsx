"use client";

import React from "react";
import { User, Shield, Activity, FileText, Settings, Bell, ChevronRight, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Clinical Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* 1. MAIN PROFILE CARD */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-border shadow-sm p-6 text-center">
                        <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
                            <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                                <User className="w-10 h-10 text-slate-400" />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-foreground">John Doe</h2>
                        <p className="text-sm text-muted-foreground">DOB: Jan 12, 1985 • Blood Type: O+</p>

                        <div className="mt-6 flex justify-center gap-2">
                            <span className="px-3 py-1 bg-emerald-100 text-success-dark text-xs font-bold rounded-full border border-emerald-200">
                                Active Coverage
                            </span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="bg-white rounded-2xl border border-border p-2">
                        {[
                            { icon: Settings, label: "Account Settings" },
                            { icon: Bell, label: "Notifications" },
                            { icon: Shield, label: "Privacy & Data" },
                        ].map((item, i) => (
                            <button key={i} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                                <div className="flex items-center gap-3">
                                    <item.icon className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-foreground">{item.label}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. CLINICAL INTELLIGENCE SHIELD (The new requested feature) */}
                <div className="md:col-span-2 space-y-6">

                    {/* Risk Factors Section */}
                    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-foreground">Health Shield Analysis</h3>
                            </div>
                            <span className="text-xs font-bold text-emerald-600 bg-success-light px-2 py-1 rounded border border-emerald-100">
                                LOW RISK PROFILE
                            </span>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Factor 1 */}
                            <RiskCard
                                title="Hypertension"
                                status="Controlled"
                                level="low"
                                desc="Last BP reading 118/72 indicates effective management."
                            />
                            {/* Factor 2 */}
                            <RiskCard
                                title="BMI / Metabolic"
                                status="Elevated"
                                level="medium"
                                desc="BMI 26.2. Weight trend stable. Monitor lipids."
                            />
                            {/* Factor 3 */}
                            <RiskCard
                                title="Cardiovascular"
                                status="Optimal"
                                level="low"
                                desc="Resting HR 62. No history of arrhythmia."
                            />
                            {/* Factor 4 */}
                            <RiskCard
                                title="Family History"
                                status="Noted"
                                level="neutral"
                                desc="Father: T2 Diabetes. Mother: Hypertension."
                            />
                        </div>
                    </div>

                    {/* Medications & Allergies */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl border border-border p-6">
                            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-sm">
                                <Activity className="w-4 h-4 text-emerald-500" />
                                Active Medications
                            </h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex justify-between font-bold text-foreground text-sm">
                                        <span>Ferrous Sulfate</span>
                                        <span className="text-muted-foreground font-normal">325mg</span>
                                    </div>
                                    <div className="text-xs text-slate-400 mt-0.5">Daily • For Anemia</div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex justify-between font-bold text-foreground text-sm">
                                        <span>Vitamin D3</span>
                                        <span className="text-muted-foreground font-normal">2000 IU</span>
                                    </div>
                                    <div className="text-xs text-slate-400 mt-0.5">Daily • Supplement</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-border p-6">
                            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-sm">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                Allergies & Alerts
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    <span className="text-sm font-medium text-slate-700">Penicillin (Severe)</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    <span className="text-sm font-medium text-slate-700">Shellfish (Mild)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function RiskCard({ title, status, level, desc }: { title: string, status: string, level: string, desc: string }) {
    return (
        <div className="p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-200 transition-colors shadow-sm group">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider group-hover:text-blue-500 transition-colors">{title}</span>
                <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                    level === 'low' ? "bg-emerald-100 text-success-dark" :
                        level === 'medium' ? "bg-amber-100 text-amber-700" :
                            level === 'high' ? "bg-red-100 text-red-700" : "bg-muted text-slate-600"
                )}>
                    {status}
                </span>
            </div>
            <p className="text-sm text-slate-600 leading-snug">{desc}</p>
        </div>
    )
}
