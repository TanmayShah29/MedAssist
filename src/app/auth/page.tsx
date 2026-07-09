"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowRight, Mail, RotateCcw, CheckCircle2, Check } from "lucide-react";
import Link from "next/link";
import { logger } from "@/lib/logger";
import { resetOnboardingCookie } from "@/app/actions/user-data";
import { BrandLockup } from "@/components/branding/brand-lockup";

function AuthContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mode, setMode] = useState<'login' | 'signup'>(
        searchParams.get('mode') === 'login' ? 'login' : 'signup'
    );
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [confirmationEmail, setConfirmationEmail] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false)
    const supabase = createClient();

    // Helper to clear stale app state before signup
    const clearLocalSessionState = () => {
        if (typeof window !== 'undefined') {
            try {
                [
                    'medassist-onboarding',
                    'medassist_cached_lab_results',
                    'medassist_cached_biomarkers',
                    'medassist_cached_real_lab_results',
                    'medassist_cached_real_biomarkers',
                    'medassist_cached_demo_lab_results',
                    'medassist_cached_demo_biomarkers',
                    'medassist-storage-v2',
                ].forEach((key) => window.localStorage.removeItem(key));
                Object.keys(window.sessionStorage)
                    .filter((key) => key === 'medassist_loaded' || key.startsWith('medassist_dq_'))
                    .forEach((key) => window.sessionStorage.removeItem(key));
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
                clearLocalSessionState();
                await resetOnboardingCookie();

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;

                if (data.user && !data.session) {
                    setConfirmationEmail(email);
                    return;
                }

                // Stale state already cleared above for clarity

                router.replace('/onboarding');
                router.refresh();
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

    const handleResendConfirmation = async () => {
        setIsResending(true);
        try {
            const { error } = await supabase.auth.resend({
                type: "signup",
                email: confirmationEmail,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
            toast.success("Confirmation email resent.");
        } catch (error: unknown) {
            logger.error("Resend confirmation error:", error);
            toast.error((error as Error).message || "Could not resend confirmation email.");
        } finally {
            setIsResending(false);
        }
    };

    if (confirmationEmail) {
        return (
            <div className="w-full max-w-md app-panel-white p-8">
                <div className="w-12 h-12 rounded-[14px] bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-6 h-6" />
                </div>
                <div className="text-center mb-6">
                    <h1 className="font-display text-3xl text-[#0F172A] mb-2">
                        Check your email
                    </h1>
                    <p className="text-sm text-[#475569] leading-relaxed">
                        We sent a confirmation link to <span className="font-semibold text-[#0F172A]">{confirmationEmail}</span>. Open it to finish creating your account and continue onboarding.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={isResending}
                    className="w-full min-h-[44px] rounded-[12px] bg-sky-500 text-white font-semibold hover:bg-sky-600 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                    {isResending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    Resend confirmation
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setConfirmationEmail("");
                        setMode("login");
                    }}
                    className="mt-4 w-full text-sm text-[#475569] hover:text-[#0F172A] transition-colors"
                >
                    Back to sign in
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md app-panel-white p-8">
            <div className="text-center mb-8">
                <h1 className="font-display text-3xl text-[#0F172A] mb-2">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-[#475569]">
                    {mode === 'login'
                        ? 'Enter your details to access your visit prep dashboard'
                        : 'Start preparing for clearer doctor conversations'}
                </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
                <div>
                    <label htmlFor="auth-email" className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5 ml-1">
                        Email Address
                    </label>
                    <input
                        id="auth-email"
                        type="email"
                        name="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-[12px] bg-[#FDFDFB] border border-[#EBEAE4] 
                                 text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 
                                 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                        placeholder="name@example.com"
                    />
                </div>
                <div>
                    <label htmlFor="auth-password" className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5 ml-1">
                        Password
                    </label>
                    <input
                        id="auth-password"
                        type="password"
                        name="password"
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-[12px] bg-[#FDFDFB] border border-[#EBEAE4] 
                                 text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 
                                 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                        placeholder="••••••••"
                    />
                </div>

                {mode === 'signup' && (
                    <div className="mt-2">
                        <label htmlFor="terms" className="flex min-h-[44px] cursor-pointer items-start gap-3 py-1">
                            <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreedToTerms}
                                onChange={e => setAgreedToTerms(e.target.checked)}
                                className="peer h-5 w-5 cursor-pointer rounded-[6px] border-2 border-[#D1CFCD] bg-white shadow-sm transition-all checked:border-sky-500 checked:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                            />
                                <Check className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                            </span>
                            <span className="text-[13px] leading-relaxed text-[#475569]">
                                I agree to the{' '}
                                <a href="/terms" target="_blank" className="font-medium text-sky-500 no-underline hover:text-sky-600">
                                    Terms of Service
                                </a>
                                {' '}and{' '}
                                <a href="/privacy" target="_blank" className="font-medium text-sky-500 no-underline hover:text-sky-600">
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
                    className="text-sm text-[#475569] hover:text-[#0F172A] transition-colors"
                >
                    {mode === 'login'
                        ? "Don't have an account? Sign up"
                        : "Already have an account? Sign in"}
                </button>
            </div>

            <div className="mt-6 flex justify-center gap-6 text-xs text-[#94A3B8]">
                <Link href="/terms" className="hover:text-[#475569] transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="hover:text-[#475569] transition-colors">Privacy Policy</Link>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <div className="min-h-[100dvh] bg-[#FDFDFB] flex flex-col justify-center items-center p-4 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(224,242,254,0.72),rgba(250,250,247,0))]" />
            <Link href="/" className="fixed top-[max(2rem,env(safe-area-inset-top,0px))] left-6 z-10 group">
                <BrandLockup showTagline markClassName="transition-transform group-hover:-rotate-3 group-hover:scale-105" />
            </Link>

            <div className="relative grid w-full max-w-5xl grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1fr)]">
                <aside className="hidden lg:block">
                    <p className="section-label mb-3 text-sky-600">What happens next</p>
                    <h2 className="font-display text-5xl leading-tight text-[#0F172A]">
                        From account to visit prep in a few minutes.
                    </h2>
                    <div className="mt-8 space-y-4">
                        {[
                            "Set the basics that affect reference ranges.",
                            "Upload a PDF or type values manually.",
                            "Review extracted biomarkers before saving.",
                            "Open a dashboard built around doctor questions.",
                        ].map((item) => (
                            <div key={item} className="flex items-start gap-3">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                                <p className="text-sm leading-relaxed text-[#475569]">{item}</p>
                            </div>
                        ))}
                    </div>
                </aside>
                <Suspense fallback={
                    <div className="w-full max-w-md app-panel-white p-8 flex justify-center items-center h-[400px] justify-self-center">
                        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                    </div>
                }>
                    <div className="justify-self-center w-full max-w-md">
                        <AuthContent />
                    </div>
                </Suspense>
            </div>
        </div>
    );
}
