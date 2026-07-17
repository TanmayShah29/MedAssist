"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAppShellRoute } from "@/lib/app-shell";

const SHORTCUT_ROUTES: Record<string, string> = {
  d: "/dashboard",
  r: "/results",
  l: "/plan",
  a: "/assistant",
  p: "/profile",
  ",": "/settings",
};

/**
 * Desktop sidebar keyboard shortcuts (⌘/Ctrl + key). Only active on app-shell routes
 * at lg+ breakpoints where the sidebar is visible.
 */
export function useNavShortcuts() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAppShellRoute(pathname)) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod || event.altKey || event.shiftKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }

      if (window.innerWidth < 1024) return;

      const route = SHORTCUT_ROUTES[event.key.toLowerCase()];
      if (!route) return;

      event.preventDefault();
      router.push(route);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pathname, router]);
}
