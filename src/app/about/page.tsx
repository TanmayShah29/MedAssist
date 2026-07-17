"use client";

import { LandingHeader } from "@/components/landing/landing-header";
import { BrandLockup } from "@/components/branding/brand-lockup";
import { motion } from "framer-motion";
import Link from "next/link";
import { Code2, ShieldCheck, FlaskConical, Compass, Lightbulb } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const teamMembers = [
  {
    name: "Tanmay Shah",
    role: "Lead Developer",
    bio: "Led the build end to end \u2014 architecture, full-stack engineering, and the design system that ties MedAssist together.",
    icon: Code2,
    bg: "bg-sky-100",
    iconColor: "text-sky-600",
    github: "https://github.com/TanmayShah29"
  },
  {
    name: "Kunj Vachrajani",
    role: "Tester & Code Reviewer",
    bio: "Stress-tested the app and reviewed the codebase, catching edge cases and keeping the code quality bar high.",
    icon: ShieldCheck,
    bg: "bg-emerald-100",
    iconColor: "text-emerald-600"
  },
  {
    name: "Dhrumil Vadodaria",
    role: "Developer & Researcher",
    bio: "Contributed to development while researching the clinical data and parsing logic behind MedAssist's core features.",
    icon: FlaskConical,
    bg: "bg-violet-100",
    iconColor: "text-violet-600"
  },
  {
    name: "Krish Shah",
    role: "Research & UX Strategy",
    bio: "Researched patient needs and best practices to help shape what MedAssist looks like and how it functions.",
    icon: Compass,
    bg: "bg-amber-100",
    iconColor: "text-amber-600"
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-[100dvh] bg-[#FDFDFB] font-sans">
      <LandingHeader />

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-[11px] font-black tracking-widest text-violet-600 uppercase mb-4">The Project</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#0F172A] mb-8 leading-tight">
            Design Engineering for Better Healthcare.
          </h1>
          <p className="text-lg text-[#475569] leading-relaxed max-w-2xl mx-auto">
            MedAssist was built by a four-person team \u2014 Tanmay Shah, Kunj Vachrajani, Dhrumil Vadodaria, and Krish Shah \u2014 as a Design Engineering project. The goal was simple: bridge the massive gap between the complex data patients receive and the clarity they actually need.
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
            <h2 className="text-2xl font-bold text-[#0F172A]">The Mission</h2>
            <p className="text-[#475569] leading-relaxed">
              Every day, thousands of patients receive their blood work results through a portal. They are presented with a wall of acronyms (CBC, TSH, BUN) and numbers that mean nothing without a medical degree.
            </p>
            <p className="text-[#475569] leading-relaxed">
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
            <h2 className="text-2xl font-bold text-[#0F172A]">Design Principles</h2>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
                <p className="text-[#475569]"><strong>Clarity over density.</strong> Never show a number without context. Hide what is optimal; highlight what needs attention.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
                <p className="text-[#475569]"><strong>Empathetic error states.</strong> Healthcare is scary enough. If a PDF fails to parse, apologize humanly. Don&apos;t throw a 500 error.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
                <p className="text-[#475569]"><strong>Augment, never replace.</strong> The AI does not diagnose. It prepares the user to have a better conversation with a real human doctor.</p>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p className="text-[11px] font-black tracking-widest text-violet-600 uppercase mb-4">Who Built It</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">Meet the Team</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-20">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="bg-white border border-[#EBEAE4] rounded-3xl p-8 text-center shadow-sm flex flex-col items-center"
            >
              <div className={`w-16 h-16 ${member.bg} rounded-full flex items-center justify-center mb-5`}>
                <member.icon className={`w-8 h-8 ${member.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-1">{member.name}</h3>
              <p className={`text-[12px] font-bold ${member.iconColor} uppercase tracking-wider mb-4`}>{member.role}</p>
              <p className="text-[#475569] text-sm leading-relaxed mb-6">{member.bio}</p>
              {member.github && (
                <a href={member.github} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold hover:bg-[#292524] transition-colors">
                  View GitHub
                </a>
              )}
            </motion.div>
          ))}
        </div>
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
            <p className="text-[12px] text-slate-600">© 2026 MedAssist · Built by <span className="text-slate-400 font-semibold">Tanmay Shah, Kunj Vachrajani, Dhrumil Vadodaria & Krish Shah</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
