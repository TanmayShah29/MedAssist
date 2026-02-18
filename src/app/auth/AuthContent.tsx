"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Eye, EyeOff, ArrowLeft, Check } from "lucide-react";

export default function AuthContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mode, setMode] = useState<"login" | "signup">(
        searchParams.get("mode") === "login" ? "login" : "signup"
    );
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setError("");
        setLoading(true);

        // Basic validation
        if (!form.email || !form.password) {
            setError("Please fill in all fields.");
            setLoading(false);
            return;
        }

        // MOCK AUTH FOR PREVIEW
        setTimeout(() => {
            if (mode === "signup") {
                router.push("/onboarding");
            } else {
                router.push("/dashboard");
            }
            setLoading(false);
        }, 1000);

        /*
        try {
            if (mode === "signup") {
                // ... real auth logic ...
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
        */
    };

    return (
        <div className="min-h-screen min-h-[100dvh] bg-[#FAFAF7] flex overflow-hidden">

            {/* ── LEFT PANEL — decorative (desktop only) ── */}
            <div className="hidden lg:flex w-1/2 bg-[#0F172A] flex-col 
                      items-center justify-center p-12 relative flex-shrink-0">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-16">
                    <div className="w-10 h-10 rounded-2xl bg-sky-500 
                          flex items-center justify-center
                          shadow-lg shadow-sky-500/30">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-display text-2xl text-white">
                        MedAssist
                    </span>
                </div>

                {/* Animated pipeline preview */}
                <div className="w-full max-w-sm space-y-3">
                    <p className="text-[10px] font-semibold uppercase 
                        tracking-[0.12em] text-[#475569] mb-4">
                        Live Analysis Pipeline
                    </p>
                    {[
                        { label: "Groq Medical NLP", ms: "320ms", done: true },
                        { label: "Entity Extraction", ms: "145ms", done: true },
                        { label: "Risk Scoring", ms: "890ms", done: true },
                        { label: "Groq AI Layer", ms: "1.2s", done: true },
                        { label: "Confidence", ms: "45ms", done: true },
                    ].map((step, idx) => (
                        <motion.div
                            key={step.label}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.15 + 0.3 }}
                            className="flex items-center gap-3 py-2 border-b 
                         border-[#1E293B] last:border-0"
                        >
                            <div className="w-4 h-4 rounded-full bg-emerald-500 
                              flex items-center justify-center flex-shrink-0">
                                <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                            <span className="text-xs text-[#94A3B8] font-mono flex-1">
                                {step.label}
                            </span>
                            <span className="text-[10px] text-[#475569] font-mono">
                                {step.ms}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* Quote */}
                <div className="mt-16 max-w-sm">
                    <p className="text-[#94A3B8] text-sm leading-relaxed italic">
                        "Your lab results contain your health story.
                        MedAssist helps you read it."
                    </p>
                </div>
            </div>

            {/* ── RIGHT PANEL — auth form ─────────────────── */}
            <div className="flex-1 flex flex-col items-center justify-center 
                      p-6 md:p-12 relative">

                {/* Back to landing */}
                <button
                    onClick={() => router.push("/")}
                    className="absolute top-6 left-6 flex items-center gap-1.5 
                     text-sm text-[#A8A29E] hover:text-[#57534E] 
                     transition-colors lg:top-8 lg:left-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <div className="w-full max-w-sm">

                    {/* Header */}
                    <div className="mb-8">
                        {/* Mobile logo */}
                        <div className="flex items-center gap-2 mb-8 lg:hidden">
                            <div className="w-8 h-8 rounded-xl bg-sky-500 
                              flex items-center justify-center">
                                <Shield className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-display text-xl text-[#1C1917]">
                                MedAssist
                            </span>
                        </div>

                        <h1 className="font-display text-3xl text-[#1C1917] mb-2">
                            {mode === "signup" ? "Create your account" : "Welcome back"}
                        </h1>
                        <p className="text-sm text-[#A8A29E]">
                            {mode === "signup"
                                ? "Start understanding your health data in minutes."
                                : "Sign in to view your health dashboard."}
                        </p>
                    </div>

                    {/* Form */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {/* Email */}
                            <div>
                                <label className="text-[10px] font-semibold uppercase 
                                   tracking-[0.12em] text-[#A8A29E] 
                                   mb-1.5 block">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="john@example.com"
                                    className="w-full px-4 py-3 bg-[#F5F4EF] border 
                             border-[#E8E6DF] rounded-[10px]
                             text-[16px] text-[#1C1917] 
                             placeholder-[#A8A29E]
                             focus:outline-none focus:border-sky-400 
                             focus:ring-2 focus:ring-sky-100
                             transition-all"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="text-[10px] font-semibold uppercase 
                                   tracking-[0.12em] text-[#A8A29E] 
                                   mb-1.5 block">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        placeholder="Minimum 8 characters"
                                        className="w-full px-4 py-3 pr-12 bg-[#F5F4EF] 
                               border border-[#E8E6DF] rounded-[10px]
                               text-[16px] text-[#1C1917] 
                               placeholder-[#A8A29E]
                               focus:outline-none focus:border-sky-400 
                               focus:ring-2 focus:ring-sky-100
                               transition-all"
                                    />
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 
                               text-[#A8A29E] hover:text-[#57534E] 
                               transition-colors"
                                    >
                                        {showPassword
                                            ? <EyeOff className="w-4 h-4" />
                                            : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm password (signup only) */}
                            {mode === "signup" && (
                                <div>
                                    <label className="text-[10px] font-semibold uppercase 
                                     tracking-[0.12em] text-[#A8A29E] 
                                     mb-1.5 block">
                                        Confirm password
                                    </label>
                                    <input
                                        type="password"
                                        value={form.confirmPassword}
                                        onChange={e => setForm(f => ({
                                            ...f,
                                            confirmPassword: e.target.value
                                        }))}
                                        placeholder="Same password again"
                                        className="w-full px-4 py-3 bg-[#F5F4EF] border 
                               border-[#E8E6DF] rounded-[10px]
                               text-[16px] text-[#1C1917] 
                               placeholder-[#A8A29E]
                               focus:outline-none focus:border-sky-400 
                               focus:ring-2 focus:ring-sky-100
                               transition-all"
                                    />
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm text-red-600 bg-red-50 border 
                             border-red-200 rounded-[8px] px-3 py-2"
                                >
                                    {error}
                                </motion.p>
                            )}

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 
                           disabled:bg-sky-300 text-white font-semibold 
                           rounded-[10px] transition-all
                           flex items-center justify-center gap-2
                           shadow-sm shadow-sky-500/20"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 
                                  border-t-white rounded-full animate-spin" />
                                ) : (
                                    mode === "signup"
                                        ? "Create account"
                                        : "Sign in"
                                )}
                            </button>

                            {/* Mode switch */}
                            <p className="text-center text-sm text-[#A8A29E]">
                                {mode === "signup"
                                    ? "Already have an account?"
                                    : "Don't have an account?"}{" "}
                                <button
                                    onClick={() => setMode(
                                        mode === "signup" ? "login" : "signup"
                                    )}
                                    className="text-sky-500 hover:text-sky-600 
                             font-medium transition-colors"
                                >
                                    {mode === "signup" ? "Sign in" : "Create one free"}
                                </button>
                            </p>

                            {/* Privacy note (signup only) */}
                            {mode === "signup" && (
                                <p className="text-center text-[11px] text-[#A8A29E] 
                              leading-relaxed">
                                    By creating an account you agree that your data is
                                    processed locally and never sold to third parties.
                                </p>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
