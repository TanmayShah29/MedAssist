import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const { pathname } = request.nextUrl

    // ALWAYS allow landing page
    if (pathname === '/') {
        return response
    }

    // Public paths — anyone can access
    const publicPaths = ['/auth', '/auth/callback']
    // Allow public paths and anything starting with /auth/ (like /auth/callback)
    const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/auth/')

    // API routes — never redirect
    if (pathname.startsWith('/api/')) {
        return response
    }

    // --- Not logged in ---
    if (!user && !isPublicPath) {
        const url = new URL('/auth', request.url)
        url.searchParams.set('mode', 'login')
        return NextResponse.redirect(url)
    }

    // --- Logged in ---
    if (user) {
        let onboardingComplete = false
        const cachedOnboarding = request.cookies.get('onboarding_complete')?.value
        let needToSetCookie = false

        if (cachedOnboarding !== undefined) {
            onboardingComplete = cachedOnboarding === 'true'
        } else {
            const { data: profile } = await supabase
                .from('profiles')
                .select('onboarding_complete')
                .eq('id', user.id)
                .single()

            onboardingComplete = profile?.onboarding_complete === true
            needToSetCookie = true
        }

        // Helper to redirect and set cookie if needed
        const redirect = (path: string) => {
            const res = NextResponse.redirect(new URL(path, request.url))
            // Copy cookies from specific Supabase response to the redirect response
            // (Supabase client might have refreshed the session in getUser)
            //  Actually, we should manually copy all cookies from the `response` object we created earlier
            const cookiesToSet = response.cookies.getAll()
            cookiesToSet.forEach(c => res.cookies.set(c))

            if (needToSetCookie) {
                res.cookies.set('onboarding_complete', String(onboardingComplete), {
                    httpOnly: true,
                    maxAge: 60 * 60 * 24 * 7 // 7 days
                })
            }
            return res
        }

        // Scenario A: Accessing protected app pages
        if (!isPublicPath) {
            // User needs to complete onboarding but isn't there
            if (!onboardingComplete && pathname !== '/onboarding') {
                return redirect('/onboarding')
            }
            // User completed onboarding but tries to go back to it
            if (onboardingComplete && pathname === '/onboarding') {
                return redirect('/dashboard')
            }
            // Normal access: just Ensure cookie is set on the response if needed
            if (needToSetCookie) {
                response.cookies.set('onboarding_complete', String(onboardingComplete), {
                    httpOnly: true,
                    maxAge: 60 * 60 * 24 * 7 // 7 days
                })
            }
            return response
        }

        // Scenario B: Accessing Auth page while logged in
        if (pathname === '/auth') {
            // Redirect to dashboard or onboarding based on status
            return redirect(onboardingComplete ? '/dashboard' : '/onboarding')
        }
    }

    return response
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
