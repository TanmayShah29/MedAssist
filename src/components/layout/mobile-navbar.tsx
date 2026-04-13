"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity } from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';

export function MobileNavbar() {
  const pathname = usePathname();
  const [userInitials, setUserInitials] = useState("?");

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchUser = async () => {
      try {
        const stored = localStorage.getItem("medassist-onboarding");
        if (stored) {
          const parsed = JSON.parse(stored);
          const firstName = parsed?.state?.basicInfo?.firstName;
          const lastName = parsed?.state?.basicInfo?.lastName;
          if (firstName) {
            setUserInitials(`${firstName[0]}${lastName?.[0] || ""}`.toUpperCase());
            return;
          }
        }
      } catch (_e) { }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        if (profile?.first_name) {
          setUserInitials(`${profile.first_name[0]}${profile.last_name?.[0] || ""}`.toUpperCase());
        } else {
          setUserInitials(user.email?.[0].toUpperCase() || "P");
        }
      }
    };

    fetchUser();
    window.addEventListener('medassist_profile_updated', fetchUser);
    return () => window.removeEventListener('medassist_profile_updated', fetchUser);
  }, []);

  // Map path to title
  const getTitle = (path: string) => {
    if (path.includes("/dashboard")) return "Dashboard";
    if (path.includes("/results")) return "Lab Results";
    if (path.includes("/assistant")) return "AI Health Assistant";
    if (path.includes("/profile")) return "Your Profile";
    if (path.includes("/settings")) return "Settings";
    return "MedAssist";
  };

  return (
    <header className="
      lg:hidden fixed top-0 left-0 right-0 z-[60]
      h-14 bg-[#FAFAF7]/80 backdrop-blur-xl border-b border-[#E8E6DF]
      flex items-center justify-between px-3
      safe-area-top
    ">
      <div className="flex items-center gap-2 min-w-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center shadow-sm shadow-sky-500/20">
            <Activity className="w-4 h-4 text-white" />
          </div>
        </Link>
        <span className="font-display text-base text-[#1C1917] tracking-tight font-bold truncate max-w-[140px]">
          {getTitle(pathname)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/profile" className="
          w-8 h-8 rounded-full bg-white border border-[#E8E6DF]
          flex items-center justify-center shadow-sm
          active:scale-95 transition-transform
        ">
          <span className="text-[10px] font-bold text-sky-600">
            {userInitials}
          </span>
        </Link>
      </div>
    </header>
  );
}
