"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/results": "Lab Results",
  "/assistant": "AI Assistant",
  "/profile": "Your Profile",
  "/settings": "Settings",
};

function getTitle(pathname: string): string {
  for (const [prefix, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(prefix)) return title;
  }
  return "MedAssist";
}

export function MobileNavbar() {
  const pathname  = usePathname();
  const { initials } = useUserProfile();

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-[60] bg-[#FAFAF7]/90 backdrop-blur-xl border-b border-[#E8E6DF] flex flex-col">
      {/* iOS notch spacer */}
      <div className="w-full safe-area-top" />

      <div className="h-14 flex items-center justify-between px-4 w-full px-safe">
        {/* Logo + page title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Link href="/dashboard" className="flex-shrink-0">
            <div className="w-7 h-7 rounded-[8px] bg-sky-500 flex items-center justify-center shadow-sm shadow-sky-500/30">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
          </Link>
          <span className="font-display text-[15px] text-[#1C1917] tracking-tight font-bold truncate max-w-[160px]">
            {getTitle(pathname)}
          </span>
        </div>

        {/* Avatar — links to profile */}
        <Link
          href="/profile"
          className="w-9 h-9 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center shadow-sm active:scale-95 transition-transform flex-shrink-0"
          aria-label="Go to profile"
        >
          <span className="text-[11px] font-bold text-sky-600 leading-none">
            {initials === "?" ? "…" : initials}
          </span>
        </Link>
      </div>
    </header>
  );
}
