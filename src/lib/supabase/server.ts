/**
 * Shared server-side Supabase client factory.
 *
 * Use `getAuthClient()` in Server Components, API routes, and Server Actions
 * instead of duplicating the createServerClient + cookie boilerplate.
 *
 * The returned client uses the anon key + request cookies, so it runs as
 * the currently authenticated user and correctly respects Row-Level Security.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in read-only contexts (e.g. Server Components after
            // headers have been sent). Auth token refresh still works
            // because the middleware handles session refresh independently.
          }
        },
      },
    }
  );
}

/** @deprecated Use `getAuthClient()` instead. Kept for backward-compat with existing imports. */
export const createClient = getAuthClient;
