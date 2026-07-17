/** Routes that render the mobile bottom nav + need bottom safe-area offsets. */
export const APP_SHELL_ROUTES = [
  "/dashboard",
  "/results",
  "/plan",
  "/assistant",
  "/profile",
  "/settings",
] as const;

export function isAppShellRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return APP_SHELL_ROUTES.some((route) => pathname.startsWith(route));
}

/** Space above the fixed bottom nav (nav height + safe area). */
export const MOBILE_BOTTOM_NAV_OFFSET = "6rem";
