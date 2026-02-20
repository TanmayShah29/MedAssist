import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Since we want to delete the user entirely, we need service role keys
    const adminSupabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                get() { return null },
                set() { },
                remove() { }
            },
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    try {
        // Delete user from auth.users. Cascading will take care of the rest if ON DELETE CASCADE is set.
        const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id);

        if (deleteError) {
            throw deleteError;
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to delete account' }, { status: 500 })
    }
}
