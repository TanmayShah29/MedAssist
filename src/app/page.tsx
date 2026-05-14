import Link from "next/link";
import type { ReactNode } from "react";
import {
  Shield, Upload, Brain, LineChart, CheckCircle2,
  Sparkles, Lock, Trash2, ArrowRight,
  TrendingUp, ClipboardList, AlertTriangle,
  Database, FileText, Layers3, Stethoscope, Zap
} from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";
import { StatsCounter } from "@/components/landing/stats-counter";

// ── Tiny helpers ─────────────────────────────────────────────────────────

function Pill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase ${className}`}>
      {children}
    </span>
  );
}

function HeroWorkspaceScene() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block">
      <div className="absolute left-[12%] top-[21%] h-36 w-64 rounded-[18px] border border-sky-100 bg-white/50 shadow-xl shadow-sky-900/5 backdrop-blur landing-float-slow" />
      <div className="absolute right-[11%] top-[19%] h-28 w-56 rounded-[18px] border border-emerald-100 bg-white/48 shadow-xl shadow-emerald-900/5 backdrop-blur landing-float" style={{ animationDelay: "600ms" }} />

      <div className="absolute left-[7%] top-[29%] w-56 rounded-[14px] border border-amber-100 bg-white/88 p-4 shadow-xl shadow-stone-900/5 backdrop-blur landing-float landing-card-pop">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-700">Monitor</p>
          <span className="h-2 w-2 rounded-full bg-amber-400 landing-dot-pulse" />
        </div>
        <p className="text-sm font-bold text-[#1C1917]">Glucose 106 mg/dL</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-amber-100">
          <div className="h-full rounded-full bg-amber-400 landing-meter-fill" />
        </div>
        <p className="mt-2 text-xs font-semibold text-amber-700">+15% from prior</p>
      </div>

      <div className="absolute right-[7%] top-[33%] w-60 rounded-[14px] border border-emerald-100 bg-white/88 p-4 shadow-xl shadow-stone-900/5 backdrop-blur landing-float-slow landing-card-pop" style={{ animationDelay: "180ms, 900ms" }}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">Ready</p>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </div>
        <p className="text-sm font-bold text-[#1C1917]">3 doctor questions drafted</p>
        <p className="mt-2 text-xs leading-relaxed text-[#57534E]">Bring a focused one-page brief to the appointment.</p>
      </div>

      <div className="absolute bottom-[27%] left-[23%] h-px w-[54%] origin-center bg-sky-300/70 landing-pulse-line" />
      <div className="absolute bottom-[26%] left-[23%] h-px w-[54%] origin-left bg-gradient-to-r from-transparent via-sky-500 to-transparent landing-data-trace" />
      <div className="absolute left-[18%] top-[58%] w-48 rounded-[14px] border border-violet-100 bg-white/84 p-3 shadow-xl shadow-stone-900/5 backdrop-blur landing-float-slow landing-card-pop" style={{ animationDelay: "300ms, 1400ms" }}>
        <div className="mb-2 flex items-center gap-2">
          <Brain className="h-4 w-4 text-violet-500" />
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-700">Analyzing</p>
        </div>
        <div className="space-y-1.5">
          <span className="block h-1.5 w-full rounded-full bg-violet-100 landing-shimmer" />
          <span className="block h-1.5 w-4/5 rounded-full bg-violet-100 landing-shimmer" style={{ animationDelay: "280ms" }} />
          <span className="block h-1.5 w-3/5 rounded-full bg-violet-100 landing-shimmer" style={{ animationDelay: "560ms" }} />
        </div>
      </div>
    </div>
  );
}

function MobileHeroPreview() {
  return (
    <div className="mt-8 rounded-[16px] border border-[#E8E6DF] bg-white/82 p-4 shadow-xl shadow-stone-900/5 lg:hidden landing-card-pop" style={{ animationDelay: "320ms" }}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-sky-700">Live preview</p>
        <Brain className="h-4 w-4 text-violet-500" />
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E8E6DF]">
        <div className="h-full rounded-full bg-sky-500 landing-progress" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[12px] bg-amber-50 p-3">
          <p className="text-[10px] font-bold uppercase text-amber-700">Monitor</p>
          <p className="mt-1 text-sm font-bold text-[#1C1917]">Glucose +15%</p>
        </div>
        <div className="rounded-[12px] bg-emerald-50 p-3">
          <p className="text-[10px] font-bold uppercase text-emerald-700">Ready</p>
          <p className="mt-1 text-sm font-bold text-[#1C1917]">3 questions</p>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-[#FAFAF7] font-sans">

      <LandingHeader />

      {/* ── HERO ── */}
      <section className="relative min-h-[100dvh] px-4 pb-16 pt-24 sm:px-6 sm:pt-28 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,#FCFCF9_0%,#FAFAF7_42%,#EAF8FF_100%)]" />
        <div className="absolute inset-0 opacity-[0.28] landing-grid-drift" />
        <div className="absolute left-0 right-0 top-16 h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent landing-pulse-line" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#FAFAF7] to-transparent" />
        <HeroWorkspaceScene />
        <div className="relative mx-auto flex min-h-[calc(100dvh-7rem)] w-full max-w-6xl flex-col justify-center">
          <div className="mx-auto max-w-3xl text-center">

            {/* Left: copy */}
            <div className="min-w-0 max-w-full">
              <Pill className="bg-white/86 border border-sky-200 text-sky-700 mb-6 shadow-sm landing-rise">
                <ClipboardList size={10} /> Appointment-ready lab insights
              </Pill>

              <h1 className="relative isolate font-display text-[42px] sm:text-6xl lg:text-[74px] text-[#1C1917] leading-[0.98] mb-6 max-w-full text-balance landing-rise" style={{ animationDelay: "60ms" }}>
                <span className="absolute left-1/2 top-1/2 -z-10 h-44 w-[min(42rem,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-300/20 blur-3xl landing-headline-glow" />
                Walk into your doctor visit prepared.
              </h1>

              <p className="text-[17px] sm:text-lg text-[#57534E] leading-relaxed mb-8 max-w-2xl mx-auto overflow-wrap-anywhere landing-rise" style={{ animationDelay: "110ms" }}>
                Upload your blood work PDF. MedAssist explains the numbers, spots what changed, and creates a printable one-page brief with the exact questions to ask your doctor.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-center landing-rise" style={{ animationDelay: "160ms" }}>
                <Link
                  href="/demo"
                  className="flex w-[calc(100vw-2rem)] max-w-full sm:w-auto items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-7 py-3.5 rounded-[12px] text-[15px] font-bold transition-all active:scale-95 shadow-lg shadow-sky-500/25"
                >
                  Try interactive demo
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href="/auth?mode=signup"
                  className="flex w-[calc(100vw-2rem)] max-w-full sm:w-auto items-center justify-center gap-2 text-[#1C1917] px-7 py-3.5 rounded-[12px] text-[15px] font-bold border-2 border-[#E8E6DF] hover:border-sky-300 hover:bg-sky-50/50 transition-all active:scale-95"
                >
                  Create free account
                </Link>
              </div>

              <p className="text-[12px] text-[#A8A29E] landing-rise" style={{ animationDelay: "210ms" }}>
                No login to try the demo · Free account · No credit card
              </p>

              {/* Patient-facing trust signals */}
              <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:gap-3 mt-6 justify-center landing-rise" style={{ animationDelay: "260ms" }}>
                {[
                  { icon: Lock, label: "HIPAA-Aligned" },
                  { icon: Trash2, label: "No Data Training" },
                  { icon: Shield, label: "AES-256 Encrypted" },
                  { icon: CheckCircle2, label: "Free to Start" },
                ].map(t => (
                  <span key={t.label} className="inline-flex w-[calc(100vw-2rem)] max-w-full sm:w-auto items-center gap-1.5 truncate text-[12px] font-semibold text-[#57534E] bg-white border border-[#E8E6DF] px-3 py-1.5 rounded-full shadow-sm landing-chip">
                    <t.icon className="h-3.5 w-3.5 text-sky-500" /> {t.label}
                  </span>
                ))}
              </div>
              <MobileHeroPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="py-10 border-y border-[#E8E6DF] bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <StatsCounter />
        </div>
      </section>

      {/* ── THE PROBLEM ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div
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
                  <div
                    key={i}
                    className="group relative overflow-hidden rounded-[16px] border border-red-100/80 bg-gradient-to-br from-white via-red-50/40 to-white p-4 shadow-sm landing-reveal landing-tilt-card"
                    style={{ animationDelay: `${i * 70}ms` }}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-300 to-transparent" />
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] border border-red-100 bg-white text-red-500 shadow-sm">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-400">Friction {i + 1}</p>
                        <p className="mt-1 text-[14px] text-[#57534E] leading-relaxed">{p}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
            >
              <Pill className="bg-emerald-50 border border-emerald-100 text-emerald-700 mb-6">With MedAssist</Pill>
              <h2 className="font-display text-4xl text-[#1C1917] mb-6">
                Instant clarity.
                <br />
                <span className="text-emerald-500">Plain English.</span>
              </h2>
              <div className="space-y-3">
                {[
                  "Every biomarker explained in language you can repeat back",
                  "AI-generated visit summaries tailored to your specific results",
                  "Know what's urgent, what's changed, and what can wait",
                  "Ready with the right questions when you see your doctor",
                ].map((p, i) => (
                  <div
                    key={i}
                    className="relative overflow-hidden rounded-[16px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/50 to-white p-4 shadow-sm landing-reveal landing-tilt-card"
                    style={{ animationDelay: `${i * 70}ms` }}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] border border-emerald-100 bg-white text-emerald-500 shadow-sm">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-500">Clarity {i + 1}</p>
                        <p className="mt-1 text-[14px] text-[#57534E] leading-relaxed">{p}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6 bg-white border-y border-[#E8E6DF]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Pill className="bg-sky-50 border border-sky-200 text-sky-700 mb-4">How it works</Pill>
            <h2 className="font-display text-4xl lg:text-5xl text-[#1C1917] mb-4">From PDF to appointment prep in 3 steps</h2>
            <p className="text-lg text-[#57534E] max-w-xl mx-auto">No setup. No medical jargon. Just upload and walk in prepared.</p>
          </div>

          <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-8 hidden h-px bg-gradient-to-r from-sky-200 via-violet-200 to-emerald-200 md:block">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent landing-flow-line" />
            </div>
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
                title: "AI finds what matters",
                desc: "Llama 3.3 via Groq extracts biomarkers, compares them to reference ranges, and spots changes worth discussing.",
                detail: "Takes 20 – 40 seconds",
                bg: "bg-violet-50",
                border: "border-violet-100",
              },
              {
                step: "03",
                icon: <LineChart className="w-6 h-6 text-emerald-500" />,
                title: "Bring the right questions",
                desc: "Your dashboard turns the results into an appointment prep sheet, trend review, and doctor-ready questions.",
                detail: "Printable in one click",
                bg: "bg-emerald-50",
                border: "border-emerald-100",
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`relative overflow-hidden bg-white border ${item.border} rounded-[20px] p-7 shadow-sm transition-shadow landing-reveal landing-tilt-card`}
                style={{ animationDelay: `${Number(item.step) * 90}ms` }}
              >
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent" />
                <div className={`relative z-10 w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-5 shadow-sm`}>
                  <span className="absolute inset-0 rounded-xl border border-current opacity-20 landing-ping" />
                  {item.icon}
                </div>
                <div className="absolute top-6 right-6 text-[11px] font-black text-[#D9D6CD] font-mono">{item.step}</div>
                <h3 className="text-[18px] font-bold text-[#1C1917] mb-3">{item.title}</h3>
                <p className="text-[14px] text-[#57534E] leading-relaxed mb-4">{item.desc}</p>
                <p className="text-[11px] font-bold text-[#A8A29E] uppercase tracking-wider">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Pill className="bg-[#F5F4EF] border border-[#E8E6DF] text-[#57534E] mb-4">Everything included</Pill>
            <h2 className="font-display text-4xl lg:text-5xl text-[#1C1917] mb-4">Your complete clinical dashboard</h2>
            <p className="text-lg text-[#57534E] max-w-xl mx-auto">One place for everything your health reports tell you.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            {[
              { icon: ClipboardList, color: "text-sky-500", bg: "bg-sky-50", title: "Doctor Visit Prep", desc: "A printable one-page brief with key results, notable changes, and appointment questions.", span: "md:col-span-4 md:row-span-2", visual: "brief" },
              { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50", title: "Trend Tracking", desc: "Charts and comparisons showing how your values change with each upload.", span: "md:col-span-2", visual: "chart" },
              { icon: Brain, color: "text-violet-500", bg: "bg-violet-50", title: "AI Explanations", desc: "Every biomarker explained in plain English. No medical degree required.", span: "md:col-span-2", visual: "pulse" },
              { icon: Sparkles, color: "text-amber-500", bg: "bg-amber-50", title: "Streaming Prep Assistant", desc: "Ask follow-up questions and see context-aware answers appear as the AI thinks.", span: "md:col-span-2", visual: "stream" },
              { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", title: "Doctor Questions", desc: "AI-generated questions tailored to your results, ready to bring to your next appointment.", span: "md:col-span-2", visual: "checks" },
              { icon: Shield, color: "text-indigo-500", bg: "bg-indigo-50", title: "Health Memory", desc: "Recent conversations and uploaded reports stay in context so answers get more personal over time.", span: "md:col-span-2", visual: "memory" },
            ].map((f, i) => (
              <div
                key={f.title}
                className={`group relative min-h-[220px] overflow-hidden rounded-[20px] border border-[#E8E6DF] bg-white p-6 shadow-sm transition-all hover:border-sky-200 landing-reveal landing-tilt-card ${f.span}`}
                style={{ animationDelay: `${i * 65}ms` }}
              >
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent" />
                <div className="absolute bottom-0 right-0 h-28 w-28 translate-x-8 translate-y-8 rounded-full bg-sky-100/60 blur-2xl transition-transform group-hover:scale-125" />
                <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-[16px] font-bold text-[#1C1917] mb-2">{f.title}</h3>
                <p className="text-[13px] text-[#57534E] leading-relaxed">{f.desc}</p>
                <div className="mt-6 grid gap-2">
                  {f.visual === "brief" && (
                    <div className="grid grid-cols-[1fr_0.7fr] gap-3">
                      <span className="h-2 rounded-full bg-sky-100 landing-shimmer" />
                      <span className="h-2 rounded-full bg-emerald-100 landing-shimmer" style={{ animationDelay: "220ms" }} />
                      <span className="h-2 rounded-full bg-violet-100 landing-shimmer" style={{ animationDelay: "440ms" }} />
                      <span className="h-2 rounded-full bg-amber-100 landing-shimmer" style={{ animationDelay: "660ms" }} />
                    </div>
                  )}
                  {f.visual !== "brief" && [0, 1, 2].map((bar) => (
                    <span
                      key={bar}
                      className={`h-1.5 rounded-full ${f.bg} landing-shimmer`}
                      style={{ width: `${92 - bar * 18}%`, animationDelay: `${bar * 180}ms` }}
                    />
                  ))}
                </div>
              </div>
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
              <div
                className="absolute bg-slate-800/90 border border-white/10 p-5 rounded-2xl shadow-2xl max-w-xs w-full -top-4 right-0 landing-float"
              >
                <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mb-2">CORRELATION DETECTED</p>
                <p className="text-sm font-medium text-slate-200 leading-relaxed landing-typewriter">Vitamin D ↑ 133% after starting D3 supplement on Feb 12. Fatigue symptoms resolved 6 days later.</p>
              </div>

              <div
                className="absolute bg-slate-800/90 border border-white/10 p-5 rounded-2xl shadow-2xl max-w-xs w-full bottom-4 left-0 landing-float-slow"
              >
                <p className="text-[9px] text-amber-400 font-black uppercase tracking-widest mb-2">TREND ALERT</p>
                <p className="text-sm font-medium text-slate-200 leading-relaxed landing-typewriter" style={{ animationDelay: "900ms" }}>Glucose has increased 15% across 3 consecutive reports. Pre-diabetic range approaching — dietary review recommended.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TECHNICAL PIPELINE ── */}
      <section className="py-24 px-6 bg-[#FAFAF7]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Pill className="bg-[#F5F4EF] border border-[#E8E6DF] text-[#57534E] mb-4">Technical Architecture</Pill>
            <h2 className="font-display text-4xl lg:text-5xl text-[#1C1917] mb-4">Appointment-ready AI pipeline</h2>
            <p className="text-lg text-[#57534E] max-w-2xl mx-auto">Multi-stage processing that extracts, structures, and turns lab data into a visit-ready brief.</p>
          </div>

          <div className="relative overflow-hidden rounded-[24px] border border-[#E8E6DF] bg-white p-4 shadow-sm md:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.08),transparent_26rem),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.07),transparent_24rem)]" />
            <div className="relative grid grid-cols-1 gap-4 md:grid-cols-5">
              <div className="pointer-events-none absolute left-[9%] right-[9%] top-9 hidden h-px bg-gradient-to-r from-sky-200 via-violet-200 via-emerald-200 to-rose-200 md:block">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent landing-flow-line" />
              </div>
            {[
              { step: "01", title: "PDF Upload", tech: "Next.js 16", desc: "Secure binary file handler for digital lab reports.", color: "text-sky-500", dot: "bg-sky-500", Icon: Upload },
              { step: "02", title: "Report Parsing", tech: "pdf-parse", desc: "Native text extraction with the existing scanned-report fallback when needed.", color: "text-violet-500", dot: "bg-violet-500", Icon: FileText },
              { step: "03", title: "Visit Brief", tech: "Llama 3.3", desc: "Structured clinical schema generation with doctor questions and a concise summary.", color: "text-emerald-500", dot: "bg-emerald-500", Icon: Brain },
              { step: "04", title: "Persistence", tech: "Supabase", desc: "Encrypted storage with row-level security. Only you can read your data.", color: "text-amber-500", dot: "bg-amber-500", Icon: Database },
              { step: "05", title: "Visualisation", tech: "Recharts", desc: "Longitudinal trends, category balance charts, and readiness score ring.", color: "text-rose-500", dot: "bg-rose-500", Icon: LineChart },
            ].map((item, i) => (
              <div key={item.step} className="relative rounded-[18px] border border-[#E8E6DF] bg-white/82 p-5 shadow-sm backdrop-blur landing-reveal landing-tilt-card" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className={`relative flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#F5F4EF] ${item.color}`}>
                    <span className={`absolute inset-0 rounded-[12px] ${item.dot} opacity-10 landing-ping`} />
                    <item.Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-[10px] font-black ${item.color} tracking-widest`}>{item.step}</span>
                </div>
                <h3 className="text-[15px] font-bold text-[#1C1917] mb-1.5">{item.title}</h3>
                <span className="inline-block text-[10px] font-mono text-[#57534E] bg-[#F5F4EF] border border-[#E8E6DF] px-2 py-0.5 rounded mb-3">{item.tech}</span>
                <p className="text-[12px] text-[#57534E] leading-relaxed">{item.desc}</p>
              </div>
            ))}
            </div>
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

          <div className="relative grid grid-cols-1 gap-5 text-left sm:grid-cols-3">
            <div className="pointer-events-none absolute left-[15%] right-[15%] top-8 hidden h-px bg-gradient-to-r from-sky-200 via-violet-200 to-emerald-200 sm:block">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500 to-transparent landing-flow-line" />
            </div>
            {[
              { n: "1st Report", color: "bg-sky-100 text-sky-600", title: "Clinical Baseline", desc: "Establish your starting point. Immediately flag what needs attention.", Icon: Stethoscope },
              { n: "2nd Report", color: "bg-violet-100 text-violet-600", title: "Trend Correlation", desc: "See if supplements or lifestyle changes are moving your markers.", Icon: Layers3 },
              { n: "3rd Report +", color: "bg-emerald-100 text-emerald-700", title: "True Health IQ", desc: "Understand patterns, predict outcomes, and track progress with confidence.", Icon: Zap },
            ].map((s, i) => (
              <div
                key={s.n}
                className="relative overflow-hidden rounded-[20px] border border-[#E8E6DF] bg-white p-7 shadow-sm transition-shadow landing-reveal landing-tilt-card"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent" />
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-[16px] ${s.color}`}>
                  <s.Icon className="h-6 w-6" />
                </div>
                <div className={`mb-4 inline-block text-[11px] font-black px-3 py-1 rounded-full ${s.color} uppercase tracking-wider`}>{s.n}</div>
                <h3 className="text-[17px] font-bold text-[#1C1917] mb-3">{s.title}</h3>
                <p className="text-[13px] text-[#57534E] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DISCLAIMER ── */}
      <section className="px-6 py-14 bg-[#FFFBEB] border-y border-amber-100">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-6 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Pill className="bg-white/75 border border-amber-200 text-amber-700 mb-4">Clinical guardrail</Pill>
            <h3 className="font-display text-3xl text-[#1C1917]">Use it to prepare, not self-diagnose.</h3>
          </div>
          <div className="relative overflow-hidden rounded-[20px] border border-amber-200 bg-white/78 p-7 shadow-sm">
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
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
        <div className="absolute inset-0 landing-cta-aurora pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <Pill className="bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-6">Get started today</Pill>
          <h2 className="font-display text-4xl lg:text-5xl text-white mb-6">Ready for your next appointment?</h2>
          <p className="text-lg text-slate-400 mb-10 leading-relaxed">
            Upload your first lab report and get a plain-English summary, trend context, and doctor-ready questions in under a minute. Free to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/demo"
              className="relative flex items-center justify-center gap-2 overflow-hidden bg-sky-500 hover:bg-sky-400 text-white px-8 py-3.5 rounded-[12px] text-[15px] font-bold transition-all active:scale-95 shadow-lg shadow-sky-500/25 landing-cta-button"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent landing-button-shine" />
              <span className="relative">Try interactive demo</span>
              <ArrowRight className="relative" size={15} />
            </Link>
            <Link
              href="/auth?mode=signup"
              className="flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white px-8 py-3.5 rounded-[12px] text-[15px] font-bold transition-all hover:bg-white/5"
            >
              Create free account
            </Link>
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
                AI-powered appointment prep that transforms lab reports into plain-English summaries, trend context, and doctor-ready questions.
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
                  { label: "Lab Details", href: "/results" },
                  { label: "Prep Assistant", href: "/assistant" },
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
