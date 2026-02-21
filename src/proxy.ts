import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Landing page — NEVER redirect, always show
    if (pathname === '/') {
        return NextResponse.next()
    }

    // Legacy /login → show sign-in form
    if (pathname === '/login') {
        return NextResponse.redirect(new URL('/auth?mode=login', request.url))
    }

    // /upload does not exist; send to dashboard where upload modal lives
    if (pathname === '/upload') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Static files and API — never redirect
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/auth') ||
        pathname === '/terms' ||
        pathname === '/privacy' ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }


    // Check auth session
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
                }
            }
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Not signed in — redirect to auth
    if (!user) {
        return NextResponse.redirect(new URL('/auth', request.url))
    }

    // Signed in — check onboarding
    const cachedOnboarding = request.cookies.get('onboarding_complete')?.value
    let onboardingComplete: boolean

    if (cachedOnboarding === 'true') {
        onboardingComplete = true
    } else if (cachedOnboarding === 'false') {
        onboardingComplete = false
    } else {
        const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_complete')
            .eq('id', user.id)
            .single()
        onboardingComplete = profile?.onboarding_complete === true
        response.cookies.set('onboarding_complete', String(onboardingComplete), {
            httpOnly: false,
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        })
    }

    // Signed in but onboarding incomplete — send to onboarding
    if (!onboardingComplete && pathname !== '/onboarding') {
        return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // Signed in and onboarding complete but trying to access onboarding
    if (onboardingComplete && pathname === '/onboarding') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)']
}
