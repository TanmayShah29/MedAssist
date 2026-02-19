import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    },
                },
            }
        )

        const { data } = await supabase.auth.exchangeCodeForSession(code)

        if (data.user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('onboarding_complete')
                .eq('id', data.user.id)
                .single()

            const onboardingComplete = profile?.onboarding_complete === true;

            // Set cookie for middleware optimization
            cookieStore.set('onboarding_complete', String(onboardingComplete), {
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });

            if (onboardingComplete) {
                return NextResponse.redirect(new URL('/dashboard', request.url))
            } else {
                return NextResponse.redirect(new URL('/onboarding', request.url))
            }
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(new URL('/auth', request.url))
}
