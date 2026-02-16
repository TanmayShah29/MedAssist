import { createClient } from '@supabase/supabase-js';

// SERVER-SIDE ONLY CLIENT
// Uses Service Role Key (or Anon Key as fallback) to interact with Supabase.
// NEVER expose this client to the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// SECTION 2: ENSURE SERVICE ROLE SECURITY
// We explicitly check for the Service Role Key.
// CRITICAL: Fail hard if missing. No silent fallback to Anon key.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV === 'production') {
        // SECURITY HARDENING: Do not allow application to start without proper privileges for critical services in PROD
        throw new Error(
            "FATAL: Missing `SUPABASE_SERVICE_ROLE_KEY`. Rate limiting and admin tasks require high-privilege access."
        );
    } else {
        console.warn("⚠ [DEV] Missing `SUPABASE_SERVICE_ROLE_KEY`. Rate limiting features will fail securely.");
    }
}

// Validation: Ensure we are not accidentally using a leaked public key as a service key
if (supabaseKey && (supabaseKey.startsWith('sbp_') || supabaseKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    // Warning for developer: You might be using the wrong key, but we won't crash just for the prefix check
    // unless it's an exact match to the anon key.
    if (supabaseKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error("FATAL: `SUPABASE_SERVICE_ROLE_KEY` is identical to Anon Key. This is a security risk.");
        } else {
            console.warn("⚠ [DEV] `SUPABASE_SERVICE_ROLE_KEY` matches Anon Key. Logic will bypass RLS check but this is insecure.");
        }
    }
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    }
});
