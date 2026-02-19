import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = (() => {
    if (typeof window !== 'undefined') return null

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
        console.warn('⚠ Missing SUPABASE_SERVICE_ROLE_KEY')
        return null
    }

    return createClient(url, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    })
})()
