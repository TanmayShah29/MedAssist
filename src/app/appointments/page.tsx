"use client";

import React, { useState } from "react";
import { Calendar, Clock, MapPin, Video, ChevronRight, FileText, CheckCircle, BrainCircuit, Sparkles } from "lucide-react";
import { MotionButton } from "@/components/ui/motion";
import { cn } from "@/lib/utils";
import { getAppointmentPrep } from "@/app/actions/gemini";

export default function AppointmentsPage() {
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [prepData, setPrepData] = useState<any | null>(null);

    const handleGeneratePrep = async (id: string) => {
        setAnalyzingId(id);
        const data = await getAppointmentPrep(id);
        setPrepData(data);
        setAnalyzingId(null);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Care Timeline</h1>
                    <p className="text-muted-foreground mt-1">Manage visits and prepare with AI insights.</p>
                </div>
                <MotionButton className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule Visit
                </MotionButton>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Upcoming Appointments */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Upcoming</h2>

                    {/* Active Appointment Card */}
                    <div className="bg-white rounded-2xl border border-blue-200 shadow-sm overflow-hidden relative group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center bg-blue-50 rounded-xl p-3 border border-blue-100 min-w-[70px]">
                                        <span className="text-xs font-bold text-blue-600 uppercase">Feb</span>
                                        <span className="text-2xl font-bold text-blue-900">24</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">Hematology Follow-up</h3>
                                        <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm">
                                            <span className="font-medium text-blue-700">Dr. Sarah Chen</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5" /> Virtual Visit</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-foreground">10:00 AM</div>
                                    <span className="text-xs text-slate-400">30 min duration</span>
                                </div>
                            </div>

                            {/* AI Prep Section */}
                            {!prepData ? (
                                <div
                                    onClick={() => handleGeneratePrep("1")}
                                    className="bg-slate-50 rounded-xl border border-border border-dashed p-4 flex items-center justify-center gap-3 cursor-pointer hover:bg-muted transition-colors group-hover:border-blue-300"
                                >
                                    {analyzingId === "1" ? (
                                        <>
                                            <BrainCircuit className="w-5 h-5 text-blue-600 animate-pulse" />
                                            <span className="text-sm font-medium text-blue-700">Generating Clinical Prep...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                                            <span className="text-sm font-medium text-muted-foreground group-hover:text-blue-700">Generate AI Visit Prep</span>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-success-light/50 rounded-xl border border-emerald-100 p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-start gap-3">
                                        <BrainCircuit className="w-5 h-5 text-emerald-600 mt-1" />
                                        <div>
                                            <h4 className="font-bold text-emerald-900 text-sm">AI Clinical Brief</h4>
                                            <p className="text-sm text-emerald-800/80 leading-relaxed mt-1">{prepData.summary}</p>
                                        </div>
                                    </div>
                                    <div className="pl-8">
                                        <h5 className="text-xs font-bold text-success-dark uppercase tracking-wide mb-2">Checklist</h5>
                                        <ul className="space-y-2">
                                            {prepData.checklist.map((item: string, i: number) => (
                                                <li key={i} className="flex gap-2 text-sm text-emerald-900 items-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex gap-3 pt-6 border-t border-slate-100">
                                <button className="flex-1 py-2.5 rounded-lg border border-border text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                                    Reschedule
                                </button>
                                <button className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                                    Join Waiting Room
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Past Appointments List (Condensed) */}
                    <div className="space-y-4 pt-4">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Past Visits</h2>
                        {[
                            { title: "General Checkup", doctor: "Dr. James Wilson", date: "Jan 12", status: "Completed" },
                            { title: "Lab Work", doctor: "Quest Diagnostics", date: "Jan 10", status: "Results In" }
                        ].map((apt, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white border border-border rounded-xl hover:border-slate-300 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-slate-400">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground text-sm">{apt.title}</h4>
                                        <div className="text-xs text-muted-foreground">{apt.doctor} • {apt.date}</div>
                                    </div>
                                </div>
                                <button className="text-xs font-bold text-blue-600 hover:underline">View Summary</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Calendar Preview placeholder */}
                <div className="bg-white rounded-2xl border border-border p-6 h-fit">
                    <h3 className="font-bold text-foreground mb-4">February 2024</h3>
                    {/* Simplified Calendar visual */}
                    <div className="grid grid-cols-7 gap-2 text-center text-xs mb-2 text-slate-400 font-medium">
                        <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 31 }).map((_, i) => (
                            <div key={i} className={cn(
                                "h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors",
                                i === 23 ? "bg-primary text-white shadow-sm" : "hover:bg-slate-50 text-slate-600"
                            )}>
                                {i + 1}
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Care Team</h4>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">SC</div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-foreground">Dr. Sarah Chen</div>
                                <div className="text-xs text-muted-foreground">Hematologist</div>
                            </div>
                            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
