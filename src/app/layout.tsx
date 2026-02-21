"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Preloader } from "@/components/ui/preloader";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { BottomMenu } from "@/components/ui/bottom-menu";
import { FeedbackButton } from "@/components/feedback-button";
import { Toaster } from "sonner";
import "./globals.css";

// Pages that should show the full app shell
const APP_SHELL_ROUTES = [
  "/dashboard",
  "/results",
  "/assistant",
  "/profile",
  "/settings",
];

// Pages that are completely standalone (no nav, no sidebar)
const STANDALONE_ROUTES = [
  "/",
  "/login",
  "/onboarding",
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  // Determine if current page needs the app shell
  const needsAppShell = APP_SHELL_ROUTES.some(
    route => pathname.startsWith(route)
  );

  // Determine if this is a standalone page
  const isStandalone = STANDALONE_ROUTES.some(
    route => pathname === route || (route !== "/" && pathname.startsWith(route))
  );

  // Preloader — only on first app shell load
  useEffect(() => {
    if (needsAppShell) {
      const hasLoaded = sessionStorage.getItem("medassist_loaded");
      if (!hasLoaded) {
        setLoading(true);
      }
    }
  }, [needsAppShell]);

  const handlePreloaderComplete = () => {
    sessionStorage.setItem("medassist_loaded", "true");
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
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, 
                   maximum-scale=1, viewport-fit=cover"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-[#FAFAF7] font-sans overflow-x-hidden"
        style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
      >

        {/* ── STANDALONE PAGES (landing, auth, onboarding) ── */}
        {/* No sidebar. No bottom nav. No preloader. Just the page. */}
        {isStandalone && (
          <div className="min-h-screen min-h-[100dvh]">
            {children}
          </div>
        )}

        {/* ── APP PAGES (dashboard, results, assistant, etc.) ── */}
        {needsAppShell && (
          <>
            {/* Preloader — first visit only */}
            <Preloader
              visible={loading}
              onComplete={handlePreloaderComplete}
              variant="pipeline"
            />

            <div
              className="flex min-h-screen min-h-[100dvh]"
              style={{ visibility: loading ? "hidden" : "visible" }}
            >
              {/* Desktop sidebar — hidden on standalone pages */}
              <aside className="
                hidden lg:flex
                w-60 min-h-screen min-h-[100dvh]
                fixed left-0 top-0 z-40
                flex-col
              ">
                <Sidebar />
              </aside>

              {/* Mobile sidebar drawer */}
              <MobileSidebar />

              {/* Main content */}
              <main className="
                flex-1
                lg:ml-60
                min-h-screen min-h-[100dvh]
                overflow-y-auto
                pb-[calc(5rem+env(safe-area-inset-bottom))]
                lg:pb-0
                page-enter
              ">
                {children}
              </main>
            </div>

            {/* Bottom nav — mobile only, app pages only */}
            <div className="lg:hidden">
              <BottomMenu activeId={activeId} />
            </div>
          </>
        )}

        {/* ── FALLBACK: any other route ── */}
        {!isStandalone && !needsAppShell && (
          <div className="min-h-screen">
            {children}
          </div>
        )}

        {/* Global UI Elements */}
        <FeedbackButton />
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
