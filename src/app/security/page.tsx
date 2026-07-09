"use client";

import { LandingHeader } from "@/components/landing/landing-header";
import { BrandLockup } from "@/components/branding/brand-lockup";
import { motion } from "framer-motion";
import { Lock, FileKey, ShieldCheck, Database, ServerOff } from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function SecurityPage() {
  return (
    <div className="min-h-[100dvh] bg-[#FAFAF7] font-sans">
      <LandingHeader />

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <p className="text-[11px] font-black tracking-widest text-emerald-600 uppercase mb-4">Security & Privacy</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#1C1917] mb-8 leading-tight">
            Built on the principle of data sovereignty.
          </h1>
          <p className="text-lg text-[#57534E] leading-relaxed mb-12 max-w-2xl">
            Health data is the most sensitive data a person has. We engineered MedAssist to prioritize security at the infrastructure level, not just as an afterthought.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {[
            {
              icon: FileKey,
              title: "Encryption at Rest",
              desc: "All health data and extracted lab results are encrypted at rest using AES-256 encryption. We never store raw PDFs after processing."
            },
            {
              icon: Database,
              title: "Row-Level Security (RLS)",
              desc: "Our PostgreSQL database employs strict Row-Level Security. Queries are inherently scoped to the authenticated user's session."
            },
            {
              icon: ServerOff,
              title: "Zero Model Training",
              desc: "Data sent to our LLM pipeline is strictly processed ephemerally. We have binding agreements to ensure your data is never used to train foundation models."
            },
            {
              icon: ShieldCheck,
              title: "Complete Sovereignty",
              desc: "You own your data. You can export your full health timeline or delete your account (and all associated data) at any time."
            }
          ].map((item, i) => (
            <motion.div 
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-[#E8E6DF] rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                <item.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-[#1C1917] mb-3">{item.title}</h3>
              <p className="text-[#57534E] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="p-8 bg-sky-50 border border-sky-100 rounded-2xl flex flex-col md:flex-row items-center gap-8"
        >
          <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Lock className="w-8 h-8 text-sky-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1C1917] mb-2">Private by Design</h3>
            <p className="text-[#57534E] leading-relaxed">
              We collect only the minimum data required to provide actionable clinical insights. If you ever have questions about our data practices, our engineering team is an open book.
            </p>
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
                <li><Link href="/security" className="text-[13px] text-white font-medium">Security & Privacy</Link></li>
                <li><Link href="/about" className="text-[13px] text-slate-400 hover:text-white">About</Link></li>
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
