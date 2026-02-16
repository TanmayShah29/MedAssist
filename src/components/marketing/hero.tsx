import React from "react";
import Link from "next/link";
import { Upload, MessageCircle, ShieldCheck, Activity, Brain, ArrowRight, HeartPulse } from "lucide-react";
import { MotionButton } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

export default function MedAssistHero() {
    return (
        <main className="w-full bg-background relative overflow-hidden">
            {/* SEO: H1 serves as main title */}
            <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28" aria-label="Clinical AI Health Platform">

                {/* Background Details - Subtle Grid Only */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    {/* Medical Graph Pattern Overlay (Inline SVG) */}
                    <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="medical-graph" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M0 20h40" stroke="currentColor" strokeWidth="1" className="text-secondary" />
                                <path d="M20 0v40" stroke="currentColor" strokeWidth="1" className="text-secondary" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#medical-graph)" />
                    </svg>
                </div>

                <div className="container mx-auto px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        {/* LEFT: Text and CTAs */}
                        <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
                            {/* Entrance Animation: Text fades in and slides upward */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                HIPAA Compliant AI Platform
                            </div>

                            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.15] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 fill-mode-forwards">
                                AI-Powered <br className="hidden lg:block" />
                                <span className="text-primary">Health Intelligence</span>
                            </h1>

                            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-forwards">
                                Upload lab reports or describe your symptoms to receive structured insights, risk processing, and personalized care suggestions.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-forwards">
                                <Link href="/dashboard">
                                    <button className="px-8 py-3.5 rounded-xl font-bold text-primary-foreground bg-primary flex items-center justify-center gap-2 group transform transition-all duration-300 hover:scale-[1.02] hover:bg-primary/90 w-full sm:w-auto shadow-sm">
                                        Get Started
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>

                                <Link href="/assistant">
                                    <button className="px-8 py-3.5 rounded-xl font-bold text-foreground border border-border bg-card flex items-center justify-center gap-2 group transform transition-all duration-300 hover:scale-[1.02] hover:bg-card/80 hover:border-primary/50 w-full sm:w-auto shadow-sm">
                                        View Demo
                                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                    </button>
                                </Link>
                            </div>

                            <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-card flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                </div>
                                <p><span className="text-secondary font-bold">2,000+</span> patients analyzing health data</p>
                            </div>
                        </div>

                        {/* RIGHT: Hero Illustration / Graphic */}
                        <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
                            {/* Main Card UI Representation */}
                            <div className="relative bg-card rounded-2xl shadow-xl shadow-black/40 border border-border overflow-hidden transform transition-transform duration-500 hover:scale-[1.01]">
                                {/* Header */}
                                <div className="absolute top-0 w-full h-12 bg-surface border-b border-white/5 flex items-center px-4 gap-2 z-20">
                                    <div className="w-2.5 h-2.5 rounded-full bg-error" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-warning" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-success" />
                                </div>

                                {/* Body Mockup */}
                                <div className="pt-16 pb-8 px-6 space-y-6">
                                    {/* AI Insight Bubble */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-xs font-bold text-muted-foreground">TESTOSTERONE (TOTAL)</span>
                                            <span className="text-xs font-bold text-success">OPTIMIZED</span>
                                        </div>
                                        <div className="h-32 flex items-end gap-1">
                                            {[40, 65, 55, 70, 60, 85, 95].map((h, i) => (
                                                <div key={i} className="flex-1 bg-primary/20 rounded-t-sm hover:bg-primary/30 transition-colors relative group" style={{ height: `${h}%` }}>
                                                    <div className="absolute top-0 w-full text-center text-[8px] text-primary opacity-0 group-hover:opacity-100 -mt-4 transition-opacity">
                                                        {h}0
                                                    </div>
                                                    <div className="absolute bottom-0 w-full bg-primary/50 h-1 group-hover:bg-primary transition-colors" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Mock Insights */}
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <Activity className="w-3.5 h-3.5 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-foreground">Hormonal Baseline Improved</h4>
                                                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                                                    Biomarkers indicate a <span className="text-primary">15% recovery</span> in efficiency metrics over 30 days.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Badge */}
                                <div className="absolute -right-6 -bottom-6 bg-card p-4 rounded-xl shadow-lg border border-border flex items-center gap-3 animate-bounce [animation-duration:3.5s]">
                                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                                        <HeartPulse className="w-5 h-5 text-success" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase">Health Score</p>
                                        <p className="text-xl font-bold text-foreground">92/100</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
