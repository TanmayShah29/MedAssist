"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { MotionProps } from "framer-motion";
import { Preloader } from "@/components/ui/preloader";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNavbar } from "@/components/layout/mobile-navbar";
import { BottomMenu } from "@/components/ui/bottom-menu";
import { FeedbackButton } from "@/components/feedback-button";
import { ConsentBanner } from "@/components/consent-banner";
import { Toaster } from "sonner";
import { APP_SHELL_ROUTES, isAppShellRoute } from "@/lib/app-shell";
import { useNavShortcuts } from "@/hooks/useNavShortcuts";

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
  const prefersReducedMotion = useReducedMotion();
  useNavShortcuts();

  const pathname = nextPathname || initialPathname || "";
  const pageMotion: MotionProps = prefersReducedMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0 } }
    : {
      initial: { opacity: 0, y: 10, filter: "blur(2px)" },
      animate: { opacity: 1, y: 0, filter: "blur(0px)" },
      exit: { opacity: 0, y: -6, filter: "blur(2px)" },
      transition: { duration: 0.18, ease: "easeOut" },
    };
  const standalonePageMotion: MotionProps = prefersReducedMotion
    ? pageMotion
    : {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.18, ease: "easeOut" },
    };

  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem("medassist_loaded");
  });

  const needsAppShell = pathname ? appShellRoutes.some(
    route => pathname.startsWith(route)
  ) : false;

  const isStandalone = pathname ? standaloneRoutes.some(
    route => pathname === route || (route !== "/" && pathname.startsWith(route))
  ) : false;

  const handlePreloaderComplete = () => {
    try {
      sessionStorage.setItem("medassist_loaded", "true");
    } catch (_e) { }
    setLoading(false);
  };

  const mobileNavOffset = isAppShellRoute(pathname);

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
      {isStandalone && (
        <div className="min-h-[100dvh] overflow-x-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={pathname} {...standalonePageMotion}>
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {needsAppShell && (
        <>
          <Preloader
            visible={loading}
            onComplete={handlePreloaderComplete}
            variant="pipeline"
          />

          <MobileNavbar />

          <div
            className="flex min-h-[100dvh] bg-transparent"
            style={{ visibility: loading ? "hidden" : "visible" }}
          >
            <aside className="
                hidden lg:flex
                w-[17rem] min-h-[100dvh]
                fixed left-0 top-0 z-40
                flex-col
              ">
              <Sidebar />
            </aside>
            <main className="
                grow shrink basis-0
                lg:ml-[17rem]
                min-h-[100dvh]
                flex flex-col
                overflow-x-hidden
                pt-[calc(3.5rem+env(safe-area-inset-top))] lg:pt-0
                pb-[calc(5rem+env(safe-area-inset-bottom))]
                lg:pb-0
              ">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={pathname} className="min-h-[100dvh]" {...pageMotion}>
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>

          <div className="lg:hidden">
            <BottomMenu />
          </div>
        </>
      )}

      {!isStandalone && !needsAppShell && (
        <div className="min-h-[100dvh] overflow-x-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={pathname} {...pageMotion}>
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      <ConsentBanner />
      <FeedbackButton />
      <Toaster
        position="bottom-center"
        offset={mobileNavOffset ? "6rem" : "1rem"}
        mobileOffset={mobileNavOffset ? "6rem" : "1rem"}
        toastOptions={{
          classNames: {
            toast: "font-sans",
          },
        }}
      />
    </>
  );
}

// Re-export for layout.tsx convenience
export { APP_SHELL_ROUTES };