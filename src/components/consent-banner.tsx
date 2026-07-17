"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { AnimatePresence, motion } from "framer-motion";
import { Shield } from "lucide-react";
import { usePathname } from "next/navigation";
import { isAppShellRoute } from "@/lib/app-shell";
import { cn } from "@/lib/utils";

type ConsentChoice = "accepted" | "rejected" | null;

function getStoredConsent(): ConsentChoice {
  if (typeof window === "undefined") return null;
  try {
    const val = sessionStorage.getItem("medassist_consent");
    if (val === "accepted" || val === "rejected") return val;
  } catch {}
  return null;
}

function storeConsent(choice: ConsentChoice) {
  try {
    if (choice) {
      sessionStorage.setItem("medassist_consent", choice);
    } else {
      sessionStorage.removeItem("medassist_consent");
    }
  } catch {}
}

export function ConsentBanner() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<ConsentChoice>(getStoredConsent);
  const [show, setShow] = useState(false);
  const [recording, setRecording] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const needsNavOffset = isAppShellRoute(pathname);

  useEffect(() => {
    if (consent !== null) return;
    const timer = setTimeout(() => setShow(true), 1000);
    return () => clearTimeout(timer);
  }, [consent]);

  const recordConsent = useCallback(
    async (choice: "accepted" | "rejected") => {
      setRecording(true);
      storeConsent(choice);
      setConsent(choice);
      setShow(false);

      const { data: { session } } = await supabase.auth.getSession();

      try {
        await fetch("/api/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            choice,
            userId: session?.user?.id ?? null,
          }),
        });
      } catch {
        // Consent recorded locally even if server fails
      } finally {
        setRecording(false);
      }
    },
    [supabase]
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className={cn(
            "fixed left-0 right-0 z-[110]",
            "border-t border-[#EBEAE4] bg-[#FDFDFB]/98 backdrop-blur-xl",
            "p-4 shadow-[0_-8px_32px_rgba(28,25,23,0.08)]",
            needsNavOffset
              ? "bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-0"
              : "bottom-0 pb-[env(safe-area-inset-bottom)]"
          )}
          style={
            needsNavOffset
              ? undefined
              : { paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }
          }
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 min-w-0">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-sky-50 border border-sky-100">
                <Shield className="h-4 w-4 text-sky-600" aria-hidden />
              </div>
              <p className="text-sm leading-relaxed text-[#475569]">
                MedAssist processes your lab report data using AI to provide health
                insights. Your data is encrypted in transit and at rest. You can delete
                your data at any time from{" "}
                <span className="font-semibold text-[#0F172A]">Settings</span>.
              </p>
            </div>
            <div className="flex shrink-0 gap-2 sm:pl-2">
              <button
                type="button"
                onClick={() => recordConsent("rejected")}
                disabled={recording}
                className="min-h-[44px] rounded-[10px] border-2 border-[#EBEAE4] bg-white px-4 py-2 text-sm font-semibold text-[#475569] transition-all hover:border-sky-200 hover:bg-[#F0F9FF] hover:text-[#0ea5e9] disabled:opacity-50 active:scale-[0.98]"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => recordConsent("accepted")}
                disabled={recording}
                className="min-h-[44px] rounded-[10px] bg-[var(--color-brand-primary)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-brand)] transition-all hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-50 active:scale-[0.98]"
              >
                {recording ? "Saving…" : "Accept"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
