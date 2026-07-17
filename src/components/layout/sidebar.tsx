"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { cn } from "@/lib/utils";
import { signOutAndResetMedAssist } from "@/lib/account-session";
import {
  LayoutDashboard,
  Brain,
  FlaskConical,
  User,
  Settings,
  LogOut,
  Zap,
  ListChecks,
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { BrandLockup } from "@/components/branding/brand-lockup";

const navItems = [
  { id: "dashboard", label: "Today", path: "/dashboard", icon: LayoutDashboard, shortcut: "⌘D" },
  { id: "results",   label: "Labs", path: "/results",   icon: FlaskConical,    shortcut: "⌘R" },
  { id: "plan",      label: "Plan", path: "/plan", icon: ListChecks, shortcut: "⌘L" },
  { id: "assistant", label: "Assistant",path: "/assistant", icon: Brain,            shortcut: "⌘A" },
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
    await signOutAndResetMedAssist(supabase);
    router.push("/");
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex min-h-[100dvh] fixed left-0 top-0 z-40",
        "w-[17rem] bg-[#F0EFE9]/95 border-r border-[#EBEAE4] flex-col shadow-[8px_0_32px_rgba(28,25,23,0.04)]",
        className
      )}
    >
      {/* ── Logo ── */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-[#EBEAE4]">
        <Link href="/dashboard" className="group">
          <BrandLockup showTagline markClassName="transition-transform group-hover:-rotate-3 group-hover:scale-105" />
        </Link>
        {/* Live system indicator */}
        <span className="flex h-2 w-2 relative" title="System online">
          <span className="animate-ping absolute h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
          <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      </div>

      {/* ── Navigation ── */}
      <nav className="grow shrink basis-0 px-3 py-5 space-y-1">
        <p className="section-label px-3 mb-3">Navigation</p>

        {navItems.map(item => {
          const isActive = pathname?.startsWith(item.path);
          return (
            <Link
              key={item.id}
              href={item.path}
              className={cn(
                "flex items-center justify-between px-3.5 py-3 rounded-[12px] min-h-[46px]",
                "text-sm font-medium transition-all duration-200 ease-out group",
                "border-l-2",
                isActive
                  ? "bg-[#F0F9FF] text-[#0ea5e9] border-[#0ea5e9] font-semibold"
                  : "text-[#475569] hover:bg-[#FAFAFA] hover:text-[#0F172A] hover:translate-x-0.5 border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn("w-4 h-4 transition-transform duration-200",
                    isActive ? "text-[#0ea5e9]" : "text-[#64748B] group-hover:text-[#475569]",
                    "group-hover:scale-110"
                  )}
                />
                {item.label}
              </div>
              <kbd
                className={cn(
                  "text-[10px] font-mono px-1.5 py-0.5 rounded bg-transparent hidden xl:inline",
                  "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                  isActive ? "text-sky-300" : "text-[#64748B]"
                )}
                aria-hidden="true"
              >
                {item.shortcut}
              </kbd>
            </Link>
          );
        })}
      </nav>

      {/* ── AI Status (decorative — not a real system-status indicator) ── */}
      <div className="mx-3 mb-3 p-4 bg-[#0F172A] rounded-[14px] border border-[#2C2A27]" aria-hidden="true">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Zap className="w-3 h-3 text-sky-400" />
          <p className="section-label text-[#94A3B8]">Prep Engine</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0 soft-pulse" />
            <span className="text-[11px] text-[#94A3B8]">Private prep active</span>
          </div>
          <span className="text-[10px] text-emerald-500 font-semibold">Ready</span>
        </div>
      </div>

      {/* ── User footer ── */}
      <div className="p-4 border-t border-[#EBEAE4] flex items-center gap-3 bg-[#FFFFFF]/70">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center flex-shrink-0">
          {user.isLoading ? (
            <span className="h-3 w-3 rounded-full bg-sky-200 animate-pulse" aria-hidden />
          ) : (
            <span className="text-xs font-bold text-sky-700">
              {user.initials === "?" ? "P" : user.initials}
            </span>
          )}
        </div>

        <div className="grow shrink basis-0 min-w-0">
          <p className="text-sm font-semibold text-[#0F172A] truncate">
            {user.isLoading ? (
              <span className="inline-block h-3 w-24 rounded bg-[#EBEAE4] animate-pulse" aria-hidden />
            ) : (
              user.name ?? "Patient"
            )}
          </p>
          <p className="text-[11px] text-[#64748B]">Patient</p>
        </div>

        <button
          onClick={handleSignOut}
          className="text-[#64748B] hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all duration-200 p-2.5 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Sign Out"
          aria-label="Sign out"
          style={{ WebkitAppearance: "none" }}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
