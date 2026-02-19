"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────
export interface PreloaderProps {
    visible: boolean;
    onComplete?: () => void;
    variant?: "clinical" | "minimal" | "pipeline";
}

// ── Clinical Preloader (default — full branded experience) ─────────────────
function ClinicalPreloader({ onComplete }: { onComplete?: () => void }) {
    const [phase, setPhase] = React.useState<"logo" | "loading" | "done">("logo");
    const [progress, setProgress] = React.useState(0);

    const loadingSteps = [
        "Connecting to Groq AI...",
        "Loading medical ontology...",
        "Fetching your health data...",
        "Initializing AI pipeline...",
        "Ready.",
    ];
    const [stepIdx, setStepIdx] = React.useState(0);

    React.useEffect(() => {
        // Phase 1: Show logo
        const t1 = setTimeout(() => setPhase("loading"), 800);

        // Phase 2: Progress through steps
        const stepDurations = [600, 500, 700, 500, 400];
        let elapsed = 800;
        let progressVal = 0;
        const stepTimers: ReturnType<typeof setTimeout>[] = [];

        stepDurations.forEach((dur, idx) => {
            const t = setTimeout(() => {
                setStepIdx(idx);
                progressVal = Math.round(((idx + 1) / stepDurations.length) * 100);
                setProgress(progressVal);
                if (idx === stepDurations.length - 1) {
                    setTimeout(() => {
                        setPhase("done");
                        setTimeout(() => onComplete?.(), 400);
                    }, 400);
                }
            }, elapsed);
            stepTimers.push(t);
            elapsed += dur;
        });

        return () => {
            clearTimeout(t1);
            stepTimers.forEach(clearTimeout);
        };
    }, [onComplete]);

    return (
        <div className="flex flex-col items-center justify-center gap-8">
            {/* Logo */}
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="flex flex-col items-center gap-3"
            >
                {/* Shield/pulse icon */}
                <div className="relative w-16 h-16">
                    <motion.div
                        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-2xl bg-sky-500"
                    />
                    <div className="relative w-16 h-16 rounded-2xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
                        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                </div>

                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white tracking-tight">MedAssist</h1>
                    <p className="text-sky-300 text-sm mt-0.5">Clinical Intelligence Platform</p>
                </div>
            </motion.div>

            {/* Loading section */}
            <AnimatePresence>
                {phase === "loading" && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-72 space-y-4"
                    >
                        {/* Progress bar */}
                        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-sky-500 rounded-full"
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                        </div>

                        {/* Status text */}
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={stepIdx}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.2 }}
                                className="text-center text-sm text-slate-400 font-mono"
                            >
                                {loadingSteps[stepIdx]}
                            </motion.p>
                        </AnimatePresence>

                        {/* Groq AI badge */}
                        <div className="flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs text-slate-500 font-mono">
                                Groq AI (Llama 3.3) · {progress}%
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Minimal Preloader ──────────────────────────────────────────────────────
function MinimalPreloader({ onComplete }: { onComplete?: () => void }) {
    React.useEffect(() => {
        const t = setTimeout(() => onComplete?.(), 1500);
        return () => clearTimeout(t);
    }, [onComplete]);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            </div>
            <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                        className="w-2 h-2 rounded-full bg-sky-500"
                    />
                ))}
            </div>
        </div>
    );
}

// ── Pipeline Preloader ─────────────────────────────────────────────────────
function PipelinePreloader({ onComplete }: { onComplete?: () => void }) {
    const steps = [
        { label: "Groq Medical NLP", ms: 700 },
        { label: "Entity Extraction", ms: 500 },
        { label: "Risk Scoring", ms: 600 },
        { label: "Groq AI Layer", ms: 800 },
        { label: "Ready", ms: 300 },
    ];
    const [done, setDone] = React.useState(0);

    React.useEffect(() => {
        let elapsed = 0;
        const timers: ReturnType<typeof setTimeout>[] = [];
        steps.forEach((step, idx) => {
            const t = setTimeout(() => {
                setDone(idx + 1);
                if (idx === steps.length - 1) setTimeout(() => onComplete?.(), 500);
            }, elapsed + step.ms);
            timers.push(t);
            elapsed += step.ms;
        });
        return () => timers.forEach(clearTimeout);
    }, [onComplete]);

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/30">
                    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <h2 className="text-white font-bold text-lg">MedAssist</h2>
                <p className="text-slate-400 text-xs mt-0.5">Initializing clinical AI pipeline</p>
            </div>

            <div className="w-64 space-y-2.5">
                {steps.map((step, idx) => {
                    const isComplete = done > idx;
                    const isActive = done === idx;
                    return (
                        <motion.div
                            key={step.label}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: done >= idx ? 1 : 0.3, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-5 h-5 flex-shrink-0">
                                {isComplete ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                                    >
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </motion.div>
                                ) : isActive ? (
                                    <div className="w-5 h-5 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                                )}
                            </div>
                            <span className={cn(
                                "text-sm font-mono",
                                isComplete ? "text-emerald-400" : isActive ? "text-sky-400" : "text-slate-500"
                            )}>
                                {step.label}
                            </span>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Main Preloader ─────────────────────────────────────────────────────────
export function Preloader({
    visible,
    onComplete,
    variant = "clinical",
}: PreloaderProps) {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950"
                >
                    {variant === "clinical" && (
                        <ClinicalPreloader onComplete={onComplete} />
                    )}
                    {variant === "minimal" && (
                        <MinimalPreloader onComplete={onComplete} />
                    )}
                    {variant === "pipeline" && (
                        <PipelinePreloader onComplete={onComplete} />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
