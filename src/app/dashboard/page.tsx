import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { waitUntil } from '@vercel/functions'
import DashboardClient from './dashboard-client'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { mergeBiomarkerSources } from '@/lib/medical-data'
import { logAuditEvent } from '@/lib/audit-log'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Visit Prep Dashboard | MedAssist',
    description: 'Your appointment-ready lab summary, trends, and doctor questions.'
};

async function DashboardContent({ user }: { user: { id: string } }) {
    const cookieStore = await cookies()
    const headerList = await headers()
    const ip = headerList.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const ua = headerList.get('user-agent') || 'unknown'

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
            },
        }
    )

    // Log the access event for compliance
    waitUntil(
        logAuditEvent({
            userId: user.id,
            action: 'ACCESS_DASHBOARD',
            resource: 'dashboard',
            ipAddress: ip,
            userAgent: ua,
        })
    );

    const [profileResponse, biomarkerResponse, symptomResponse, labResponse] = await Promise.all([
        supabase.from('profiles').select('id, first_name, last_name, age, sex, blood_type, onboarding_complete').eq('id', user.id).single(),
        supabase
            .from('biomarkers')
            .select('*, lab_results!inner(user_id, uploaded_at, created_at)')
            .eq('lab_results.user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(200),
        supabase.from('symptoms').select('symptom').eq('user_id', user.id),
        supabase.from('lab_results')
            .select('*')
            .eq('user_id', user.id)
            .order('uploaded_at', { ascending: false }) // Bug 2: was created_at (doesn't exist)
            .limit(10)
    ])

    const profile = profileResponse.data
    const symptoms = (symptomResponse.data || []).map((s: { symptom: string }) => s.symptom)
    const labResults = labResponse.data || []
    const biomarkers = mergeBiomarkerSources(
        biomarkerResponse.data as import('@/types/medical').Biomarker[] | null,
        labResults
    )

    return (
        <DashboardClient
            initialProfile={profile}
            initialBiomarkers={biomarkers}
            initialSymptoms={symptoms}
            initialLabResults={labResults}
        />
    )
}

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
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/auth?mode=login')
    }

    return (
        <ErrorBoundary>
            <Suspense fallback={<div className="min-h-[100dvh] bg-[#FAFAF7] flex items-center justify-center"><Skeleton className="h-8 w-48 rounded-xl" /></div>}>
                <DashboardContent user={user} />
            </Suspense>
        </ErrorBoundary>
    )
}
