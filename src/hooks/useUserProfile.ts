"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export interface UserProfile {
  name: string | null;
  initials: string;
  email: string | null;
}

const DEFAULT: UserProfile = { name: null, initials: "?", email: null };

/**
 * Shared hook that fetches + caches the authenticated user's display name
 * and initials. Used by Sidebar, MobileNavbar, and any other component
 * that needs to show user identity.
 *
 * Priority:
 *   1. localStorage medassist-onboarding (fastest, avoids network)
 *   2. Supabase profiles table
 *   3. Supabase auth email fallback
 */
export function useUserProfile(): UserProfile {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchProfile = async () => {
      // 1. Try localStorage first for an optimistic first paint only.
      // Do not return early: onboarding storage can be stale after profile
      // edits, account deletion, or a new account on the same device.
      try {
        const stored = localStorage.getItem("medassist-onboarding");
        if (stored) {
          const parsed = JSON.parse(stored);
          const firstName = parsed?.state?.basicInfo?.firstName as string | undefined;
          const lastName = parsed?.state?.basicInfo?.lastName as string | undefined;
          if (firstName) {
            setProfile({
              name: `${firstName} ${lastName ?? ""}`.trim(),
              initials: `${firstName[0]}${lastName?.[0] ?? ""}`.toUpperCase(),
              email: null,
            });
          }
          // Legacy shape
          else if (parsed?.name) {
            setProfile({ name: parsed.name, initials: parsed.name[0].toUpperCase(), email: null });
          }
        }
      } catch {
        // localStorage unavailable — fall through
      }

      // 2. Supabase auth + profile table
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      if (prof?.first_name) {
        const firstName = prof.first_name as string;
        const lastName = (prof.last_name ?? "") as string;
        setProfile({
          name: `${firstName} ${lastName}`.trim(),
          initials: `${firstName[0]}${lastName[0] ?? ""}`.toUpperCase(),
          email: user.email ?? null,
        });
      } else {
        // 3. Email fallback
        const emailName = user.email?.split("@")[0] ?? "Patient";
        setProfile({
          name: emailName,
          initials: emailName[0].toUpperCase(),
          email: user.email ?? null,
        });
      }
    };

    fetchProfile();

    // Re-fetch when profile is updated by another component
    const handler = () => fetchProfile();
    window.addEventListener("medassist_profile_updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("medassist_profile_updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return profile;
}
