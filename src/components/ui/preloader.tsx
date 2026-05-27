"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BrandLockup, BrandMark } from "@/components/branding/brand-lockup";

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
        "Preparing your workspace",
        "Reviewing lab context",
        "Building visit priorities",
        "Drafting doctor questions",
        "Ready for your appointment",
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
                initial={{ scale: 0.5, opacity: 0.01 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="flex flex-col items-center gap-3"
            >
                <BrandLockup inverse showTagline markClassName="h-16 w-16 rounded-[18px]" textClassName="text-center" />
            </motion.div>

            {/* Loading section */}
            <AnimatePresence>
                {phase === "loading" && (
                    <motion.div
                        initial={{ opacity: 0.01, y: 16 }}
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
                                initial={{ opacity: 0.01, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0.01, y: -4 }}
                                transition={{ duration: 0.2 }}
                                className="text-center text-sm font-semibold text-slate-300"
                            >
                                {loadingSteps[stepIdx]}
                            </motion.p>
                        </AnimatePresence>

                        <div className="flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-medium text-slate-500">
                                Visit prep intelligence · {progress}%
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
            <BrandMark />
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
    const steps = React.useMemo(() => [
        { label: "Reading health context", ms: 700 },
        { label: "Finding key changes", ms: 500 },
        { label: "Ranking visit priorities", ms: 600 },
        { label: "Drafting doctor questions", ms: 800 },
        { label: "Brief ready", ms: 300 },
    ], []);
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
    }, [onComplete, steps]);

    return (
        <div className="space-y-6">
            <div className="text-center">
                <BrandMark className="mx-auto mb-3 h-12 w-12 rounded-[14px]" />
                <h2 className="font-display text-xl text-white">MedAssist</h2>
                <p className="mt-0.5 text-xs font-medium text-slate-400">Preparing your visit brief</p>
            </div>

            <div className="w-64 space-y-2.5">
                {steps.map((step, idx) => {
                    const isComplete = done > idx;
                    const isActive = done === idx;
                    return (
                        <motion.div
                            key={step.label}
                            initial={{ opacity: 0.01, x: -8 }}
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
                                "text-sm font-medium",
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
                    exit={{ opacity: 0.01 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-[200] flex min-h-[100dvh] items-center justify-center bg-[#0B1220]"
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
