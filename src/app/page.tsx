import Link from "next/link";
import type { ReactNode } from "react";
import {
  Shield, Upload, Brain, LineChart, CheckCircle2,
  Sparkles, Lock, Trash2, ArrowRight,
  TrendingUp, ClipboardList,
} from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";
import { StatsCounter } from "@/components/landing/stats-counter";
import { BrandLockup } from "@/components/branding/brand-lockup";

// ── Tiny helpers ─────────────────────────────────────────────────────────

function Pill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase ${className}`}>
      {children}
    </span>
  );
}

// ── Hero workflow scene ──────────────────────────────────────────────────
function HeroWorkflowScene() {
  return (
    <div className="pointer-events-none relative mx-auto mt-8 hidden w-full max-w-4xl lg:block landing-rise" style={{ animationDelay: "240ms" }}>
      <div className="absolute left-[18%] right-[18%] top-1/2 h-px -translate-y-1/2 bg-sky-200/80" />
      <div className="absolute left-[18%] right-[18%] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-sky-500 to-transparent landing-data-trace" />

      <div className="relative grid grid-cols-3 gap-5">
        <div className="rounded-[16px] border border-sky-100 bg-white/90 p-4 shadow-xl shadow-stone-900/[0.04] backdrop-blur landing-float landing-card-pop">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-sky-700">Upload</p>
            <Upload className="h-4 w-4 text-sky-500" />
          </div>
          <div className="rounded-[12px] border border-dashed border-sky-200 bg-sky-50/60 p-3.5">
            <p className="text-sm font-bold text-[#1C1917]">Blood work PDF</p>
            <p className="mt-1 text-xs text-[#78716C]">CBC, CMP, lipids, A1C</p>
          </div>
        </div>

        <div className="rounded-[16px] border border-violet-100 bg-white/92 p-4 shadow-xl shadow-stone-900/[0.05] backdrop-blur landing-float-slow landing-card-pop" style={{ animationDelay: "120ms, 860ms" }}>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-700">Analyze</p>
            <Brain className="h-4 w-4 text-violet-500" />
          </div>
          <div className="space-y-2.5">
            <span className="block h-2 w-full rounded-full bg-violet-100 landing-shimmer" />
            <span className="block h-2 w-4/5 rounded-full bg-violet-100 landing-shimmer" style={{ animationDelay: "220ms" }} />
            <span className="block h-2 w-2/3 rounded-full bg-violet-100 landing-shimmer" style={{ animationDelay: "440ms" }} />
          </div>
        </div>

        <div className="rounded-[16px] border border-emerald-100 bg-white/90 p-4 shadow-xl shadow-stone-900/[0.04] backdrop-blur landing-float landing-card-pop" style={{ animationDelay: "220ms, 420ms" }}>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">Ready</p>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-sm font-bold text-[#1C1917]">3 doctor questions drafted</p>
          <p className="mt-2 text-xs leading-relaxed text-[#57534E]">A focused one-page brief for the appointment.</p>
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
          <p className="text-[10px] font-bold uppercase text-amber-700">Discuss</p>
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

// ── Main Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-[#FAFAF7] font-sans">

      <LandingHeader />

      {/* ── HERO ── */}
      <section className="relative min-h-[100dvh] px-4 pb-10 pt-20 sm:px-6 sm:pt-24 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,#FCFCF9_0%,#FAFAF7_46%,#EAF8FF_100%)]" />
        <div className="absolute inset-0 opacity-[0.28] landing-grid-drift" />
        <div className="absolute left-0 right-0 top-16 h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent landing-pulse-line" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#FAFAF7] to-transparent" />

        <div className="relative mx-auto flex min-h-[calc(100dvh-7rem)] w-full max-w-6xl flex-col justify-center">
          <div className="mx-auto max-w-3xl text-center">
            <Pill className="bg-white/86 border border-sky-200 text-sky-700 mb-5 shadow-sm landing-rise">
              <ClipboardList size={10} /> Visit prep intelligence
            </Pill>

            <h1 className="font-display text-[42px] sm:text-6xl lg:text-[68px] xl:text-[74px] text-[#1C1917] leading-[0.98] mb-5 max-w-full text-balance landing-rise" style={{ animationDelay: "60ms" }}>
              Lab reports, translated into doctor-ready{" "}
              <span className="relative inline-block">
                clarity.
                <span className="absolute inset-x-0 -bottom-1 h-[3px] bg-gradient-to-r from-sky-300 via-sky-500 to-sky-300 rounded-full opacity-70" />
              </span>
            </h1>

            <p className="text-[16px] sm:text-[17px] text-[#57534E] leading-relaxed mb-7 max-w-2xl mx-auto overflow-wrap-anywhere landing-rise" style={{ animationDelay: "110ms" }}>
              Upload a blood work PDF. MedAssist explains what changed, prioritizes what matters, and creates a one-page appointment brief with questions you can bring to your doctor.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-center landing-rise" style={{ animationDelay: "160ms" }}>
              <Link
                href="/demo"
                className="flex w-[calc(100vw-2rem)] max-w-full sm:w-auto items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-7 py-3.5 rounded-[12px] text-[15px] font-bold transition-all active:scale-95 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40"
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

            <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:gap-3 mt-5 justify-center landing-rise" style={{ animationDelay: "260ms" }}>
              {[
                { icon: Lock, label: "Private by design" },
                { icon: Trash2, label: "Delete reports anytime" },
                { icon: Shield, label: "No report training" },
                { icon: CheckCircle2, label: "Export your data" },
              ].map(t => (
                <span key={t.label} className="inline-flex w-[calc(100vw-2rem)] max-w-full sm:w-auto items-center gap-1.5 truncate text-[12px] font-semibold text-[#57534E] bg-white border border-[#E8E6DF] px-3 py-1.5 rounded-full shadow-sm landing-chip">
                  <t.icon className="h-3.5 w-3.5 text-sky-500" /> {t.label}
                </span>
              ))}
            </div>
            <MobileHeroPreview />
          </div>
          <HeroWorkflowScene />
        </div>
      </section>

      {/* ── STATS BAR (animated count-up) ── */}
      <section className="py-10 border-y border-[#E8E6DF] bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <StatsCounter />
        </div>
      </section>

      {/* ── THE PROBLEM ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
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
                  "No clear way to decide what belongs on the appointment agenda",
                ].map((p, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 bg-white border-l-2 border-l-red-200 border border-[#E8E6DF] rounded-xl shadow-sm landing-reveal landing-tilt-card"
                    style={{ animationDelay: `${i * 70}ms` }}
                  >
                    <div className="w-5 h-5 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-1.5 h-0.5 rounded-full bg-red-400" />
                    </div>
                    <p className="text-[14px] text-[#57534E] leading-relaxed">{p}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Pill className="bg-emerald-50 border border-emerald-100 text-emerald-700 mb-6">With MedAssist</Pill>
              <h2 className="font-display text-4xl text-[#1C1917] mb-6">
                Instant clarity.
                <br />
                <span className="text-emerald-500">Plain English.</span>
              </h2>
              <div className="space-y-3">
                {[
                  "Every biomarker explained in language you can repeat back",
                  "Visit summaries tied to your exact values and ranges",
                  "Know what changed, what is in range, and what to discuss",
                  "Ready with the right questions when you see your doctor",
                ].map((p, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 bg-white border-l-2 border-l-emerald-400 border border-emerald-100 rounded-xl shadow-sm landing-reveal landing-tilt-card"
                    style={{ animationDelay: `${i * 70}ms` }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[14px] text-[#57534E] leading-relaxed">{p}</p>
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
                title: "AI finds what matters",
                desc: "Our clinical AI reads every value in the report, compares it to your reference ranges, and surfaces the changes worth discussing.",
                detail: "Takes under a minute",
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
            ].map((item, i) => (
              <div
                key={item.step}
                className={`relative bg-white border ${item.border} rounded-[20px] p-7 shadow-sm landing-reveal landing-tilt-card`}
                style={{ animationDelay: `${Number(item.step) * 90}ms` }}
              >
                {/* Connector arrow to next step */}
                {i < 2 && (
                  <ArrowRight className="hidden md:block absolute -right-3 top-[50px] z-20 w-4 h-4 text-sky-300/70" />
                )}

                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-5`}>
                  {item.icon}
                </div>
                <div className="absolute top-6 right-6 flex items-center justify-center">
                  <span className="text-[11px] font-black text-[#D9D6CD] font-mono">{item.step}</span>
                  <span className="absolute w-5 h-5 rounded-full bg-sky-400/15 landing-ping-ring" />
                </div>
                <h3 className="text-[18px] font-bold text-[#1C1917] mb-3">{item.title}</h3>
                <p className="text-[14px] text-[#57534E] leading-relaxed mb-4">{item.desc}</p>
                <p className="text-[11px] font-bold text-[#A8A29E] uppercase tracking-wider">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES BENTO ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Pill className="bg-[#F5F4EF] border border-[#E8E6DF] text-[#57534E] mb-4">Everything included</Pill>
            <h2 className="font-display text-4xl lg:text-5xl text-[#1C1917] mb-4">Your complete clinical dashboard</h2>
            <p className="text-lg text-[#57534E] max-w-xl mx-auto">One place for everything your health reports tell you.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">

            {/* Visit Prep — featured large */}
            <div className="lg:col-span-4 relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-sky-50/30 border border-sky-100 rounded-[24px] p-8 shadow-sm landing-reveal landing-tilt-card group">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-300/15 rounded-full blur-2xl group-hover:bg-sky-300/25 transition-all duration-700" />
              <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-sky-200 transition-all">
                <ClipboardList className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="text-[20px] font-bold text-[#1C1917] mb-2">Doctor Visit Prep</h3>
              <p className="text-[14px] text-[#57534E] leading-relaxed mb-6 max-w-sm">A printable one-page brief with key results, notable changes, and appointment questions — personalised to your exact biomarkers.</p>
              {/* Mini visit brief preview */}
              <div className="bg-white/80 rounded-2xl border border-sky-100/80 p-4 shadow-sm backdrop-blur-sm max-w-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-sky-700">Visit Brief</p>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Ready</span>
                </div>
                <div className="space-y-2">
                  {["Key Findings", "Lab Trend", "Doctor Questions"].map((_, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
                      <div className="flex-1 h-1.5 bg-sky-100 rounded-full landing-shimmer" style={{ animationDelay: `${idx * 200}ms` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trend Tracking */}
            <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 border border-emerald-100 rounded-[24px] p-6 shadow-sm landing-reveal landing-tilt-card group" style={{ animationDelay: "80ms" }}>
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-emerald-300/15 rounded-full blur-2xl" />
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-200 transition-all">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-[16px] font-bold text-[#1C1917] mb-2">Trend Tracking</h3>
              <p className="text-[13px] text-[#57534E] leading-relaxed">Charts and comparisons across every upload.</p>
              {/* Mini bar chart */}
              <div className="flex items-end gap-1 mt-5 h-10">
                {[40, 60, 45, 75, 55, 90, 70].map((h, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-emerald-300 rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* AI Explanations */}
            <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-violet-50/30 border border-violet-100 rounded-[24px] p-6 shadow-sm landing-reveal landing-tilt-card group" style={{ animationDelay: "160ms" }}>
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-violet-300/15 rounded-full blur-2xl" />
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-violet-200 transition-all">
                <Brain className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="text-[16px] font-bold text-[#1C1917] mb-2">AI Explanations</h3>
              <p className="text-[13px] text-[#57534E] leading-relaxed">Every biomarker explained in plain English. No medical degree required.</p>
            </div>

            {/* Streaming Assistant */}
            <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-amber-50/30 border border-amber-100 rounded-[24px] p-6 shadow-sm landing-reveal landing-tilt-card group" style={{ animationDelay: "240ms" }}>
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-300/15 rounded-full blur-2xl" />
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-amber-200 transition-all">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-[16px] font-bold text-[#1C1917] mb-2">Streaming Assistant</h3>
              <p className="text-[13px] text-[#57534E] leading-relaxed">Ask follow-up questions and see context-aware answers stream in real time.</p>
            </div>

            {/* Doctor Questions */}
            <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 border border-emerald-100 rounded-[24px] p-6 shadow-sm landing-reveal landing-tilt-card group" style={{ animationDelay: "320ms" }}>
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-emerald-300/15 rounded-full blur-2xl" />
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-200 transition-all">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-[16px] font-bold text-[#1C1917] mb-2">Doctor Questions</h3>
              <p className="text-[13px] text-[#57534E] leading-relaxed">AI-generated questions tailored to your results, ready to print and bring.</p>
            </div>

            {/* Health Memory — full width */}
            <div className="lg:col-span-6 relative overflow-hidden bg-gradient-to-r from-indigo-50 via-white to-sky-50 border border-indigo-100 rounded-[24px] p-8 shadow-sm landing-reveal landing-tilt-card group" style={{ animationDelay: "400ms" }}>
              <div className="absolute top-0 left-0 w-56 h-full bg-indigo-400/[0.03] rounded-l-[24px]" />
              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-200 transition-all">
                    <Shield className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-[18px] font-bold text-[#1C1917] mb-1">Health Memory</h3>
                  <p className="text-[13px] text-[#57534E] leading-relaxed max-w-xs">Conversations and uploaded reports stay in context so answers get more personal over time.</p>
                </div>
                {/* Memory timeline strip */}
                <div className="flex-1 flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
                  {[
                    { label: "Mar Report", status: "Baseline", active: false },
                    { label: "Apr Report", status: "Improving", active: false },
                    { label: "May Report", status: "On Track ✓", active: true },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex-shrink-0 rounded-xl border px-4 py-3 transition-all ${item.active ? "bg-indigo-50 border-indigo-200 shadow-sm" : "bg-white/60 border-[#E8E6DF]"}`}
                    >
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-indigo-600 mb-1">{item.label}</p>
                      <p className="text-[12px] font-semibold text-[#1C1917]">{item.status}</p>
                    </div>
                  ))}
                  <div className="flex-shrink-0 text-[#D9D6CD] text-lg">→</div>
                  <div className="flex-shrink-0 rounded-xl border border-dashed border-sky-300 bg-sky-50/50 px-4 py-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-sky-500 mb-1">Next Visit</p>
                    <p className="text-[12px] font-semibold text-[#A8A29E]">
                      <span className="landing-type-cursor">_</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── INTELLIGENCE SECTION ── */}
      <section className="py-24 px-6 bg-[#0F172A] text-white overflow-hidden relative">
        {/* Subtle animated grid overlay */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(rgba(14,165,233,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.25) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Pill className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6">
                Patient-centered context
              </Pill>
              <h2 className="font-display text-4xl lg:text-5xl text-white leading-tight mb-6">
                Beyond one report.
                <br />
                <span className="text-indigo-400">Useful patterns.</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-10">
                MedAssist connects medications, supplements, symptoms, and lab results over time so you can bring better context to your clinician.
              </p>

              <div className="space-y-6">
                {[
                  { tag: "LIVE", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", dot: "bg-emerald-500", title: "Medication Context", desc: "Log medications and supplements so trend charts show start-date markers your clinician can review." },
                  { tag: "Q2 2026", color: "text-sky-400 border-sky-500/30 bg-sky-500/10", dot: "bg-sky-500/40", title: "Health Timeline", desc: "A unified diary connecting symptoms, lifestyle context, and lab results into one longitudinal view." },
                  { tag: "Q3 2026", color: "text-violet-400 border-violet-500/30 bg-violet-500/10", dot: "bg-violet-500/40", title: "Wearable Context", desc: "Connect Apple Health or Oura Ring to discuss sleep and activity context alongside bloodwork." },
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

            {/* Floating intelligence cards — both now animated */}
            <div className="relative h-80 lg:h-full flex items-center justify-center">
              <div className="absolute bg-slate-800/90 border border-white/10 p-5 rounded-2xl shadow-2xl max-w-xs w-full -top-4 right-0 landing-float landing-card-pop" style={{ animationDelay: "200ms, 0ms" }}>
                <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mb-2">CORRELATION DETECTED</p>
                <p className="text-sm font-medium text-slate-200 leading-relaxed">Vitamin D improved after a logged supplement start date. Bring the timeline to your clinician to discuss maintenance and retesting.</p>
              </div>

              <div className="absolute bg-slate-800/90 border border-white/10 p-5 rounded-2xl shadow-2xl max-w-xs w-full bottom-4 left-0 landing-float-slow landing-card-pop" style={{ animationDelay: "600ms, 400ms" }}>
                <p className="text-[9px] text-amber-400 font-black uppercase tracking-widest mb-2">DISCUSSION POINT</p>
                <p className="text-sm font-medium text-slate-200 leading-relaxed">Glucose increased 15% across reports and is above the report range. Ask what follow-up or monitoring plan makes sense.</p>
              </div>
            </div>
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
                  { Icon: Brain, color: "text-emerald-500 bg-emerald-50", title: "No report training", desc: "Your reports are used to generate your analysis, not to train foundation models." },
                  { Icon: Lock, color: "text-sky-500 bg-sky-50", title: "Private account controls", desc: "Saved reports are tied to your account, and access is protected by database security rules." },
                  { Icon: Trash2, color: "text-red-500 bg-red-50", title: "Delete anytime", desc: "Delete individual reports or your account from the app when you no longer want the data stored." },
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

            {/* Security dark card */}
            <div className="relative">
              <div className="bg-[#0F172A] rounded-[24px] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Security Checklist</p>
                  {[
                    "Export your data",
                    "Delete reports anytime",
                    "No report data used for model training",
                    "Row-level security (RLS) enabled",
                    "Plain-language AI limitations",
                    "Urgent symptoms directed to urgent care",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 landing-reveal" style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={11} className="text-emerald-400" />
                      </div>
                      <span className="text-[13px] text-slate-300">{item}</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
            {/* Connecting gradient line */}
            <div className="hidden sm:block absolute top-0 left-[16.5%] right-[16.5%] h-[3px] bg-gradient-to-r from-sky-300 via-violet-300 to-emerald-400 rounded-full opacity-60" />

            {[
              { n: "1st Report", colorTop: "bg-sky-400", colorPill: "bg-sky-100 text-sky-600", title: "Clinical Baseline", desc: "Establish your starting point and build your first visit brief." },
              { n: "2nd Report", colorTop: "bg-violet-400", colorPill: "bg-violet-100 text-violet-600", title: "Trend Context", desc: "See what changed and what belongs in the next clinician conversation." },
              { n: "3rd Report +", colorTop: "bg-emerald-400", colorPill: "bg-emerald-100 text-emerald-700", title: "Longitudinal Clarity", desc: "Track patterns over time without replacing professional medical judgment." },
            ].map((s, i) => (
              <div
                key={s.n}
                className="bg-white border border-[#E8E6DF] rounded-[20px] overflow-hidden text-center shadow-sm landing-reveal landing-tilt-card"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className={`h-[3px] w-full ${s.colorTop}`} />
                <div className="p-7">
                  <div className={`inline-block text-[11px] font-black px-3 py-1 rounded-full ${s.colorPill} mb-5 uppercase tracking-wider`}>{s.n}</div>
                  <h3 className="text-[17px] font-bold text-[#1C1917] mb-3">{s.title}</h3>
                  <p className="text-[13px] text-[#57534E] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 px-6 bg-[#0F172A] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08] landing-grid-drift" style={{ backgroundImage: "linear-gradient(rgba(14,165,233,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.2) 1px, transparent 1px)", backgroundSize: "46px 46px" }} />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <Pill className="bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-6">Get started today</Pill>
          <h2 className="font-display text-4xl lg:text-5xl text-white mb-6">Ready for your next appointment?</h2>
          <p className="text-lg text-slate-400 mb-10 leading-relaxed">
            Upload your first lab report and get a plain-English summary, trend context, and doctor-ready questions in under a minute.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/demo"
              className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-8 py-3.5 rounded-[12px] text-[15px] font-bold transition-all active:scale-95 shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50"
            >
              Try interactive demo
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/auth?mode=signup"
              className="flex items-center justify-center gap-2 border border-white/20 hover:border-white/50 text-white px-8 py-3.5 rounded-[12px] text-[15px] font-bold transition-all hover:bg-white/8"
            >
              Create free account
            </Link>
          </div>
          <p className="text-[12px] text-slate-600 mt-6">No login required for the demo · No credit card to sign up</p>

          {/* Medical disclaimer — compact inline */}
          <div className="mt-12 border-t border-white/5 pt-8 text-left">
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-500">Medical Disclaimer.</span>{" "}
              MedAssist is a clinical education tool, not a diagnostic platform. It does not provide treatment plans, prescriptions, or medical advice. Always consult a qualified healthcare professional — use MedAssist to have better conversations with them, not to replace them.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0F172A] border-t border-white/5 pt-16 pb-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
            <div className="md:col-span-2">
              <BrandLockup inverse showTagline className="mb-4" />
              <p className="text-[13px] text-slate-500 leading-relaxed max-w-xs">
                AI-powered appointment prep that transforms lab reports into plain-English summaries, trend context, and doctor-ready questions.
              </p>
              <div className="flex gap-3 mt-6 flex-wrap">
                {["Private by design", "Delete anytime", "No report training"].map(t => (
                  <span key={t} className="text-[10px] font-semibold text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">{t}</span>
                ))}
              </div>
            </div>

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
              © 2026 MedAssist · Built by <span className="text-slate-400 font-semibold">Tanmay Shah</span>
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
