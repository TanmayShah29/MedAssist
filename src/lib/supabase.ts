
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// SERVER-SIDE ADMIN CLIENT
// This client should only be used on the server.
// It requires the SUPABASE_SERVICE_ROLE_KEY.
export const supabaseAdmin = (() => {
    if (typeof window !== 'undefined') {
        return null; // Don't create admin client in browser
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        if (process.env.NODE_ENV === 'production') {
            // SECURITY HARDENING
            // console.error("FATAL: Missing `SUPABASE_SERVICE_ROLE_KEY` on server.");
            // We return null instead of throwing to prevent build crashes if this file is imported but not used.
            return null;
        } else {
            console.warn("⚠ [DEV] Missing `SUPABASE_SERVICE_ROLE_KEY`. Admin features will fail.");
            return null;
        }
    }

    // Validation
    if (supabaseKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn("⚠ [DEV] `SUPABASE_SERVICE_ROLE_KEY` matches Anon Key. Logic will bypass RLS check but this is insecure.");
    }

    return createSupabaseClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    });
})();


// CLIENT-SIDE CLIENT
// Safe to use in browser components. Uses Anon Key.
export const createClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing Supabase public environment variables");
        // Return a dummy client or throw? 
        // Throwing is better so developer knows setup is wrong.
        throw new Error("Missing Supabase public environment variables");
    }

    return createSupabaseClient(supabaseUrl, supabaseKey);
};
