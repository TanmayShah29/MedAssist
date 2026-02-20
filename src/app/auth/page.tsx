"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Shield, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

function AuthContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mode, setMode] = useState<'login' | 'signup'>(
        searchParams.get('mode') === 'login' ? 'login' : 'signup'
    );
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const modeParam = searchParams.get('mode');
        if (modeParam === 'signup') setMode('signup');
        else if (modeParam === 'login') setMode('login');
    }, [searchParams]);

    const handleAuth = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        console.log('handleAuth called, mode:', mode);
        setIsLoading(true);

        try {
            if (mode === 'signup') {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;

                if (data.user && !data.session) {
                    toast.success("Check your email to confirm your account, then sign in.");
                    return;
                }

                // Clear any leftover onboarding state from previous users before starting
                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('medassist-onboarding');
                }

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
        } catch (error: any) {
            toast.error(error.message || "Authentication failed");
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-[12px] bg-[#FAFAF7] border border-[#E8E6DF] 
                                 text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 
                                 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-[12px] 
                             font-semibold shadow-lg shadow-sky-500/20 transition-all 
                             hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0
                             flex items-center justify-center gap-2 mt-2"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            {mode === 'login' ? 'Sign In' : 'Get Started'}
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
        </div>
    );
}

export default function AuthPage() {
    return (
        <div className="min-h-screen bg-[#F0EFE9] flex flex-col justify-center items-center p-4">
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2">
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
