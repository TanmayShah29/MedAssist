"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";

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
  const [consent, setConsent] = useState<ConsentChoice>(getStoredConsent);
  const [show, setShow] = useState(false);
  const [recording, setRecording] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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

  if (!show) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-gray-200 bg-white p-4 shadow-lg"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-700">
          MedAssist processes your lab report data using AI to provide health
          insights. Your data is encrypted in transit and at rest. You can delete
          your data at any time from your profile settings.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => recordConsent("rejected")}
            disabled={recording}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Decline
          </button>
          <button
            onClick={() => recordConsent("accepted")}
            disabled={recording}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {recording ? "Saving…" : "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}
