"use client";
import Link from "next/link";
import { LayoutDashboard, ArrowLeft } from "lucide-react";
import { BrandLockup, BrandMark } from "@/components/branding/brand-lockup";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-[#FDFDFB] flex flex-col">
      {/* Minimal header */}
      <header className="h-16 flex items-center px-6 border-b border-[#EBEAE4]">
        <Link href="/" className="group">
          <BrandLockup showTagline markClassName="transition-transform group-hover:-rotate-3 group-hover:scale-105" />
        </Link>
      </header>

      {/* Centered content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Big number */}
        <div className="relative mb-8">
          <p className="font-display text-[160px] leading-none font-bold text-[#EBEAE4] select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center">
              <BrandMark className="h-14 w-14 rounded-2xl" />
            </div>
          </div>
        </div>

        <h1 className="font-display text-3xl text-[#0F172A] mb-3">
          Page not found
        </h1>
        <p className="text-[#475569] text-[15px] max-w-sm leading-relaxed mb-8">
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
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 bg-[#FFFFFF] text-[#475569] border border-[#EBEAE4] rounded-[10px] font-semibold text-sm hover:border-[#D1CFCD] hover:text-[#0F172A] transition-all min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
        </div>

        {/* Legal note */}
        <p className="text-[11px] text-[#94A3B8] mt-12">
          If you believe this is an error, please contact support.
        </p>
      </main>
    </div>
  );
}
