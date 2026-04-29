"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Shield, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { logger } from "@/lib/logger";

function AuthContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mode, setMode] = useState<'login' | 'signup'>(
        searchParams.get('mode') === 'login' ? 'login' : 'signup'
    );
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false)
    const supabase = createClient();

    const getPasswordStrength = (pw: string): { level: number; label: string; color: string } => {
        if (!pw) return { level: 0, label: '', color: '' }
        let score = 0
        if (pw.length >= 8) score++
        if (pw.length >= 12) score++
        if (/[A-Z]/.test(pw)) score++
        if (/[0-9]/.test(pw)) score++
        if (/[^A-Za-z0-9]/.test(pw)) score++
        if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-400' }
        if (score <= 3) return { level: 2, label: 'Fair', color: 'bg-amber-400' }
        if (score <= 4) return { level: 3, label: 'Good', color: 'bg-emerald-400' }
        return { level: 4, label: 'Strong', color: 'bg-emerald-500' }
    }
    const strength = getPasswordStrength(password)

    // Helper to clear stale onboarding state before signup
    const clearOnboardingState = () => {
        if (typeof window !== 'undefined') {
            try {
                // Clear state store
                window.localStorage.removeItem('medassist-onboarding');
                // Clear the cookie that middleware uses
                document.cookie = "onboarding_complete=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            } catch (_e) { }
        }
    };

    useEffect(() => {
        const modeParam = searchParams.get('mode');
        if (modeParam === 'signup') setMode('signup');
        else if (modeParam === 'login') setMode('login');
    }, [searchParams]);

    const handleAuth = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsLoading(true);

        try {
            if (mode === 'signup') {
                // Clear any stale state before creating a new account
                clearOnboardingState();

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;

                if (data.user && !data.session) {
                    toast.success("Confirmation email sent!", {
                        description: "Please check your email to confirm your account, then you can sign in.",
                        duration: 10000
                    });
                    return;
                }

                // Stale state already cleared above for clarity

                router.push('/onboarding');
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                if (data.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('onboarding_complete')
                        .eq('id', data.user.id)
                        .single();

                    if (profile?.onboarding_complete) {
                        router.push('/dashboard');
                    } else {
                        router.push('/onboarding');
                    }
                }
            }
        } catch (error: unknown) {
            logger.error("Auth error:", error);
            const msg = (error as Error).message || "Authentication failed";
            toast.error(msg, {
                description: msg.toLowerCase().includes("rate limit")
                    ? "Too many requests. Please wait a minute."
                    : "Please check your details and try again.",
                duration: 5000
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white rounded-[24px] shadow-xl shadow-stone-200/50 p-8 border border-[#E8E6DF]">
            <div className="text-center mb-8">
                <h1 className="font-display text-3xl text-[#1C1917] mb-2">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-[#57534E]">
                    {mode === 'login'
                        ? 'Enter your details to access your health dashboard'
                        : 'Start your journey to better health intelligence'}
                </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#A8A29E] mb-1.5 ml-1">
                        Email Address
                    </label>
                    <input
                        type="email"
                        name="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-[12px] bg-[#FAFAF7] border border-[#E8E6DF] 
                                 text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 
                                 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                        placeholder="name@example.com"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#A8A29E] mb-1.5 ml-1">
                        Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-[12px] bg-[#FAFAF7] border border-[#E8E6DF] 
                                 text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 
                                 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                        placeholder="••••••••"
                    />
                    {mode === 'signup' && password && (
                        <div className="mt-2">
                            <div className="flex gap-1 mb-1">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.level ? strength.color : 'bg-[#E8E6DF]'}`} />
                                ))}
                            </div>
                            <p className={`text-[11px] font-medium ${strength.level >= 3 ? 'text-emerald-600' : strength.level >= 2 ? 'text-amber-600' : 'text-red-500'}`}>
                                {strength.label} {password.length < 8 && <span className="text-[#A8A29E]">· Min 8 characters</span>}
                            </p>
                            <p className="text-[10px] text-[#A8A29E] mt-1">
                                Use 8+ characters with uppercase, numbers, and symbols
                            </p>
                        </div>
                    )}
                </div>

                {mode === 'signup' && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 8 }}>
                        <label htmlFor="terms" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', minHeight: 44, padding: '4px 0' }}>
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreedToTerms}
                                onChange={e => setAgreedToTerms(e.target.checked)}
                                className="w-4 h-4 rounded border-[#E8E6DF] text-sky-500 focus:ring-sky-500 cursor-pointer"
                                style={{ marginTop: 2, accentColor: '#0EA5E9' }}
                            />
                            <span style={{ fontSize: 13, color: '#57534E', lineHeight: 1.5 }}>
                            I agree to the{' '}
                            <a href="/terms" target="_blank" style={{ color: '#0EA5E9', textDecoration: 'none', fontWeight: 500 }}>
                                Terms of Service
                            </a>
                            {' '}and{' '}
                            <a href="/privacy" target="_blank" style={{ color: '#0EA5E9', textDecoration: 'none', fontWeight: 500 }}>
                                Privacy Policy
                            </a>
                        </span>
                        </label>
                    </div>
                )}


                <button
                    type="submit"
                    disabled={isLoading || (mode === 'signup' && !agreedToTerms)}
                    title={mode === 'signup' && !agreedToTerms ? "You must agree to the Terms of Service to continue" : undefined}
                    className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-[12px] 
                             font-semibold shadow-lg shadow-sky-500/20 transition-all 
                             hover:-translate-y-0.5 disabled:opacity-50 disabled:bg-stone-300 disabled:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2 mt-2 min-h-[44px]"
                    style={{ WebkitAppearance: 'none' }}
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            {mode === 'login' ? 'Sign In' : (agreedToTerms || mode !== 'signup' ? 'Get Started' : 'Accept Terms to Continue')}
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button
                    onClick={() => {
                        setMode(mode === 'login' ? 'signup' : 'login');
                        const url = new URL(window.location.href);
                        url.searchParams.set('mode', mode === 'login' ? 'signup' : 'login');
                        window.history.pushState({}, '', url.toString());
                    }}
                    className="text-sm text-[#57534E] hover:text-[#1C1917] transition-colors"
                >
                    {mode === 'login'
                        ? "Don't have an account? Sign up"
                        : "Already have an account? Sign in"}
                </button>
            </div>

            <div className="mt-6 flex justify-center gap-6 text-xs text-[#A8A29E]">
                <Link href="/terms" className="hover:text-[#57534E] transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="hover:text-[#57534E] transition-colors">Privacy Policy</Link>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <div className="min-h-[100dvh] bg-[#F0EFE9] flex flex-col justify-center items-center p-4">
            <Link href="/" className="fixed top-[max(2rem,env(safe-area-inset-top,0px))] left-6 flex items-center gap-2 z-10">
                <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
                    <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-display text-xl text-[#1C1917]">MedAssist</span>
            </Link>

            <Suspense fallback={
                <div className="w-full max-w-md bg-white rounded-[24px] shadow-xl shadow-stone-200/50 p-8 border border-[#E8E6DF] flex justify-center items-center h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                </div>
            }>
                <AuthContent />
            </Suspense>
        </div>
    );
}
