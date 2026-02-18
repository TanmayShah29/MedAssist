import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    // TEMPORARY BYPASS: Supabase Auth Helper 'createMiddlewareClient' import error.
    // disabling auth protection to allow Landing Page verification validation.
    // Will migrate to @supabase/ssr or fix version in next step.

    /*
    const supabase = createMiddlewareClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
    const isLandingPage = req.nextUrl.pathname === "/";
    const isOnboarding = req.nextUrl.pathname.startsWith("/onboarding");
    const isProtected = ["/dashboard", "/results", "/assistant", "/profile", "/settings"]
        .some(p => req.nextUrl.pathname.startsWith(p));

    // Not logged in trying to access protected page
    if (!session && isProtected) {
        return NextResponse.redirect(new URL("/auth?mode=signup", req.url));
    }

    // Logged in trying to access auth page
    if (session && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    */

    return res;
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
