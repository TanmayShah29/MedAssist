"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Activity, LogOut, Shield } from "lucide-react";
import { signOutAndResetMedAssist } from "@/lib/account-session";
import { useLandingAccount } from "@/components/landing/use-landing-account";

export function LandingHeader() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    accountState,
    appCtaLabel,
    appCtaPath,
    isSignedIn,
    setAccountState,
    showResetSession,
    supabase,
  } = useLandingAccount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleResetSession = async () => {
    await signOutAndResetMedAssist(supabase);
    setAccountState("visitor");
    setMenuOpen(false);
    router.replace("/");
    router.refresh();
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#FAFAF7]/90 backdrop-blur-md border-b border-[#E8E6DF] shadow-sm shadow-slate-900/[0.04]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-[10px] bg-sky-500 flex items-center justify-center shadow-sm shadow-sky-500/30 group-hover:shadow-sky-500/50 transition-shadow">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-[22px] text-[#1C1917]">MedAssist</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="#how-it-works" className="text-sm font-medium text-[#57534E] hover:text-[#1C1917] px-4 py-2 rounded-lg hover:bg-[#F5F4EF] transition-all">How it works</Link>
            <Link href="#features" className="text-sm font-medium text-[#57534E] hover:text-[#1C1917] px-4 py-2 rounded-lg hover:bg-[#F5F4EF] transition-all">Features</Link>
            <Link href="#security" className="text-sm font-medium text-[#57534E] hover:text-[#1C1917] px-4 py-2 rounded-lg hover:bg-[#F5F4EF] transition-all">Security</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/demo" className="hidden sm:flex text-sm font-semibold text-sky-600 hover:text-sky-700 px-4 py-2 rounded-lg hover:bg-sky-50 transition-all items-center gap-1.5">
              <Activity size={14} /> Live Demo
            </Link>
            {showResetSession && (
              <button
                type="button"
                onClick={handleResetSession}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[#57534E] hover:text-red-600 transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            )}
            {!isSignedIn && (
              <Link href="/auth?mode=login" className="hidden sm:block text-sm font-semibold text-[#57534E] hover:text-[#1C1917] px-4 py-2 transition-colors">
                Sign in
              </Link>
            )}
            <button
              type="button"
              onClick={() => router.push(appCtaPath)}
              className="hidden sm:inline-flex bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-[10px] text-sm font-bold transition-all active:scale-95 shadow-md shadow-sky-500/20"
            >
              {appCtaLabel}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg hover:bg-[#F5F4EF] transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            >
              <span className={`block w-5 h-0.5 bg-[#57534E] transition-transform duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-0.5 bg-[#57534E] transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-[#57534E] transition-transform duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-[#FAFAF7]/95 backdrop-blur-xl border-t border-[#E8E6DF] px-6 py-4 space-y-1">
            <Link href="#how-it-works" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-[#57534E] py-3 border-b border-[#F0EEE8]">How it works</Link>
            <Link href="#features" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-[#57534E] py-3 border-b border-[#F0EEE8]">Features</Link>
            <Link href="#security" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-[#57534E] py-3 border-b border-[#F0EEE8]">Security</Link>
            <Link href="/demo" onClick={() => setMenuOpen(false)} className="block text-sm font-semibold text-sky-600 py-3 border-b border-[#F0EEE8]">Live Demo</Link>
            {showResetSession && (
              <button
                type="button"
                onClick={handleResetSession}
                className="block w-full border-b border-[#F0EEE8] py-3 text-left text-sm font-semibold text-red-600"
              >
                Sign out and reset session
              </button>
            )}
            {!isSignedIn && (
              <Link href="/auth?mode=login" onClick={() => setMenuOpen(false)} className="block text-sm font-semibold text-[#57534E] py-3">
                Sign in
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                router.push(appCtaPath);
              }}
              className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-[10px] bg-sky-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-sky-500/20"
            >
              {appCtaLabel}
            </button>
          </div>
        )}
      </header>

      {accountState === "stale" && (
        <div className="fixed left-0 right-0 top-16 z-40 border-y border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-amber-900">
              Your previous account session looks expired or deleted. Sign out to start fresh.
            </p>
            <button
              type="button"
              onClick={handleResetSession}
              className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[10px] bg-amber-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-amber-800"
            >
              <LogOut size={15} />
              Sign out and reset
            </button>
          </div>
        </div>
      )}
    </>
  );
}
