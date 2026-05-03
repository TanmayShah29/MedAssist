"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Brain,
  FlaskConical,
  User,
  Settings,
  LogOut,
  Shield,
  Zap,
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

const navItems = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, shortcut: "⌘D" },
  { id: "results",   label: "Lab Results", path: "/results",   icon: FlaskConical,    shortcut: "⌘R" },
  { id: "assistant", label: "AI Assistant",path: "/assistant", icon: Brain,            shortcut: "⌘A" },
  { id: "profile",   label: "Profile",     path: "/profile",   icon: User,            shortcut: "⌘P" },
  { id: "settings",  label: "Settings",    path: "/settings",  icon: Settings,        shortcut: "⌘," },
];

export function Sidebar({ className }: { className?: string }) {
  const router   = useRouter();
  const pathname = usePathname();
  const user     = useUserProfile();

  const handleSignOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();

    try {
      ["medassist-onboarding", "medassist_debug_mode",
       "medassist_cached_lab_results", "medassist_cached_biomarkers",
       "medassist_cached_real_lab_results", "medassist_cached_real_biomarkers",
       "medassist_cached_demo_lab_results", "medassist_cached_demo_biomarkers",
       "medassist-storage-v2",
      ].forEach(k => localStorage.removeItem(k));
    } catch { /* storage unavailable */ }
    sessionStorage.removeItem("medassist_loaded");
    document.cookie = "onboarding_complete=; max-age=0; path=/";
    router.push("/");
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex w-60 min-h-[100dvh] fixed left-0 top-0 z-40",
        "bg-[#F0EFE9] border-r border-[#E8E6DF] flex-col",
        className
      )}
    >
      {/* ── Logo ── */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-[#E8E6DF]">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-[10px] bg-sky-500 flex items-center justify-center shadow-sm shadow-sky-500/30 group-hover:shadow-sky-500/50 transition-shadow">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-xl text-[#1C1917] tracking-tight">MedAssist</span>
        </Link>
        {/* Live system indicator */}
        <span className="flex h-2 w-2 relative" title="System online">
          <span className="animate-ping absolute h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
          <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      </div>

      {/* ── Navigation ── */}
      <nav className="grow shrink basis-0 px-3 py-4 space-y-0.5">
        <p className="section-label px-3 mb-3">Navigation</p>

        {navItems.map(item => {
          const isActive = pathname?.startsWith(item.path);
          return (
            <Link
              key={item.id}
              href={item.path}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-[10px] min-h-[44px]",
                "text-sm font-medium transition-all duration-150 group",
                "border-l-2",
                isActive
                  ? "bg-[#E0F2FE] text-[#0284C7] border-[#0EA5E9] font-semibold"
                  : "text-[#57534E] hover:bg-[#EFEDE6] hover:text-[#1C1917] border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn("w-4 h-4 transition-transform duration-150",
                    isActive ? "text-[#0EA5E9]" : "text-[#A8A29E] group-hover:text-[#57534E]",
                    "group-hover:scale-110"
                  )}
                />
                {item.label}
              </div>
              <kbd
                className={cn(
                  "text-[10px] font-mono px-1.5 py-0.5 rounded bg-transparent",
                  "opacity-0 group-hover:opacity-100 transition-opacity",
                  isActive ? "text-sky-300" : "text-[#C5C2B8]"
                )}
              >
                {item.shortcut}
              </kbd>
            </Link>
          );
        })}
      </nav>

      {/* ── AI Status ── */}
      <div className="mx-3 mb-3 p-3 bg-[#1C1917] rounded-[12px] border border-[#2C2A27]">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Zap className="w-3 h-3 text-sky-400" />
          <p className="section-label text-[#78716C]">AI Engine</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-[11px] text-[#A8A29E] font-mono">Groq · Llama 3.3</span>
          </div>
          <span className="text-[10px] text-emerald-500 font-semibold">LIVE</span>
        </div>
      </div>

      {/* ── User footer ── */}
      <div className="p-4 border-t border-[#E8E6DF] flex items-center gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-sky-700">
            {user.initials}
          </span>
        </div>

        <div className="grow shrink basis-0 min-w-0">
          <p className="text-sm font-semibold text-[#1C1917] truncate">
            {user.name ?? <span className="text-[#A8A29E] font-normal">Loading…</span>}
          </p>
          <p className="text-[11px] text-[#A8A29E]">Patient</p>
        </div>

        <button
          onClick={handleSignOut}
          className="text-[#A8A29E] hover:text-red-500 transition-colors p-2.5 hover:bg-red-50 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Sign Out"
          style={{ WebkitAppearance: "none" }}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
