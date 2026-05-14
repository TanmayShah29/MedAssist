"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useMemo, useState } from "react";

export type LandingAccountState = "visitor" | "stale" | "onboarding" | "dashboard";

export function useLandingAccount() {
  const [accountState, setAccountState] = useState<LandingAccountState>("visitor");

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  useEffect(() => {
    let mounted = true;

    const loadAccountState = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !user) {
        setAccountState(session ? "stale" : "visitor");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (profileError || !profile) {
        setAccountState("stale");
        return;
      }

      setAccountState(profile.onboarding_complete ? "dashboard" : "onboarding");
    };

    loadAccountState();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const appCtaPath =
    accountState === "dashboard"
      ? "/dashboard"
      : accountState === "onboarding"
        ? "/onboarding"
        : "/auth?mode=signup";
  const appCtaLabel =
    accountState === "dashboard"
      ? "Dashboard"
      : accountState === "onboarding"
        ? "Continue setup"
        : "Get started";
  return {
    accountState,
    appCtaLabel,
    appCtaPath,
    isSignedIn: accountState !== "visitor",
    setAccountState,
    showResetSession: accountState !== "visitor",
    supabase,
  };
}
