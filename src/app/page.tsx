"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { createBrowserClient } from '@supabase/ssr';
import {
  Shield, Upload, Brain, LineChart, CheckCircle2,
  Sparkles, Lock, Trash2, ArrowRight, Activity,
  TrendingUp, TrendingDown, Minus, ChevronRight
} from "lucide-react";

// ── Tiny helpers ─────────────────────────────────────────────────────────

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase ${className}`}>
      {children}
    </span>
  );
}

// ── Hero mock card (static, no deps) ─────────────────────────────────────

function HeroMockCard() {
  const biomarkers = [
    { name: "Vitamin D", val: 42, unit: "ng/mL", status: "optimal", prev: 18, pct: 133 },
    { name: "Glucose", val: 106, unit: "mg/dL", status: "warning", prev: 92, pct: 15 },
    { name: "Hemoglobin", val: 11.8, unit: "g/dL", status: "warning", prev: 13.5, pct: -13 },
    { name: "TSH", val: 2.4, unit: "uIU/mL", status: "optimal", prev: null, pct: 0 },
    { name: "CRP", val: 1.2, unit: "mg/L", status: "optimal", prev: null, pct: 0 },
    { name: "LDL", val: 145, unit: "mg/dL", status: "warning", prev: null, pct: 0 },
  ];

  const statusStyle = (s: string) => ({
    optimal: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    critical: "bg-red-50 text-red-700 border border-red-200",
  }[s] ?? "bg-emerald-50 text-emerald-700 border border-emerald-200");

  const dotColor = (s: string) => ({ optimal: "bg-emerald-500", warning: "bg-amber-500", critical: "bg-red-500" }[s] ?? "bg-emerald-500");

  const r = 42; const circ = 2 * Math.PI * r;
  const dash = (82 / 100) * circ;

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Glow blobs */}
      <div className="absolute -top-16 -right-12 w-56 h-56 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-white rounded-[24px] shadow-2xl shadow-slate-900/10 border border-[#E8E6DF] overflow-hidden"
      >
        {/* Card header */}
        <div className="px-5 pt-5 pb-4 border-b border-[#F0EEE8] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest">Clinical Overview</p>
            <p className="text-[13px] font-bold text-[#1C1917] mt-0.5">Tanmay Shah · Demo Data</p>
          </div>
          {/* Score ring */}
          <div className="relative" style={{ width: 68, height: 68 }}>
            <svg width={68} height={68} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={34} cy={34} r={r} fill="none" stroke="#E8E6DF" strokeWidth={7} />
              <circle cx={34} cy={34} r={r} fill="none" stroke="#10B981" strokeWidth={7}
                strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[17px] font-extrabold text-[#1C1917] leading-none">82</span>
              <span className="text-[8px] font-bold text-emerald-600">GOOD</span>
            </div>
          </div>
        </div>

        {/* Biomarker list */}
        <div className="divide-y divide-[#F5F4EF]">
          {biomarkers.map((b, i) => (
            <motion.div
              key={b.name}
              initial={{ x: 12, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.07, duration: 0.4, ease: "easeOut" }}
              className="flex items-center gap-3 px-5 py-2.5"
            >
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor(b.status)}`} />
              <span className="text-[13px] font-semibold text-[#1C1917] flex-1 truncate">{b.name}</span>
              <span className="text-[12px] text-[#57534E] font-mono">{b.val} <span className="text-[10px] text-[#A8A29E]">{b.unit}</span></span>
              {b.prev !== null && b.pct !== 0 ? (
                <span className={`text-[10px] font-bold flex items-center gap-0.5 ${b.pct > 0 && b.status === "optimal" ? "text-emerald-600" : b.pct < 0 && b.status === "warning" ? "text-amber-600" : b.pct > 0 ? "text-red-500" : "text-emerald-600"}`}>
                  {b.pct > 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                  {Math.abs(b.pct)}%
                </span>
              ) : (
                <span className="text-[10px] text-[#D9D6CD]"><Minus size={9} /></span>
              )}
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${statusStyle(b.status)}`}>
                {b.status === "optimal" ? "OK" : "MON"}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Card footer */}
        <div className="px-5 py-3 bg-[#FAFAF7] border-t border-[#F0EEE8] flex items-center justify-between">
          <span className="text-[11px] text-[#A8A29E]">Last updated Oct 24, 2024</span>
          <span className="text-[11px] font-semibold text-sky-500 flex items-center gap-1">
            Ask AI <ChevronRight size={10} />
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const featuresRef = useRef(null);
  const isFeaturesInView = useInView(featuresRef, { once: true, margin: "-80px" });

  // Create the browser client once and keep a stable reference across renders.
  // Using useRef prevents a new SDK instance (and potential duplicate listeners)
  // from being created on every state change / scroll event.
  const supabaseRef = useRef(
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  useEffect(() => {
    supabaseRef.current.auth.getUser().then(({ data: { user } }) => setIsSignedIn(!!user));
  }, []); // Safe: supabaseRef.current is stable for the component lifetime

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  return (
    <div className="min-h-[100dvh] bg-[#FAFAF7] font-sans">

      {/* ── HEADER ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#FAFAF7]/90 backdrop-blur-md border-b border-[#E8E6DF] shadow-sm shadow-slate-900/[0.04]" : "bg-transparent"}`}>
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
            {!isSignedIn && (
              <Link href="/auth?mode=login" className="hidden sm:block text-sm font-semibold text-[#57534E] hover:text-[#1C1917] px-4 py-2 transition-colors">
                Sign in
              </Link>
            )}
            <button
              onClick={() => router.push(isSignedIn ? "/dashboard" : "/auth?mode=signup")}
              className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-[10px] text-sm font-bold transition-all active:scale-95 shadow-md shadow-sky-500/20"
            >
              {isSignedIn ? "Dashboard" : "Get started"}
            </button>
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg hover:bg-[#F5F4EF] transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            >
              <span className={`block w-5 h-0.5 bg-[#57534E] transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-[#57534E] transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-[#57534E] transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#FAFAF7]/95 backdrop-blur-xl border-t border-[#E8E6DF] px-6 py-4 space-y-1">
            <Link href="#how-it-works" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-[#57534E] py-3 border-b border-[#F0EEE8]">How it works</Link>
            <Link href="#features" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-[#57534E] py-3 border-b border-[#F0EEE8]">Features</Link>
            <Link href="#security" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-[#57534E] py-3 border-b border-[#F0EEE8]">Security</Link>
            <Link href="/demo" onClick={() => setMenuOpen(false)} className="block text-sm font-semibold text-sky-600 py-3 border-b border-[#F0EEE8]">Live Demo</Link>
            {!isSignedIn && (
              <Link href="/auth?mode=login" onClick={() => setMenuOpen(false)} className="block text-sm font-semibold text-[#57534E] py-3">
                Sign in
              </Link>
            )}
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left: copy */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Pill className="bg-sky-50 border border-sky-200 text-sky-700 mb-6">
                <Sparkles size={10} /> AI-powered health intelligence
              </Pill>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-[64px] text-[#1C1917] leading-[1.04] mb-6">
                Your lab results,{" "}
                <span className="text-sky-500 relative">
                  finally explained.
                  <svg className="absolute -bottom-1 left-0 w-full" height="4" viewBox="0 0 200 4" preserveAspectRatio="none">
                    <path d="M0 2 Q50 0 100 2 Q150 4 200 2" stroke="#0EA5E9" strokeWidth="2.5" fill="none" opacity="0.4" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              <p className="text-lg text-[#57534E] leading-relaxed mb-8 max-w-lg">
                Upload your blood work PDF. Get plain-language explanations of every number, spot trends across reports, and know exactly what to ask your doctor.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link
                  href="/demo"
                  className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-7 py-3.5 rounded-[12px] text-[15px] font-bold transition-all active:scale-95 shadow-lg shadow-sky-500/25"
                >
                  Try interactive demo
                  <ArrowRight size={15} />
                </Link>
                <button
                  onClick={() => router.push(isSignedIn ? "/dashboard" : "/auth?mode=signup")}
                  className="flex items-center justify-center gap-2 text-[#1C1917] px-7 py-3.5 rounded-[12px] text-[15px] font-bold border-2 border-[#E8E6DF] hover:border-sky-300 hover:bg-sky-50/50 transition-all active:scale-95"
                >
                  {isSignedIn ? "Go to dashboard" : "Create free account"}
                </button>
              </div>

              <p className="text-[12px] text-[#A8A29E]">
                No login to try the demo · Free account · No credit card
              </p>

              {/* Patient-facing trust signals */}
              <div className="flex flex-wrap gap-3 mt-8">
                {[
                  { icon: "🔒", label: "HIPAA-Aligned" },
                  { icon: "🚫", label: "No Data Training" },
                  { icon: "🛡️", label: "AES-256 Encrypted" },
                  { icon: "✅", label: "Free to Start" },
                ].map(t => (
                  <span key={t.label} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#57534E] bg-white border border-[#E8E6DF] px-3 py-1.5 rounded-full shadow-sm">
                    <span>{t.icon}</span> {t.label}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right: hero mock */}
            <div className="flex justify-center lg:justify-end">
              <HeroMockCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="py-10 border-y border-[#E8E6DF] bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "35+", label: "Biomarkers tracked", color: "text-sky-500" },
              { number: "20s", label: "Analysis time", color: "text-emerald-500" },
              { number: "100%", label: "Private & encrypted", color: "text-violet-500" },
              { number: "0", label: "Cost to start", color: "text-amber-500" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="text-center"
              >
                <div className={`font-display text-4xl font-bold ${s.color} mb-1`}>{s.number}</div>
                <div className="text-[12px] font-medium text-[#A8A29E] uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Pill className="bg-red-50 border border-red-100 text-red-600 mb-6">Without MedAssist</Pill>
              <h2 className="font-display text-4xl text-[#1C1917] mb-6">
                You get your results back.
                <br />
                <span className="text-[#A8A29E]">Now what?</span>
              </h2>
              <div className="space-y-3">
                {[
                  "Numbers that mean nothing without a medical degree",
                  "Google searches that spiral into worst-case scenarios",
                  "Days of waiting to speak to a doctor",
                  "No idea what to ask, or what's actually urgent",
                ].map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 p-4 bg-white border border-[#E8E6DF] rounded-xl shadow-sm"
                  >
                    <div className="w-5 h-5 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    </div>
                    <p className="text-[14px] text-[#57534E] leading-relaxed">{p}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Pill className="bg-emerald-50 border border-emerald-100 text-emerald-700 mb-6">With MedAssist</Pill>
              <h2 className="font-display text-4xl text-[#1C1917] mb-6">
                Instant clarity.
                <br />
                <span className="text-emerald-500">Plain English.</span>
              </h2>
              <div className="space-y-3">
                {[
                  "Every biomarker explained in language you actually understand",
                  "AI-generated insights tailored to your specific results",
                  "Know what's urgent and what's fine before leaving the lab",
                  "Ready with the right questions when you see your doctor",
                ].map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 p-4 bg-white border border-emerald-100 rounded-xl shadow-sm"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[14px] text-[#57534E] leading-relaxed">{p}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6 bg-white border-y border-[#E8E6DF]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Pill className="bg-sky-50 border border-sky-200 text-sky-700 mb-4">How it works</Pill>
            <h2 className="font-display text-4xl lg:text-5xl text-[#1C1917] mb-4">From PDF to insights in 3 steps</h2>
            <p className="text-lg text-[#57534E] max-w-xl mx-auto">No setup. No medical jargon. Just upload and understand.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <Upload className="w-6 h-6 text-sky-500" />,
                title: "Upload your report",
                desc: "Drag and drop any digital PDF lab report. Works with reports from any lab or hospital.",
                detail: "Takes about 5 seconds",
                bg: "bg-sky-50",
                border: "border-sky-100",
              },
              {
                step: "02",
                icon: <Brain className="w-6 h-6 text-violet-500" />,
                title: "AI reads every value",
                desc: "Llama 3.3 via Groq extracts every biomarker, compares them to clinical ranges, and generates plain-English interpretations.",
                detail: "Takes 20 – 40 seconds",
                bg: "bg-violet-50",
                border: "border-violet-100",
              },
              {
                step: "03",
                icon: <LineChart className="w-6 h-6 text-emerald-500" />,
                title: "Understand your health",
                desc: "Your dashboard shows your health score, what needs attention, trend charts, and questions to ask your doctor.",
                detail: "Updated with every report",
                bg: "bg-emerald-50",
                border: "border-emerald-100",
              },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`relative bg-white border ${item.border} rounded-[20px] p-7 shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-5`}>
                  {item.icon}
                </div>
                <div className="absolute top-6 right-6 text-[11px] font-black text-[#D9D6CD] font-mono">{item.step}</div>
                <h3 className="text-[18px] font-bold text-[#1C1917] mb-3">{item.title}</h3>
                <p className="text-[14px] text-[#57534E] leading-relaxed mb-4">{item.desc}</p>
                <p className="text-[11px] font-bold text-[#A8A29E] uppercase tracking-wider">{item.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6" ref={featuresRef}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Pill className="bg-[#F5F4EF] border border-[#E8E6DF] text-[#57534E] mb-4">Everything included</Pill>
            <h2 className="font-display text-4xl lg:text-5xl text-[#1C1917] mb-4">Your complete clinical dashboard</h2>
            <p className="text-lg text-[#57534E] max-w-xl mx-auto">One place for everything your health reports tell you.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Activity, color: "text-sky-500", bg: "bg-sky-50", title: "Health Score", desc: "A single 0–100 score based on every biomarker, with a breakdown by clinical category." },
              { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50", title: "Trend Tracking", desc: "Charts showing how your values change with each upload — see if you're improving." },
              { icon: Brain, color: "text-violet-500", bg: "bg-violet-50", title: "AI Explanations", desc: "Every biomarker explained in plain English. No medical degree required." },
              { icon: Sparkles, color: "text-amber-500", bg: "bg-amber-50", title: "AI Assistant", desc: "Ask follow-up questions about your results and get intelligent, context-aware answers." },
              { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", title: "Doctor Questions", desc: "AI-generated questions tailored to your results, ready to bring to your next appointment." },
              { icon: Shield, color: "text-indigo-500", bg: "bg-indigo-50", title: "Supplement Tracking", desc: "Log supplements and see how they correlate with biomarker changes over time." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.07, duration: 0.45 }}
                className="bg-white border border-[#E8E6DF] rounded-[18px] p-6 shadow-sm hover:shadow-md hover:border-sky-200 transition-all group"
              >
                <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-[16px] font-bold text-[#1C1917] mb-2">{f.title}</h3>
                <p className="text-[13px] text-[#57534E] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTELLIGENCE SECTION ── */}
      <section className="py-24 px-6 bg-[#0F172A] text-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Pill className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6">
                Next-gen clinical intelligence
              </Pill>
              <h2 className="font-display text-4xl lg:text-5xl text-white leading-tight mb-6">
                Beyond results.
                <br />
                <span className="text-indigo-400">Real correlations.</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-10">
                MedAssist connects your supplements, symptoms, and lab results over time — so you can see exactly what&apos;s working and what needs attention.
              </p>

              <div className="space-y-6">
                {[
                  { tag: "LIVE", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", dot: "bg-emerald-500", title: "Supplement Correlation", desc: "Log your intake and watch biomarker charts update with start-date markers. See exactly what changed after you began a new protocol." },
                  { tag: "Q2 2026", color: "text-sky-400 border-sky-500/30 bg-sky-500/10", dot: "bg-sky-500/40", title: "Health Timeline", desc: "A unified medical diary connecting symptoms, lifestyle choices, and lab results into one longitudinal view." },
                  { tag: "Q3 2026", color: "text-violet-400 border-violet-500/30 bg-violet-500/10", dot: "bg-violet-500/40", title: "Wearable Sync", desc: "Connect Apple Health or Oura Ring to see how sleep and activity affect your bloodwork." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`w-0.5 rounded-full flex-shrink-0 self-stretch ${item.dot}`} />
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="font-bold text-slate-200">{item.title}</h4>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border tracking-wider ${item.color}`}>{item.tag}</span>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating cards */}
            <div className="relative h-80 lg:h-full flex items-center justify-center">
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                className="absolute bg-slate-800/90 border border-white/10 p-5 rounded-2xl shadow-2xl max-w-xs w-full -top-4 right-0"
              >
                <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mb-2">CORRELATION DETECTED</p>
                <p className="text-sm font-medium text-slate-200 leading-relaxed">Vitamin D ↑ 133% after starting D3 supplement on Feb 12. Fatigue symptoms resolved 6 days later.</p>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="absolute bg-slate-800/90 border border-white/10 p-5 rounded-2xl shadow-2xl max-w-xs w-full bottom-4 left-0"
              >
                <p className="text-[9px] text-amber-400 font-black uppercase tracking-widest mb-2">TREND ALERT</p>
                <p className="text-sm font-medium text-slate-200 leading-relaxed">Glucose has increased 15% across 3 consecutive reports. Pre-diabetic range approaching — dietary review recommended.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TECHNICAL PIPELINE ── */}
      <section className="py-24 px-6 bg-[#FAFAF7]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Pill className="bg-[#F5F4EF] border border-[#E8E6DF] text-[#57534E] mb-4">Technical Architecture</Pill>
            <h2 className="font-display text-4xl lg:text-5xl text-[#1C1917] mb-4">Clinical-grade AI pipeline</h2>
            <p className="text-lg text-[#57534E] max-w-2xl mx-auto">Multi-stage processing that extracts, interprets, and structures your lab data with high accuracy.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 border border-[#E8E6DF] rounded-[20px] overflow-hidden bg-white shadow-sm">
            {[
              { step: "01", title: "PDF Upload", tech: "Next.js 16", desc: "Secure binary file handler for digital lab reports.", color: "text-sky-500", dot: "bg-sky-500" },
              { step: "02", title: "Text Extraction", tech: "pdf-parse", desc: "Native extraction with OCR.space fallback for scanned reports.", color: "text-violet-500", dot: "bg-violet-500" },
              { step: "03", title: "AI Analysis", tech: "Llama 3.3", desc: "Structured clinical schema generation with plain-English insights.", color: "text-emerald-500", dot: "bg-emerald-500" },
              { step: "04", title: "Persistence", tech: "Supabase", desc: "Encrypted storage with row-level security. Only you can read your data.", color: "text-amber-500", dot: "bg-amber-500" },
              { step: "05", title: "Visualisation", tech: "Recharts", desc: "Longitudinal trends, category balance charts, and health score ring.", color: "text-rose-500", dot: "bg-rose-500" },
            ].map((item, i) => (
              <div key={item.step} className={`p-6 ${i < 4 ? "border-b md:border-b-0 md:border-r border-[#E8E6DF]" : ""}`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                  <span className={`text-[10px] font-black ${item.color} tracking-widest`}>{item.step}</span>
                </div>
                <h3 className="text-[15px] font-bold text-[#1C1917] mb-1.5">{item.title}</h3>
                <span className="inline-block text-[10px] font-mono text-[#57534E] bg-[#F5F4EF] border border-[#E8E6DF] px-2 py-0.5 rounded mb-3">{item.tech}</span>
                <p className="text-[12px] text-[#57534E] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {["Supabase", "Next.js 16", "TypeScript", "Tailwind CSS 4", "Groq AI", "Framer Motion"].map(tech => (
              <span key={tech} className="text-[11px] font-mono text-[#A8A29E] bg-white border border-[#E8E6DF] px-3 py-1.5 rounded-full">{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section id="security" className="py-24 px-6 bg-white border-y border-[#E8E6DF]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Pill className="bg-emerald-50 border border-emerald-100 text-emerald-700 mb-6">Privacy & Security</Pill>
              <h2 className="font-display text-4xl lg:text-5xl text-[#1C1917] mb-6">
                Your health data is
                <br />
                <span className="text-emerald-500">yours alone.</span>
              </h2>
              <p className="text-[#57534E] text-lg mb-10 leading-relaxed">
                We built MedAssist with the assumption that health data is the most sensitive data there is. Every decision reflects that.
              </p>

              <div className="space-y-7">
                {[
                  { Icon: Brain, color: "text-emerald-500 bg-emerald-50", title: "Zero-retention AI", desc: "Lab reports are processed in memory and immediately discarded. Your data never trains a model." },
                  { Icon: Lock, color: "text-sky-500 bg-sky-50", title: "AES-256 Encryption", desc: "All stored data is encrypted at rest with enterprise-grade keys. Row-level security means only you can query your records." },
                  { Icon: Trash2, color: "text-red-500 bg-red-50", title: "Delete anytime", desc: "One click permanently wipes your entire history — reports, biomarkers, AI conversations — from active servers and backups." },
                ].map(({ Icon, color, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className={`w-11 h-11 rounded-xl ${color.split(" ")[1]} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${color.split(" ")[0]}`} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-[#1C1917] mb-1">{title}</h4>
                      <p className="text-[13px] text-[#57534E] leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security visual */}
            <div className="relative">
              <div className="bg-[#0F172A] rounded-[24px] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Security Checklist</p>
                  {[
                    { label: "PDF processed in memory only", done: true },
                    { label: "No data used for model training", done: true },
                    { label: "AES-256 database encryption", done: true },
                    { label: "Row-level security (RLS) enabled", done: true },
                    { label: "HIPAA-aligned data practices", done: true },
                    { label: "Permanent deletion on request", done: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={11} className="text-emerald-400" />
                      </div>
                      <span className="text-[13px] text-slate-300">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Pill className="bg-sky-50 border border-sky-200 text-sky-700 mb-6">Track over time</Pill>
          <h2 className="font-display text-4xl lg:text-5xl text-[#1C1917] mb-5">Consistency builds clarity</h2>
          <p className="text-lg text-[#57534E] max-w-xl mx-auto mb-14 leading-relaxed">
            One report tells you where you are. A timeline tells you where you&apos;re going.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { n: "1st Report", color: "bg-sky-100 text-sky-600", title: "Clinical Baseline", desc: "Establish your starting point. Immediately flag what needs attention." },
              { n: "2nd Report", color: "bg-violet-100 text-violet-600", title: "Trend Correlation", desc: "See if supplements or lifestyle changes are moving your markers." },
              { n: "3rd Report +", color: "bg-emerald-100 text-emerald-700", title: "True Health IQ", desc: "Understand patterns, predict outcomes, and track progress with confidence." },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-[#E8E6DF] rounded-[20px] p-7 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`inline-block text-[11px] font-black px-3 py-1 rounded-full ${s.color} mb-5 uppercase tracking-wider`}>{s.n}</div>
                <h3 className="text-[17px] font-bold text-[#1C1917] mb-3">{s.title}</h3>
                <p className="text-[13px] text-[#57534E] leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DISCLAIMER ── */}
      <section className="py-16 px-6 bg-[#FFFBEB] border-y border-amber-100">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-[20px] border border-amber-100 p-8 shadow-sm">
            <h3 className="text-[15px] font-bold text-[#1C1917] mb-4">Medical Disclaimer</h3>
            <div className="space-y-3 text-[13px] text-[#57534E] leading-relaxed">
              <p><strong className="text-[#1C1917]">Not a doctor.</strong> MedAssist is a clinical education tool, not a diagnostic platform.</p>
              <p><strong className="text-[#1C1917]">No medical advice.</strong> We do not provide treatment plans, prescriptions, or clinical guidance.</p>
              <p><strong className="text-[#1C1917]">Always consult a professional.</strong> Use MedAssist to have better conversations with your qualified healthcare provider, not to replace them.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 px-6 bg-[#0F172A] text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <Pill className="bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-6">Get started today</Pill>
          <h2 className="font-display text-4xl lg:text-5xl text-white mb-6">Ready to understand your health?</h2>
          <p className="text-lg text-slate-400 mb-10 leading-relaxed">
            Upload your first lab report and get your health score, plain-English explanations, and personalized insights in under a minute. Free to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/demo"
              className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-8 py-3.5 rounded-[12px] text-[15px] font-bold transition-all active:scale-95 shadow-lg shadow-sky-500/25"
            >
              Try interactive demo
              <ArrowRight size={15} />
            </Link>
            <button
              onClick={() => router.push(isSignedIn ? "/dashboard" : "/auth?mode=signup")}
              className="flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white px-8 py-3.5 rounded-[12px] text-[15px] font-bold transition-all hover:bg-white/5"
            >
              {isSignedIn ? "Go to dashboard" : "Create free account"}
            </button>
          </div>
          <p className="text-[12px] text-slate-600 mt-6">No login required for the demo · No credit card to sign up</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0F172A] border-t border-white/5 pt-16 pb-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-[10px] bg-sky-500 flex items-center justify-center">
                  <Shield size={15} className="text-white" />
                </div>
                <span className="font-display text-[22px] text-white">MedAssist</span>
              </div>
              <p className="text-[13px] text-slate-500 leading-relaxed max-w-xs">
                AI-powered clinical intelligence that transforms your lab reports into plain-English health insights. Built for people, not doctors.
              </p>
              <div className="flex gap-3 mt-6 flex-wrap">
                {["HIPAA-Aligned", "AES-256", "No Data Training"].map(t => (
                  <span key={t} className="text-[10px] font-semibold text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">{t}</span>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Product</p>
              <ul className="space-y-3">
                {[
                  { label: "Interactive Demo", href: "/demo" },
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Lab Results", href: "/results" },
                  { label: "AI Assistant", href: "/assistant" },
                ].map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-[13px] text-slate-400 hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Legal</p>
              <ul className="space-y-3">
                {[
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Sign in", href: "/auth?mode=login" },
                  { label: "Create account", href: "/auth?mode=signup" },
                ].map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-[13px] text-slate-400 hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
            <p className="text-[12px] text-slate-600">
              © 2026 MedAssist · Built by <span className="text-slate-400 font-semibold">Tanmay Shah</span> · Design Engineering Submission
            </p>
            <p className="text-[11px] text-slate-700">
              AI-generated insights · Educational purposes only · Always consult a qualified physician
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
