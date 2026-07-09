"use client";

import { LandingHeader } from "@/components/landing/landing-header";
import { BrandLockup } from "@/components/branding/brand-lockup";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, Activity, Lightbulb, Compass } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function AboutPage() {
  return (
    <div className="min-h-[100dvh] bg-[#FAFAF7] font-sans">
      <LandingHeader />

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-[11px] font-black tracking-widest text-violet-600 uppercase mb-4">The Project</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#1C1917] mb-8 leading-tight">
            Design Engineering for Better Healthcare.
          </h1>
          <p className="text-lg text-[#57534E] leading-relaxed max-w-2xl mx-auto">
            MedAssist was created by Tanmay Shah as a Design Engineering project. The goal was simple: bridge the massive gap between the complex data patients receive and the clarity they actually need.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center mb-6">
              <Compass className="w-6 h-6 text-sky-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1C1917]">The Mission</h2>
            <p className="text-[#57534E] leading-relaxed">
              Every day, thousands of patients receive their blood work results through a portal. They are presented with a wall of acronyms (CBC, TSH, BUN) and numbers that mean nothing without a medical degree.
            </p>
            <p className="text-[#57534E] leading-relaxed">
              This leads to two terrible outcomes: anxiety-driven late-night Google searches, or complete apathy. MedAssist is designed to sit in the middle—translating those reports into plain English, so patients walk into their 15-minute doctor appointments prepared.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
              <Lightbulb className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1C1917]">Design Principles</h2>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
                <p className="text-[#57534E]"><strong>Clarity over density.</strong> Never show a number without context. Hide what is optimal; highlight what needs attention.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
                <p className="text-[#57534E]"><strong>Empathetic error states.</strong> Healthcare is scary enough. If a PDF fails to parse, apologize humanly. Don&apos;t throw a 500 error.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
                <p className="text-[#57534E]"><strong>Augment, never replace.</strong> The AI does not diagnose. It prepares the user to have a better conversation with a real human doctor.</p>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-[#E8E6DF] rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm"
        >
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-[#1C1917] mb-3">Tanmay Shah</h3>
          <p className="text-[13px] font-bold text-sky-600 uppercase tracking-wider mb-6">Design Engineer</p>
          <p className="text-[#57534E] leading-relaxed mb-8">
            I built MedAssist as a comprehensive capstone project combining Full-Stack Engineering, UI/UX Design, and Clinical Data parsing. 
          </p>
          <div className="flex justify-center gap-4">
            <a href="https://github.com/TanmayShah29" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-[#1C1917] text-white rounded-xl text-sm font-bold hover:bg-[#292524] transition-colors">
              View GitHub
            </a>
          </div>
        </motion.div>
      </main>

      <footer className="bg-[#0F172A] border-t border-white/5 pt-16 pb-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
            <div className="md:col-span-2">
              <BrandLockup inverse showTagline className="mb-4" />
              <p className="text-[13px] text-slate-500 leading-relaxed max-w-xs">
                AI-powered appointment prep that transforms lab reports into plain-English summaries, trend context, and doctor-ready questions.
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Product & Science</p>
              <ul className="space-y-3">
                <li><Link href="/" className="text-[13px] text-slate-400 hover:text-white">Home</Link></li>
                <li><Link href="/demo" className="text-[13px] text-slate-400 hover:text-white">Interactive Demo</Link></li>
                <li><Link href="/engineering" className="text-[13px] text-slate-400 hover:text-white">Engineering</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Legal & About</p>
              <ul className="space-y-3">
                <li><Link href="/security" className="text-[13px] text-slate-400 hover:text-white">Security & Privacy</Link></li>
                <li><Link href="/about" className="text-[13px] text-white font-medium">About</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
            <p className="text-[12px] text-slate-600">© 2026 MedAssist · Built by <span className="text-slate-400 font-semibold">Tanmay Shah</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
