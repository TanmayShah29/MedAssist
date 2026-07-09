"use client";

import { LandingHeader } from "@/components/landing/landing-header";
import { BrandLockup } from "@/components/branding/brand-lockup";
import { motion } from "framer-motion";
import { FileText, Cpu, Server, Shield, Brain, ArrowRight } from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function EngineeringPage() {
  return (
    <div className="min-h-[100dvh] bg-[#FAFAF7] font-sans">
      <LandingHeader />

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <p className="text-[11px] font-black tracking-widest text-sky-600 uppercase mb-4">Architecture & Methodology</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#1C1917] mb-8 leading-tight">
            How MedAssist turns unstructured PDFs into clinical intelligence.
          </h1>
          <p className="text-lg text-[#57534E] leading-relaxed mb-12 max-w-2xl">
            This project was built for a Design Engineering capstone to solve a specific clinical UX problem: the gap between receiving lab results and understanding them. Here is how the pipeline works.
          </p>
        </motion.div>

        {/* Pipeline Architecture */}
        <div className="space-y-6">
          {[
            {
              step: 1,
              title: "OCR & Text Extraction",
              icon: FileText,
              color: "text-sky-600 bg-sky-50 border-sky-100",
              desc: "The uploaded PDF is routed to a secure, ephemeral serverless function. We use advanced OCR and layout parsing to retain the hierarchical structure of the lab report, identifying panels (e.g., CBC, CMP) and extracting tabular rows (Biomarker, Value, Unit, Reference Range)."
            },
            {
              step: 2,
              title: "LLM Pipeline & Normalization",
              icon: Brain,
              color: "text-violet-600 bg-violet-50 border-violet-100",
              desc: "Extracted text is processed by a medical-grade LLM pipeline. The pipeline normalizes biomarker names to standard schemas, calculates percentage deltas against the patient's historical baseline, and flags values that fall outside the clinical reference ranges provided by the specific lab."
            },
            {
              step: 3,
              title: "Insight Generation",
              icon: Cpu,
              color: "text-emerald-600 bg-emerald-50 border-emerald-100",
              desc: "Based on the normalized data, the system generates plain-English insights. It identifies key clinical correlations (e.g., high LDL + high Triglycerides) and drafts actionable questions the patient can bring to their physician."
            },
            {
              step: 4,
              title: "Secure Persistence",
              icon: Server,
              color: "text-indigo-600 bg-indigo-50 border-indigo-100",
              desc: "Data is stored in a PostgreSQL database protected by Row-Level Security (RLS). Every report is cryptographically bound to the user's session, ensuring no cross-tenant data leakage."
            }
          ].map((item, i) => (
            <motion.div 
              key={item.step}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-6 p-6 bg-white border border-[#E8E6DF] rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black text-slate-400 font-mono">STEP 0{item.step}</span>
                  <h3 className="text-lg font-bold text-[#1C1917]">{item.title}</h3>
                </div>
                <p className="text-[#57534E] leading-relaxed text-[15px]">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 p-8 bg-[#0F172A] rounded-2xl text-white text-center"
        >
          <Shield className="w-8 h-8 text-sky-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Built with Security First</h2>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto">
            Our architecture guarantees that your data is never used to train foundation models, and is protected by industry-standard encryption.
          </p>
          <Link href="/security" className="inline-flex items-center gap-2 text-sky-400 font-bold hover:text-sky-300 transition-colors">
            Read our Security Principles <ArrowRight className="w-4 h-4" />
          </Link>
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
                <li><Link href="/engineering" className="text-[13px] text-white font-medium">Engineering</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Legal & About</p>
              <ul className="space-y-3">
                <li><Link href="/security" className="text-[13px] text-slate-400 hover:text-white">Security & Privacy</Link></li>
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
