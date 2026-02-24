"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { createBrowserClient } from '@supabase/ssr';
import { cn } from "@/lib/utils";
import {
  Shield,
  Upload,
  Brain,
  LineChart,
  CheckCircle2,
  Sparkles,
  X,
  Activity
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const pipelineRef = useRef(null);
  const isPipelineInView = useInView(pipelineRef, { once: true, margin: "-100px" });
  const [isSignedIn, setIsSignedIn] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsSignedIn(!!user);
    }
    checkUser();
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF7]">

      {/* ── HEADER ───────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 
                   bg-page/80 backdrop-blur-md 
                   border-b border-border-light
                   gpu-accelerate"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 
                        flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500 
                            flex items-center justify-center
                            shadow-sm shadow-sky-500/20">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl text-text-primary">
              MedAssist
            </span>
          </Link>

          {/* Nav CTAs */}
          <div className="flex items-center">
            {!isSignedIn && (
              <Link
                href="/auth?mode=login"
                className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors px-4 py-3 min-h-[44px] flex items-center"
              >
                Sign in
              </Link>
            )}
            <button
              onClick={() => {
                if (isSignedIn) {
                  router.push('/dashboard');
                } else {
                  router.push('/auth?mode=signup');
                }
              }}
              className="bg-sky-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-sky-600 transition-all active:scale-95 shadow-md shadow-sky-500/20 min-h-[44px]"
              style={{ WebkitAppearance: 'none', marginLeft: 8 }}
            >
              {isSignedIn ? 'Go to Dashboard' : 'Sign up'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Isolation for Safari GPU Compositing */}
      <div className="isolate">

        {/* ── HERO ──────────────────────────────────────── */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">

            <motion.div
              initial={{ opacity: 0.01, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Headline */}
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl 
                           text-[#1C1917] leading-[1.05] mb-6">
                Your lab results,
                <br />
                <span className="text-sky-500">finally explained.</span>
              </h1>

              {/* Subheadline badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 
                           bg-sky-50 border border-sky-200 rounded-full 
                           text-xs font-medium text-sky-700 mb-8">
                <Sparkles className="w-3 h-3" />
                AI-powered health insights you can actually understand
              </div>

              <p className="text-lg sm:text-xl text-[#57534E] 
                          max-w-2xl mx-auto leading-relaxed mb-10">
                Upload your blood work. Get plain-language explanations
                of what every number means. Build your health timeline report by report.
                Know exactly what to ask your doctor.
              </p>

              {/* Primary CTA */}
              <div className="flex flex-col items-center mt-8">
                <button
                  onClick={() => {
                    if (isSignedIn) {
                      // Reset cookie so middleware fetches fresh state from DB
                      document.cookie = "onboarding_complete=; path=/; max-age=0";
                      router.push('/dashboard');
                    } else {
                      router.push('/auth?mode=signup');
                    }
                  }}
                  className="bg-sky-500 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/25 active:scale-95"
                  style={{ WebkitAppearance: 'none' }}
                >
                  {isSignedIn ? 'Go to Dashboard' : 'Get started free'}
                </button>
                <p className="text-xs text-text-muted mt-3">
                  Free to start · No credit card required · Takes 3 minutes
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── ADVANCED INTELLIGENCE ────────── */}
        <section className="py-24 px-6 bg-[#0F172A] text-white overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-16 lg:gap-24">
              <div className="grow shrink basis-auto w-full">
                <div className="inline-flex items-center gap-2 px-3 py-1 
                             bg-indigo-500/10 border border-indigo-500/20 
                             rounded-full text-[10px] font-bold text-indigo-400 
                             uppercase tracking-widest mb-8">
                  Next Generation Health Intelligence
                </div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-8">
                  Beyond just <span className="text-indigo-400">results.</span>
                  <br />
                  Real-world <span className="text-indigo-400">correlations.</span>
                </h2>
                <p className="text-slate-400 text-lg mb-12 leading-relaxed">
                  MedAssist is the first clinical intelligence platform that understands
                  the &quot;why&quot; behind your numbers by connecting your actions to your outcomes.
                </p>

                <div className="space-y-8">
                  {[
                    {
                      title: "Supplement Correlation",
                      desc: "Log your intake and see exactly how it affects your biomarkers with automated chart markers.",
                      status: "LIVE"
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="flex">
                      <div className={cn(
                        "w-1 h-auto rounded-full shrink-0",
                        item.status === "LIVE" ? "bg-emerald-500" : "bg-indigo-500/30"
                      )} />
                      <div style={{ marginLeft: 24 }}>
                        <div className="flex items-center mb-2">
                          <h4 className="font-bold text-slate-200 text-lg">{item.title}</h4>
                          <span className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded border tracking-tighter",
                            item.status === "LIVE"
                              ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                              : "text-indigo-400 border-indigo-500/30 bg-indigo-500/10"
                          )} style={{ marginLeft: 12 }}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-base text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grow shrink basis-auto w-full min-w-0 relative">
                {/* Visual representation of a timeline/correlation */}
                <div className="w-full aspect-square bg-gradient-to-br from-indigo-500/10 to-sky-500/20 rounded-[48px] border border-white/5 p-8 lg:p-12 relative overflow-hidden group">
                  <div className="absolute inset-0 flex items-center justify-center opacity-20 blur-xl group-hover:opacity-30 transition-opacity">
                    <div className="w-full space-y-8">
                      <div className="h-3 bg-indigo-500 rounded-full w-3/4 mx-auto" />
                      <div className="h-3 bg-sky-500 rounded-full w-1/2 mx-auto" />
                      <div className="h-3 bg-emerald-500 rounded-full w-2/3 mx-auto" />
                    </div>
                  </div>
                  <div className="relative z-10 flex flex-col justify-center h-full gap-6">
                    <motion.div
                      initial={{ x: 20, opacity: 0.01 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      className="bg-slate-800/80 backdrop-blur-xl transform-gpu border border-white/10 p-6 rounded-3xl shadow-2xl transform -rotate-2"
                    >
                      <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-3">CORRELATION DETECTED</p>
                      <p className="text-sm font-medium text-slate-200 leading-relaxed">Vitamin D levels increased by 42% after starting D3 Supplement on Feb 12.</p>
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0.01 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-slate-800/80 backdrop-blur-xl transform-gpu border border-white/10 p-6 rounded-3xl shadow-2xl transform rotate-1 ml-12"
                    >
                      <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-3">TIMELINE EVENT</p>
                      <p className="text-sm font-medium text-slate-200 leading-relaxed">Symptom &quot;Fatigue&quot; disappeared 4 days after Hemoglobin returned to optimal.</p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── THE PROBLEM ───────────────────────────────── */}
        <section className="py-24 px-6 bg-card border-y border-border-light">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0.01, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold text-text-primary text-center mb-12">
                You get your lab results back.
                <br />
                Now what?
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {[
                  "Numbers on a page that mean nothing to you",
                  "Google searches that make you worry more",
                  "Waiting days for a doctor to explain",
                  "Feeling lost about what to do next",
                ].map((problem, idx) => (
                  <motion.div
                    key={problem}
                    initial={{ opacity: 0.01, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start p-5 bg-white rounded-2xl border border-border-light shadow-sm"
                  >
                    <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-lg text-text-secondary leading-relaxed" style={{ marginLeft: 16 }}>
                      {problem}
                    </p>
                  </motion.div>
                ))}
              </div>

              <p className="text-text-secondary text-center max-w-lg mx-auto mt-10 leading-relaxed italic">
                MedAssist is free to use. No credit card, no subscription, no catch.
                Just upload your lab report and get instant plain-English explanations.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── HOW IT WORKS (SIMPLE PIPELINE) ─────────────── */}
        <section className="py-24 px-6" ref={pipelineRef}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-5xl font-bold text-text-primary mb-6">
                How MedAssist works
              </h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
                From lab report to health insights in 3 simple steps
              </p>
            </div>

            {/* Pipeline steps */}
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-10 top-10 bottom-10 w-0.5 
                            bg-border-light hidden md:block" />

              <div className="space-y-12">
                {[
                  {
                    step: "1",
                    icon: <Upload className="w-6 h-6 text-white" />,
                    title: "Upload your lab report",
                    description: "Works with digital PDF lab reports from any lab.",
                    detail: "Takes 5 seconds",
                    color: "bg-sky-500",
                  },
                  {
                    step: "2",
                    icon: <Brain className="w-6 h-6 text-white" />,
                    title: "AI reads every value",
                    description: "Groq AI extracts every biomarker — Hemoglobin, CRP, Vitamin D, Glucose — and compares them to clinical reference ranges.",
                    detail: "Takes 20–40 seconds",
                    color: "bg-sky-500",
                  },
                  {
                    step: "3",
                    icon: <LineChart className="w-6 h-6 text-white" />,
                    title: "See what it all means",
                    description: "Your dashboard shows: What's optimal. What needs attention. What trends you should track. All in plain language you can actually understand.",
                    detail: "Updated every time you upload",
                    color: "bg-emerald-500",
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0.01, y: 30 }}
                    animate={isPipelineInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: idx * 0.2, duration: 0.5 }}
                    className="relative flex items-start"
                  >
                    {/* Step number circle */}
                    <div className={`
                    relative z-10 flex-shrink-0
                    w-20 h-20 rounded-3xl
                    flex items-center justify-center
                    shadow-xl shadow-sky-500/10
                    ${item.color}
                  `}>
                      {item.icon}
                      <div className="absolute -top-2 -right-2 w-8 h-8 
                                     rounded-full bg-white border-4 
                                     border-page flex items-center 
                                     justify-center text-xs font-black 
                                     text-text-primary shadow-sm">
                        {item.step}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="grow shrink basis-auto w-full pt-2" style={{ marginLeft: 32 }}>
                      <h3 className="text-2xl font-bold text-text-primary mb-3">
                        {item.title}
                      </h3>
                      <p className="text-lg text-text-secondary leading-relaxed mb-3">
                        {item.description}
                      </p>
                      <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                        {item.detail}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* What you get */}
            <motion.div
              initial={{ opacity: 0.01, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="p-10 bg-sky-50 border border-sky-100 rounded-[32px] mt-20 shadow-sm"
            >
              <p className="text-sm font-bold text-sky-800 uppercase tracking-widest mb-6">
                Included in your clinical dashboard:
              </p>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                {[
                  "Health score (0-100) based on all your values",
                  "Which results need attention today",
                  "Trend charts showing if you're improving",
                  "Plain-language explanations of every number",
                  "AI assistant to answer your questions",
                  "Supplement & Medication tracking",
                  "Professional print-ready reports",
                  "What to ask your doctor at your next visit",
                ].map(feature => (
                  <div key={feature}
                    className="flex items-start text-sm font-medium text-sky-700">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-sky-500" style={{ marginRight: 12 }} />
                    {feature}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── TRUST & SOCIAL PROOF SECTION ───────────────── */}
        <section className="py-24 px-6 bg-white overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Left: Interactive-looking Dashboard Mockup */}
              <div className="grow shrink basis-auto relative w-full lg:max-w-xl">
                <motion.div
                  initial={{ opacity: 0.01, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="bg-card rounded-3xl border border-border-light shadow-2xl p-6 relative z-10 overflow-hidden"
                >
                  {/* Mock Header */}
                  <div className="flex justify-between items-center mb-8">
                    <div className="h-4 w-32 bg-border-light rounded-full" />
                    <div className="h-8 w-8 bg-sky-500 rounded-lg" />
                  </div>
                  {/* Mock Hero Card */}
                  <div className="bg-sky-500 rounded-2xl p-6 text-white mb-6">
                    <div className="h-3 w-20 bg-white/20 rounded-full mb-4" />
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-black">82</div>
                      <div className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded">Good</div>
                    </div>
                  </div>
                  {/* Mock Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-border-light rounded-xl p-4">
                      <div className="h-2 w-12 bg-emerald-100 rounded-full mb-2" />
                      <div className="h-4 w-20 bg-text-primary rounded-full" />
                    </div>
                    <div className="bg-white border border-border-light rounded-xl p-4">
                      <div className="h-2 w-12 bg-amber-100 rounded-full mb-2" />
                      <div className="h-4 w-20 bg-text-primary rounded-full" />
                    </div>
                  </div>
                </motion.div>
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-500/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
              </div>

              {/* Right: Trust Statements */}
              <div className="grow shrink basis-auto w-full">
                <h2 className="text-4xl font-bold text-text-primary mb-8">
                  Your health data is <br />
                  <span className="text-sky-500">private and secure.</span>
                </h2>
                <div className="space-y-8">
                  {[
                    {
                      title: "Your data is never sold",
                      desc: "We don't share your medical information with third parties or advertisers. Ever.",
                      icon: <Shield className="w-6 h-6 text-emerald-500" />
                    },
                    {
                      title: "Row-level encryption",
                      desc: "Built on Supabase with enterprise-grade security. Only you can access your uploads.",
                      icon: <Sparkles className="w-6 h-6 text-sky-500" />
                    },
                    {
                      title: "Delete anytime",
                      desc: "You have full control. One click to permanently wipe your entire history from our servers.",
                      icon: <X className="w-6 h-6 text-red-500" />
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="flex">
                      <div className="w-12 h-12 rounded-xl bg-page border border-border-light flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div style={{ marginLeft: 20 }}>
                        <h4 className="text-lg font-bold text-text-primary mb-1">{item.title}</h4>
                        <p className="text-text-secondary leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TECHNICAL PIPELINE SECTION ───────────────── */}
        <section className="py-24 px-6 bg-page">
          <div className="max-w-5xl mx-auto bg-card border border-border-light rounded-[32px] p-12 lg:p-20 shadow-sm">

            {/* Section label */}
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] text-center mb-4">
              TECHNICAL ARCHITECTURE
            </p>

            <h2 className="text-4xl lg:text-5xl font-bold text-text-primary text-center mb-6">
              Clinical-grade AI pipeline
            </h2>

            <p className="text-lg text-text-secondary text-center max-w-2xl mx-auto mb-16 leading-relaxed">
              MedAssist uses a multi-stage clinical intelligence pipeline to extract,
              interpret, and structure your lab data with high accuracy.
            </p>

            {/* Pipeline steps */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-0 border border-border-light rounded-2xl overflow-hidden">
              {[
                {
                  step: '01',
                  title: 'PDF Upload',
                  tech: 'Next.js 16',
                  description: 'Secure file handler processing digital lab reports as binary data.',
                  color: 'text-sky-500'
                },
                {
                  step: '02',
                  title: 'OCR Extraction',
                  tech: 'OCR.space',
                  description: 'Extracting raw values, units, and clinical reference ranges.',
                  color: 'text-violet-500'
                },
                {
                  step: '03',
                  title: 'AI Analysis',
                  tech: 'Llama 3.3',
                  description: 'Structuring data into clinical schemas with plain-English insights.',
                  color: 'text-emerald-500'
                },
                {
                  step: '04',
                  title: 'Persistence',
                  tech: 'PostgreSQL',
                  description: 'Encrypted storage with row-level security for total privacy.',
                  color: 'text-amber-500'
                },
                {
                  step: '05',
                  title: 'Insights',
                  tech: 'Recharts',
                  description: 'Rendering longitudinal trends and clinical system balance charts.',
                  color: 'text-red-500'
                }
              ].map((item, index) => (
                <div
                  key={item.step}
                  className={`p-6 bg-white/50 backdrop-blur-sm transform-gpu ${index !== 4 ? 'border-b md:border-b-0 md:border-r border-border-light' : ''}`}
                >
                  <div className={`text-xs font-bold ${item.color} mb-3 tracking-widest`}>
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">
                    {item.title}
                  </h3>
                  <div className="inline-block bg-white border border-border-light text-text-secondary text-[10px] px-2 py-0.5 rounded-md font-mono mb-4">
                    {item.tech}
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Tech stack row at bottom */}
            <div className="mt-16 pt-10 border-t border-border-light flex flex-wrap justify-center">
              <span className="text-sm font-medium text-text-secondary self-center" style={{ marginRight: 12 }}>
                Powered by Groq AI & Llama 3.3
              </span>
              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  'Supabase', 'Next.js 16', 'TypeScript', 'Tailwind 4'
                ].map(tech => (
                  <span key={tech} className="bg-white border border-border-light text-text-muted text-[11px] px-3 py-1 rounded-full font-mono">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY CONSISTENCY MATTERS ───────────────────── */}
        <section className="py-24 px-6 bg-page">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0.01, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-text-primary text-center mb-8">
                Consistency builds clarity
              </h2>
              <p className="text-lg text-text-secondary text-center max-w-2xl mx-auto mb-16 leading-relaxed">
                One lab report tells you where you are.
                <br />
                <span className="font-black text-text-primary">
                  A timeline tells you where you&apos;re going.
                </span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {[
                  {
                    timeline: "Upload #1",
                    title: "Clinical Baseline",
                    description: "Establish your starting point and identify immediate priorities.",
                    icon: "1",
                  },
                  {
                    timeline: "Upload #2",
                    title: "Trend Correlation",
                    description: "See if supplements or lifestyle changes are moving your markers.",
                    icon: "2",
                  },
                  {
                    timeline: "Upload #3+",
                    title: "True Health IQ",
                    description: "Understand your body&apos;s patterns and predict future outcomes.",
                    icon: "3",
                  },
                ].map((stage, idx) => (
                  <motion.div
                    key={stage.timeline}
                    initial={{ opacity: 0.01, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-card rounded-3xl border border-border-light p-8 text-center shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="text-2xl font-black bg-sky-100 text-sky-600 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6">
                      {stage.icon}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-500 mb-3">
                      {stage.timeline}
                    </p>
                    <h3 className="text-xl font-bold text-text-primary mb-3">
                      {stage.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {stage.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── ROADMAP SECTION ───────────────────── */}
        <section className="py-24 px-6 bg-page border-t border-border-light">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-[32px] border border-border-light p-10 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Activity size={120} />
              </div>
              <div className="relative z-10">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-500 mb-4">ROADMAP</h3>
                <h2 className="text-3xl font-bold text-text-primary mb-8">What&apos;s coming next</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex items-start">
                    <div className="w-1 h-auto bg-sky-500/30 rounded-full shrink-0" />
                    <div style={{ marginLeft: 16 }}>
                      <div className="flex items-center mb-1">
                        <h4 className="font-bold text-text-primary">Health Timeline</h4>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-sky-500/30 text-sky-600 bg-sky-50 ml-2">Q2 2026</span>
                      </div>
                      <p className="text-sm text-text-secondary">A unified medical diary connecting symptoms, lifestyle actions, and lab results.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-1 h-auto bg-sky-500/30 rounded-full shrink-0" />
                    <div style={{ marginLeft: 16 }}>
                      <div className="flex items-center mb-1">
                        <h4 className="font-bold text-text-primary">Wearable Sync</h4>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-sky-500/30 text-sky-600 bg-sky-50 ml-2">Q3 2026</span>
                      </div>
                      <p className="text-sm text-text-secondary">Connect Apple Health or Oura to see how sleep and activity correlate with your blood work.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHAT IT'S NOT ─────────────────────────────── */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0.01, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold text-text-primary text-center mb-10">
                Medical Disclaimers
              </h3>

              <div className="bg-card rounded-[32px] border border-border-light p-10 space-y-6 shadow-sm">
                {[
                  { title: "Not a doctor", desc: "MedAssist is a clinical education tool, not a diagnostic platform." },
                  { title: "No medical advice", desc: "We do not provide treatment plans, prescriptions, or medical guidance." },
                  { title: "Professional care", desc: "Always consult a qualified healthcare provider before making medical decisions." }
                ].map((item, idx) => (
                  <div key={idx} className="flex">
                    <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-1">
                      <X className="w-3 h-3 text-red-500" />
                    </div>
                    <div style={{ marginLeft: 16 }}>
                      <h4 className="text-base font-bold text-text-primary mb-1">{item.title}</h4>
                      <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-text-muted text-center mt-8 italic max-w-sm mx-auto">
                MedAssist helps you understand your results so you can
                have better conversations with your doctor.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────── */}
        <section className="text-center py-24 px-6 bg-card border-t border-border-light">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-text-primary mb-6">
              Ready to understand your health?
            </h2>
            <p className="text-lg text-text-secondary mb-12 leading-relaxed">
              Upload your first lab report and get your health score,
              plain-English explanations, and personalized insights in under a minute.
            </p>
            <div className="flex flex-col items-center">
              <button
                onClick={() => router.push('/auth?mode=signup')}
                className="bg-sky-500 text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/25 active:scale-95"
                style={{ WebkitAppearance: 'none' }}
              >
                Create free account
              </button>
              {!isSignedIn && (
                <Link
                  href="/auth?mode=login"
                  className="text-sm font-bold text-text-secondary hover:text-text-primary transition-colors mt-6"
                >
                  Already have an account? Sign in
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────────── */}
        <footer className="py-12 px-6 border-t border-border-light bg-page">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Logo */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-display text-xl text-text-primary">MedAssist</span>
              </div>

              {/* Disclaimer */}
              <p className="text-[13px] text-text-muted text-center max-w-lg leading-relaxed">
                AI-generated health insights. For educational purposes only.
                Always consult a qualified physician. Powered by Groq AI & Llama 3.3.
              </p>

              <div className="flex gap-8 text-[11px] font-bold uppercase tracking-widest text-text-muted">
                <Link href="/terms" className="hover:text-text-primary transition-colors">Terms</Link>
                <Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy</Link>
              </div>

              {/* Credits */}
              <div className="flex items-center text-[11px] text-text-muted">
                <span>© 2026 MedAssist</span>
                <span className="mx-3 text-border-medium" aria-hidden="true">|</span>
                <span>Built by Tanmay Shah</span>
              </div>
            </div>
          </div>
        </footer>

      </div> {/* End Isolate Wrapper */}
    </div>
  );
}
