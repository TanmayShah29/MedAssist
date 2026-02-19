"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { createBrowserClient } from '@supabase/ssr';
import {
  Shield,
  Upload,
  Brain,
  LineChart,
  ArrowRight,
  CheckCircle2,
  Sparkles,
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
    <div className="min-h-screen bg-[#FAFAF7]">

      {/* ── HEADER ───────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 
                   bg-[#FAFAF7]/80 backdrop-blur-md 
                   border-b border-[#E8E6DF]"
        style={{ WebkitBackdropFilter: "blur(12px)" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 
                        flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500 
                            flex items-center justify-center
                            shadow-sm shadow-sky-500/20">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl text-[#1C1917]">
              MedAssist
            </span>
          </Link>

          {/* Nav CTAs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(isSignedIn ? '/dashboard' : '/auth?mode=login')}
              style={{
                background: '#0EA5E9',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '8px 18px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {isSignedIn ? 'Go to Dashboard' : 'Sign in'}
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 
                           bg-sky-50 border border-sky-200 rounded-full 
                           text-xs font-medium text-sky-700 mb-6">
              <Sparkles className="w-3 h-3" />
              AI-powered health insights you can actually understand
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl 
                           text-[#1C1917] leading-[1.05] mb-6">
              Your lab results,
              <br />
              <span className="text-sky-500">finally explained.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-[#57534E] 
                          max-w-2xl mx-auto leading-relaxed mb-10">
              Upload your blood work. Get plain-language explanations
              of what every number means. Track your health over time.
              Know exactly what to ask your doctor.
            </p>

            {/* Primary CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 32 }}>
              <button
                onClick={() => router.push('/auth?mode=signup')}
                style={{
                  background: '#0EA5E9',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px 32px',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#0284C7'}
                onMouseLeave={e => e.currentTarget.style.background = '#0EA5E9'}
              >
                Get started free
              </button>
              <p style={{ fontSize: 13, color: '#A8A29E', margin: 0 }}>
                Free to start · No credit card required · Takes 3 minutes
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── THE PROBLEM ───────────────────────────────── */}
      <section className="py-16 px-6 bg-[#F5F4EF] border-y border-[#E8E6DF]">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-3xl sm:text-4xl 
                           text-[#1C1917] text-center mb-8">
              You get your lab results back.
              <br />
              Now what?
            </h2>

            <div className="space-y-5">
              {[
                "Numbers on a page that mean nothing to you",
                "Google searches that make you worry more",
                "Waiting days for a doctor to explain",
                "Feeling lost about what to do next",
              ].map((problem, idx) => (
                <motion.div
                  key={problem}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-[#FAFAF7] 
                             rounded-[12px] border border-[#E8E6DF]"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-100 
                                  flex items-center justify-center 
                                  flex-shrink-0 mt-0.5">
                    <span className="text-amber-600 text-sm">✕</span>
                  </div>
                  <p className="text-[#57534E] leading-relaxed">{problem}</p>
                </motion.div>
              ))}
            </div>

            <p style={{
              fontSize: 14,
              color: '#57534E',
              textAlign: 'center',
              maxWidth: 480,
              margin: '24px auto 0 auto',
              lineHeight: 1.6
            }}>
              MedAssist is free to use. No credit card, no subscription, no catch.
              Just upload your lab report and get instant plain-English explanations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS (SIMPLE PIPELINE) ─────────────── */}
      <section className="py-20 px-6" ref={pipelineRef}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl 
                           text-[#1C1917] mb-3">
              How MedAssist works
            </h2>
            <p className="text-[#57534E] max-w-xl mx-auto">
              From lab report to health insights in 3 simple steps
            </p>
          </div>

          {/* Pipeline steps */}
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-8 top-8 bottom-8 w-0.5 
                            bg-[#E8E6DF] hidden md:block" />

            <div className="space-y-8">
              {[
                {
                  step: "1",
                  icon: <Upload className="w-5 h-5 text-white" />,
                  title: "Upload your lab report",
                  description: "Works with digital PDF lab reports from any lab.",
                  detail: "Takes 5 seconds",
                  color: "sky",
                },
                {
                  step: "2",
                  icon: <Brain className="w-5 h-5 text-white" />,
                  title: "AI reads every value",
                  description: "Groq AI extracts every biomarker — Hemoglobin, CRP, Vitamin D, Glucose — and compares them to clinical reference ranges.",
                  detail: "Takes 20–40 seconds",
                  color: "sky",
                },
                {
                  step: "3",
                  icon: <LineChart className="w-5 h-5 text-white" />,
                  title: "See what it all means",
                  description: "Your dashboard shows: What's optimal. What needs attention. What trends you should track. All in plain language you can actually understand.",
                  detail: "Updated every time you upload",
                  color: "emerald",
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isPipelineInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: idx * 0.2, duration: 0.5 }}
                  className="relative flex gap-5 md:gap-6"
                >
                  {/* Step number circle */}
                  <div className={`
                    relative z-10 flex-shrink-0
                    w-16 h-16 rounded-2xl
                    flex items-center justify-center
                    shadow-sm
                    ${item.color === "emerald"
                      ? "bg-emerald-500"
                      : "bg-sky-500"}
                  `}>
                    {item.icon}
                    <span className="absolute -top-1 -right-1 w-6 h-6 
                                     rounded-full bg-white border-2 
                                     border-[#FAFAF7] flex items-center 
                                     justify-center text-xs font-bold 
                                     text-[#1C1917]">
                      {item.step}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <h3 className="text-xl font-semibold text-[#1C1917] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[#57534E] leading-relaxed mb-2">
                      {item.description}
                    </p>
                    <p className="text-xs font-medium text-[#A8A29E]">
                      {item.detail}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* What you get */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-14 p-6 bg-[#E0F2FE] rounded-[16px] 
                       border border-[#BAE6FD]"
          >
            <p className="text-sm font-semibold text-sky-800 mb-3">
              What you get in your dashboard:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Health score (0-100) based on all your values",
                "Which results need attention today",
                "Trend charts showing if you're improving",
                "Plain-language explanations of every number",
                "AI assistant to answer your questions",
                "What to ask your doctor at your next visit",
              ].map(feature => (
                <div key={feature}
                  className="flex items-start gap-2 text-sm text-sky-700">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {feature}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Technical Pipeline Section */}
      <section style={{
        padding: '80px 24px',
        background: '#1C1917',  // dark background to contrast with rest of page
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* Section label */}
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#A8A29E',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            textAlign: 'center',
            margin: '0 0 12px 0'
          }}>
            TECHNICAL PIPELINE
          </p>

          <h2 style={{
            fontFamily: 'Instrument Serif',
            fontSize: 32,
            fontWeight: 700,
            color: '#FAFAF7',
            textAlign: 'center',
            margin: '0 0 8px 0'
          }}>
            How the AI actually works
          </h2>

          <p style={{
            fontSize: 15,
            color: '#A8A29E',
            textAlign: 'center',
            margin: '0 auto 56px auto',
            maxWidth: 520,
            lineHeight: 1.6
          }}>
            MedAssist uses a multi-stage AI pipeline to extract, interpret,
            and structure your lab data with high accuracy.
          </p>

          {/* Pipeline steps */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 0,
            position: 'relative'
          }}>

            {[
              {
                step: '01',
                title: 'PDF Upload',
                tech: 'Next.js 16',
                description: 'User uploads a digital lab report PDF through a secure file handler. File is read as binary and passed to the extraction layer.',
                color: '#0EA5E9'
              },
              {
                step: '02',
                title: 'OCR Extraction',
                tech: 'OCR.space API',
                description: 'Optical Character Recognition reads every value, unit, and reference range from the PDF — including complex lab table layouts.',
                color: '#8B5CF6'
              },
              {
                step: '03',
                title: 'AI Interpretation',
                tech: 'Groq · Llama 3.3 70B',
                description: 'Extracted text is structured into a JSON schema by a large language model. Each biomarker is classified, scored, and given a plain-English explanation.',
                color: '#10B981'
              },
              {
                step: '04',
                title: 'Data Persistence',
                tech: 'Supabase · PostgreSQL',
                description: 'Biomarkers, health score, and AI interpretations are stored with row-level security. Each user can only access their own data.',
                color: '#F59E0B'
              },
              {
                step: '05',
                title: 'Visualisation',
                tech: 'Recharts · React',
                description: 'Results are rendered as interactive charts — range bars, trend lines, and radar charts — so patterns are immediately visible.',
                color: '#EF4444'
              }
            ].map((item, index, arr) => (
              <div key={item.step} style={{ position: 'relative' }}>

                {/* Connector line between steps */}
                {index < arr.length - 1 && (
                  <div className="hidden md:block" style={{
                    position: 'absolute',
                    top: 28,
                    right: -1,
                    width: 2,
                    height: 20,
                    background: '#2C2926',
                    zIndex: 1,
                  }} />
                )}

                <div style={{
                  padding: '24px 20px',
                  borderLeft: index === 0 ? 'none' : '1px solid #2C2926',
                }}
                  className={index > 0 ? "border-l border-[#2C2926] md:border-l" : ""}
                >
                  {/* Step number */}
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: item.color,
                    letterSpacing: '0.05em',
                    marginBottom: 12
                  }}>
                    {item.step}
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#FAFAF7',
                    margin: '0 0 4px 0'
                  }}>
                    {item.title}
                  </h3>

                  {/* Tech badge */}
                  <div style={{
                    display: 'inline-block',
                    background: '#2C2926',
                    color: '#A8A29E',
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 4,
                    marginBottom: 12,
                    fontFamily: 'monospace'
                  }}>
                    {item.tech}
                  </div>

                  {/* Description */}
                  <p style={{
                    fontSize: 13,
                    color: '#78716C',
                    margin: 0,
                    lineHeight: 1.6
                  }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tech stack row at bottom */}
          <div style={{
            marginTop: 48,
            paddingTop: 32,
            borderTop: '1px solid #2C2926',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: 12, color: '#57534E', marginRight: 8 }}>
              Built with:
            </span>
            {[
              'Next.js 16',
              'TypeScript',
              'Supabase',
              'PostgreSQL',
              'Groq AI',
              'Llama 3.3 70B',
              'OCR.space',
              'Recharts',
              'Vercel',
              'Zustand'
            ].map(tech => (
              <span key={tech} style={{
                background: '#2C2926',
                color: '#A8A29E',
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 6,
                fontFamily: 'monospace'
              }}>
                {tech}
              </span>
            ))}
          </div>

        </div>
      </section>

      {/* ── WHY CONSISTENCY MATTERS ───────────────────── */}
      <section className="py-20 px-6 bg-[#F5F4EF] border-y border-[#E8E6DF]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl sm:text-4xl 
                           text-[#1C1917] text-center mb-4">
              Health tracking works when
              <br />
              you actually stick with it
            </h2>
            <p className="text-[#57534E] text-center max-w-2xl mx-auto mb-12">
              One lab report tells you where you are.
              <br />
              <span className="font-semibold text-[#1C1917]">
                Multiple reports show you where you&apos;re going.
              </span>
            </p>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  timeline: "Upload #1",
                  title: "See your baseline",
                  description: "Know what's optimal and what needs work",
                  icon: "1",
                },
                {
                  timeline: "Upload #2",
                  title: "Track your progress",
                  description: "Did that vitamin D supplement help? Is hemoglobin improving?",
                  icon: "2",
                },
                {
                  timeline: "Upload #3+",
                  title: "Understand your body",
                  description: "Patterns emerge. You know what works for YOU.",
                  icon: "3",
                },
              ].map((stage, idx) => (
                <motion.div
                  key={stage.timeline}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-[14px] border border-[#E8E6DF] 
                             p-5 text-center"
                >
                  <div className="text-2xl font-bold bg-sky-100 text-sky-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    {stage.icon}
                  </div>
                  <p className="text-[10px] font-semibold uppercase 
                                tracking-[0.12em] text-sky-500 mb-2">
                    {stage.timeline}
                  </p>
                  <h3 className="text-base font-semibold text-[#1C1917] mb-2">
                    {stage.title}
                  </h3>
                  <p className="text-sm text-[#57534E] leading-relaxed">
                    {stage.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <p className="text-sm font-medium text-[#1C1917] mb-1">
                The more you use MedAssist, the smarter it gets.
              </p>
              <p className="text-sm text-[#57534E]">
                Trends become clear. Patterns reveal themselves.
                Your health story unfolds.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHAT IT'S NOT ─────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-2xl text-[#1C1917] 
                           text-center mb-8">
              What MedAssist is <span className="italic">not</span>
            </h3>

            <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] 
                            p-6 space-y-3">
              {[
                "Not a doctor — this is education, not diagnosis",
                "Not a replacement for medical care",
                "Powered by Groq AI",
                "Not complex — you don't need a medical degree to use it",
              ].map(clarification => (
                <div key={clarification}
                  className="flex items-start gap-2.5 text-sm text-[#57534E]">
                  <span className="text-[#1C1917] flex-shrink-0">•</span>
                  {clarification}
                </div>
              ))}
            </div>

            <p className="text-xs text-[#A8A29E] text-center mt-6 italic">
              MedAssist helps you understand your results so you can
              have better conversations with your doctor.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────── */}
      <div style={{ textAlign: 'center', padding: '64px 24px', background: '#F5F4EF' }}>
        <h2 style={{
          fontFamily: 'Instrument Serif',
          fontSize: 32,
          fontWeight: 700,
          color: '#1C1917',
          margin: '0 0 12px 0'
        }}>
          Ready to understand your health?
        </h2>
        <p style={{ fontSize: 15, color: '#57534E', margin: '0 0 32px 0', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
          Upload your first lab report and get your health score, plain-English explanations, and personalized insights in under a minute.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/auth?mode=signup')}
            style={{
              background: '#0EA5E9',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              padding: '12px 28px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Create free account
          </button>
          <button
            onClick={() => router.push('/auth?mode=login')}
            style={{
              background: 'transparent',
              color: '#57534E',
              border: '1px solid #D9D6CD',
              borderRadius: 10,
              padding: '12px 28px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Sign in
          </button>
        </div>
        <p style={{ fontSize: 12, color: '#A8A29E', marginTop: 16 }}>
          Already have an account? Click Sign in above.
        </p>
      </div>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer className="py-8 px-6 border-t border-[#E8E6DF] bg-[#FAFAF7]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center 
                          justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-sky-500 
                              flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
              <span className="font-display text-[#1C1917]">MedAssist</span>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-[#A8A29E] text-center max-w-md">
              AI-generated insights for educational purposes only.
              MedAssist does not provide medical diagnosis.
              Always consult a qualified physician.
            </p>

            {/* Credits */}
            <div className="flex items-center gap-4 text-xs text-[#A8A29E]">
              <span>© 2026 MedAssist</span>
              <span className="w-1 h-1 rounded-full bg-[#D9D6CD]" />
              <span>Made by Tanmay Shah</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
