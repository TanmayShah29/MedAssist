const MEDASSIST_LOCAL_KEYS = [
  "medassist-onboarding",
  "medassist_debug_mode",
  "medassist_cached_lab_results",
  "medassist_cached_biomarkers",
  "medassist_cached_real_lab_results",
  "medassist_cached_real_biomarkers",
  "medassist_cached_demo_lab_results",
  "medassist_cached_demo_biomarkers",
  "medassist-storage-v2",
];

function clearCookie(name: string) {
  document.cookie = `${name}=; max-age=0; path=/`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function clearMedAssistLocalState() {
  if (typeof window === "undefined") return;

  try {
    MEDASSIST_LOCAL_KEYS.forEach((key) => localStorage.removeItem(key));
    Object.keys(sessionStorage)
      .filter((key) => key === "medassist_loaded" || key.startsWith("medassist_dq_"))
      .forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // Storage can be unavailable in private browsing or strict browser modes.
  }

  try {
    clearCookie("onboarding_complete");
  } catch {
    // Cookies can be unavailable in some embedded browsers.
  }
}

export function clearSupabaseAuthStorage() {
  if (typeof window === "undefined") return;

  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith("sb-") && key.includes("auth-token"))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // Non-fatal; signOut may still clear the active session.
  }

  try {
    document.cookie
      .split(";")
      .map((cookie) => cookie.split("=")[0]?.trim())
      .filter((name): name is string => Boolean(name))
      .filter((name) => name.startsWith("sb-") && name.includes("auth-token"))
      .forEach(clearCookie);
  } catch {
    // Non-fatal; cookies may be inaccessible.
  }
}

export async function signOutAndResetMedAssist(
  supabase?: { auth?: { signOut: (options?: { scope?: "global" | "local" | "others" }) => Promise<unknown> } }
) {
  try {
    await supabase?.auth?.signOut({ scope: "local" });
  } catch {
    try {
      await supabase?.auth?.signOut();
    } catch {
      // The account may already be deleted server-side. We still clear local state below.
    }
  } finally {
    clearMedAssistLocalState();
    clearSupabaseAuthStorage();
  }
}
