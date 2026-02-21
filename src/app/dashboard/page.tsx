import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import DashboardClient from './dashboard-client'

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
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
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Ignored
                    }
                }
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/auth?mode=login')
    }

    const [profileResponse, biomarkerResponse, symptomResponse, labResponse] = await Promise.all([
        supabase.from('profiles').select('id, first_name, last_name, onboarding_complete').eq('id', user.id).single(),
        supabase.from('biomarkers').select('*').eq('user_id', user.id).order('id', { ascending: false }),
        supabase.from('symptoms').select('symptom').eq('user_id', user.id),
        supabase.from('lab_results')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
    ])

    const profile = profileResponse.data
    const biomarkers = (biomarkerResponse.data || []) as any[]
    const symptoms = (symptomResponse.data || []).map((s: { symptom: string }) => s.symptom)
    const labResults = labResponse.data || []

    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center"><div className="animate-pulse rounded-xl bg-[#E8E6DF] h-8 w-48" /></div>}>
            <DashboardClient
                initialProfile={profile}
                initialBiomarkers={biomarkers}
                initialSymptoms={symptoms}
                initialLabResults={labResults}
            />
        </Suspense>
    )
}
