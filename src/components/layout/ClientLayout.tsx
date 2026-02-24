"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Preloader } from "@/components/ui/preloader";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
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

  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if current page needs the app shell
  const needsAppShell = pathname ? appShellRoutes.some(
    route => pathname.startsWith(route)
  ) : false;

  // Determine if this is a standalone page
  const isStandalone = pathname ? standaloneRoutes.some(
    route => pathname === route || (route !== "/" && pathname.startsWith(route))
  ) : false;

  // Preloader — only on first app shell load
  useEffect(() => {
    if (needsAppShell && mounted) {
      try {
        const hasLoaded = sessionStorage.getItem("medassist_loaded");
        if (!hasLoaded) {
          setLoading(true);
        }
      } catch (e) {
        // Silently fail if sessionStorage is unavailable (e.g. Private Mode)
        console.warn("sessionStorage unavailable", e);
      }
    }
  }, [needsAppShell, mounted]);

  const handlePreloaderComplete = () => {
    try {
      sessionStorage.setItem("medassist_loaded", "true");
    } catch (e) { }
    setLoading(false);
  };

  // Active nav item for bottom menu
  const activeId = pathname.includes("assistant") ? "assistant"
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
        <div className="min-h-[100dvh]">
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
            <MobileSidebar />
            <main className="
                flex-1
                lg:ml-60
                min-h-[100dvh]
                overflow-y-auto
                pb-[calc(5rem+env(safe-area-inset-bottom))]
                lg:pb-0
                page-enter
              ">
              {children}
            </main>
          </div>

          <div className="lg:hidden">
            <BottomMenu activeId={activeId} />
          </div>
        </>
      )}

      {/* ── FALLBACK ── */}
      {!isStandalone && !needsAppShell && (
        <div className="min-h-screen">
          {children}
        </div>
      )}

      <FeedbackButton />
      <Toaster position="bottom-center" />
    </>
  );
}
