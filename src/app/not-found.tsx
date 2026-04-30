import Link from "next/link";
import { Shield, LayoutDashboard, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-[#FAFAF7] flex flex-col">
      {/* Minimal header */}
      <header className="h-16 flex items-center px-6 border-b border-[#E8E6DF]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-[10px] bg-sky-500 flex items-center justify-center shadow-sm shadow-sky-500/30 group-hover:shadow-sky-500/50 transition-shadow">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-xl text-[#1C1917] tracking-tight">MedAssist</span>
        </Link>
      </header>

      {/* Centered content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Big number */}
        <div className="relative mb-8">
          <p className="font-display text-[160px] leading-none font-bold text-[#E8E6DF] select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center">
              <Shield className="w-8 h-8 text-sky-500" />
            </div>
          </div>
        </div>

        <h1 className="font-display text-3xl text-[#1C1917] mb-3">
          Page not found
        </h1>
        <p className="text-[#57534E] text-[15px] max-w-sm leading-relaxed mb-8">
          The page you're looking for doesn't exist, was moved, or you may not have access to it.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-[10px] font-semibold text-sm shadow-[0_4px_14px_rgba(14,165,233,0.25)] hover:bg-sky-600 hover:shadow-[0_4px_18px_rgba(14,165,233,0.35)] transition-all min-h-[44px]"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <Link
            href="javascript:history.back()"
            className="flex items-center gap-2 px-6 py-3 bg-[#F5F4EF] text-[#57534E] border border-[#E8E6DF] rounded-[10px] font-semibold text-sm hover:border-[#D9D6CD] hover:text-[#1C1917] transition-all min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </Link>
        </div>

        {/* Legal note */}
        <p className="text-[11px] text-[#A8A29E] mt-12">
          If you believe this is an error, please contact support.
        </p>
      </main>
    </div>
  );
}
