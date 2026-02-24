import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = (() => {
    if (typeof window !== 'undefined') return null

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
        console.warn('Supabase Admin: Missing environment variables.')
        return null
    }

    // Security & Functionality Check: If the key starts with 'sb_publishable_', it's an anon key, not a service role key.
    if (key.startsWith('sb_publishable_')) {
        console.warn('Supabase Admin: SUPABASE_SERVICE_ROLE_KEY is a publishable key. Admin-only operations (bypassing RLS) will fail, but SECURITY DEFINER RPCs may still work.')
    }

    try {
        return createClient(url, key, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            }
        })
    } catch (err) {
        console.error('Supabase Admin: Failed to initialize client:', err)
        return null
    }
})()
