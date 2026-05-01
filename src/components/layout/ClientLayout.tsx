"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Preloader } from "@/components/ui/preloader";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNavbar } from "@/components/layout/mobile-navbar";
import { BottomMenu } from "@/components/ui/bottom-menu";
import { FeedbackButton } from "@/components/feedback-button";
import { Toaster } from "sonner";

interface ClientLayoutProps {
  children: React.ReactNode;
  initialPathname: string | null;
  appShellRoutes: string[];
  standaloneRoutes: string[];
}

export function ClientLayout({
  children,
  initialPathname,
  appShellRoutes,
  standaloneRoutes,
}: ClientLayoutProps) {
  const nextPathname = usePathname();
  // Safely determine pathname, prioritizing client-side usePathname()
  const pathname = nextPathname || initialPathname || "";

  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem("medassist_loaded");
  });

  // Determine if current page needs the app shell
  const needsAppShell = pathname ? appShellRoutes.some(
    route => pathname.startsWith(route)
  ) : false;

  // Determine if this is a standalone page
  const isStandalone = pathname ? standaloneRoutes.some(
    route => pathname === route || (route !== "/" && pathname.startsWith(route))
  ) : false;

  const handlePreloaderComplete = () => {
    try {
      sessionStorage.setItem("medassist_loaded", "true");
    } catch (_e) { }
    setLoading(false);
  };

  // Active nav item for bottom menu
  const _activeId = pathname.includes("assistant") ? "assistant"
    : pathname.includes("results") ? "results"
      : pathname.includes("profile") ? "profile"
        : pathname.includes("settings") ? "settings"
          : "dashboard";

  // Service Worker Registration
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(() => {
          // SW registered
        }).catch(() => {
          // SW registration failed (non-critical)
        });
      });
    }
  }, []);

  return (
    <>
      {/* ── STANDALONE PAGES (landing, auth, onboarding) ── */}
      {isStandalone && (
        <div className="min-h-[100dvh] overflow-x-hidden">
          {children}
        </div>
      )}

      {/* ── APP PAGES (dashboard, results, assistant, etc.) ── */}
      {needsAppShell && (
        <>
          <Preloader
            visible={loading}
            onComplete={handlePreloaderComplete}
            variant="pipeline"
          />

          <MobileNavbar />

          <div
            className="flex min-h-[100dvh]"
            style={{ visibility: loading ? "hidden" : "visible" }}
          >
            <aside className="
                hidden lg:flex
                w-60 min-h-[100dvh]
                fixed left-0 top-0 z-40
                flex-col
              ">
              <Sidebar />
            </aside>
            <main className="
                grow shrink basis-0
                lg:ml-60
                min-h-[100dvh]
                flex flex-col
                overflow-x-hidden
                pt-[calc(3.5rem+env(safe-area-inset-top))] lg:pt-0
                pb-[calc(5rem+env(safe-area-inset-bottom))]
                lg:pb-0
                page-enter
              ">
              {children}
            </main>
          </div>

          <div className="lg:hidden">
            <BottomMenu />
          </div>
        </>
      )}

      {/* ── FALLBACK ── */}
      {!isStandalone && !needsAppShell && (
        <div className="min-h-[100dvh] overflow-x-hidden">
          {children}
        </div>
      )}

      <FeedbackButton />
      <Toaster position="bottom-center" />
    </>
  );
}
