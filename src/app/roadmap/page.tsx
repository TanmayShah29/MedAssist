import { BrandLockup } from "@/components/branding/brand-lockup";
import { ArrowRight, ChevronRight, Activity, Headphones, Stethoscope, CreditCard, Sparkles, Server } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Roadmap & Pricing - MedAssist",
  description: "Future enhancements and monetization strategy for MedAssist.",
};

export default function RoadmapPage() {
  return (
    <div className="min-h-[100dvh] bg-[#FDFDFB] font-sans selection:bg-sky-200/60 flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-[#EBEAE4] bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <BrandLockup showTagline />
          <Link href="/" className="text-[13px] font-semibold text-[#475569] hover:text-[#0F172A] transition-colors flex items-center gap-1">
            Back to Home <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-20">
        
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-sky-50 border border-sky-200 text-sky-700 mb-6">
            <Sparkles size={12} /> Roadmap & Sustainability
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-[#0F172A] mb-6">
            The Future of MedAssist
          </h1>
          <p className="text-[17px] text-[#475569] leading-relaxed max-w-2xl mx-auto">
            MedAssist is continuously evolving. Here is a look at the upcoming features we are building and our strategy for making the product financially sustainable.
          </p>
        </div>

        {/* Future Enhancements */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0 border border-violet-200">
              <Activity className="w-5 h-5 text-violet-600" />
            </div>
            <h2 className="font-display text-2xl text-[#0F172A]">Upcoming Enhancements</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Audio Summaries */}
            <div className="bg-white border border-[#EBEAE4] rounded-[16px] p-6 shadow-sm hover:border-violet-200 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center mb-4 group-hover:bg-violet-100 transition-colors">
                <Headphones className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="text-[16px] font-bold text-[#0F172A] mb-2">Clinical Audio Summaries</h3>
              <p className="text-[14px] text-[#475569] leading-relaxed">
                A 60-second, podcast-style audio summary of your lab report generated on the fly. Listen to what your results mean during your commute to the doctor's office.
              </p>
            </div>

            {/* Smart Doctor Search */}
            <div className="bg-white border border-[#EBEAE4] rounded-[16px] p-6 shadow-sm hover:border-violet-200 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-[16px] font-bold text-[#0F172A] mb-2">Smart Specialist Search</h3>
              <p className="text-[14px] text-[#475569] leading-relaxed">
                If your results indicate a specific issue (like a severe thyroid imbalance), MedAssist will suggest top-rated local endocrinologists and help you draft a referral request.
              </p>
            </div>

            {/* Wearable Integrations */}
            <div className="bg-white border border-[#EBEAE4] rounded-[16px] p-6 shadow-sm hover:border-violet-200 transition-colors group md:col-span-2">
              <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center mb-4 group-hover:bg-sky-100 transition-colors">
                <Activity className="w-5 h-5 text-sky-600" />
              </div>
              <h3 className="text-[16px] font-bold text-[#0F172A] mb-2">Apple Health & Oura Integrations</h3>
              <p className="text-[14px] text-[#475569] leading-relaxed max-w-2xl">
                Automatically pull in resting heart rate, sleep data, and daily activity to cross-reference with biomarkers like Cortisol, Thyroid levels, and Glucose. This provides a holistic picture of your health rather than just a snapshot in time.
              </p>
            </div>
          </div>
        </section>

        {/* Monetization / Pricing */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 border border-amber-200">
              <CreditCard className="w-5 h-5 text-amber-700" />
            </div>
            <h2 className="font-display text-2xl text-[#0F172A]">Monetization Strategy</h2>
          </div>

          <div className="bg-white border border-[#EBEAE4] rounded-[24px] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-[#EBEAE4] bg-[#FFFFFF]">
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Why MedAssist will become a paid service</h3>
              <p className="text-[15px] text-[#475569] leading-relaxed">
                Operating a highly secure, AI-powered medical platform requires significant infrastructure. From enterprise-grade Optical Character Recognition (OCR) to specialized Large Language Models (LLMs) running clinical reasoning pipelines, the underlying APIs cost money for every single report processed.
              </p>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Server className="w-4 h-4 text-[#94A3B8]" />
                    <h4 className="text-[14px] font-bold text-[#0F172A]">The Costs</h4>
                  </div>
                  <ul className="space-y-3">
                    <li className="text-[14px] text-[#475569] flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      <span>LLM Tokens for clinical reasoning and summarization.</span>
                    </li>
                    <li className="text-[14px] text-[#475569] flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      <span>OCR processing for complex, multi-page tabular PDFs.</span>
                    </li>
                    <li className="text-[14px] text-[#475569] flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      <span>Secure, encrypted HIPAA-compliant database storage.</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#94A3B8]" />
                    <h4 className="text-[14px] font-bold text-[#0F172A]">The Model</h4>
                  </div>
                  <ul className="space-y-3">
                    <li className="text-[14px] text-[#475569] flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <span><strong className="text-[#0F172A] mr-1">Free Tier:</strong> 1 free lab report analysis to experience the value and prepare for an urgent visit.</span>
                    </li>
                    <li className="text-[14px] text-[#475569] flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <span><strong className="text-[#0F172A] mr-1">Pay-per-report:</strong> A low flat fee (e.g. $4.99) for one-off analyses.</span>
                    </li>
                    <li className="text-[14px] text-[#475569] flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <span><strong className="text-[#0F172A] mr-1">Pro Subscription:</strong> For users with chronic conditions needing continuous tracking and integrations.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-sky-50 border-t border-[#EBEAE4] p-6 text-center">
              <p className="text-[14px] font-medium text-sky-800">
                Our goal is to keep MedAssist accessible while ensuring the product is sustainable and private. We will never sell your health data to advertisers.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#EBEAE4] bg-white py-10 px-6 text-center">
        <p className="text-[13px] text-[#94A3B8]">
          © 2026 MedAssist. Built by Tanmay Shah for Design Engineering.
        </p>
      </footer>
    </div>
  );
}
