import { NextRequest, NextResponse } from 'next/server'
import { getAuthClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/services/rateLimitService'
import { getAppointmentPrep } from '@/lib/groq-medical'
import { mergeBiomarkerSources } from '@/lib/medical-data'
import { DEMO_HISTORY, DEMO_LAB_RESULT } from '@/lib/demo-data'
import { Biomarker } from '@/types/medical'
import { z } from 'zod'

export const maxDuration = 30
export const runtime = 'nodejs'

const requestSchema = z.object({
    demo: z.boolean().optional().default(false),
})

function toNumber(value: string | number | null | undefined) {
    const parsed = parseFloat(String(value ?? ''))
    return Number.isFinite(parsed) ? parsed : null
}

function buildPrepPayload(biomarkers: Biomarker[], symptoms: string[], profile?: { first_name?: string | null } | null) {
    const sorted = [...biomarkers].sort((a, b) =>
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    )

    const latestByName = Array.from(sorted.reduce((acc, biomarker) => {
        if (!acc.has(biomarker.name)) acc.set(biomarker.name, biomarker)
        return acc
    }, new Map<string, Biomarker>()).values())

    const flagged = latestByName
        .filter(b => b.status === 'critical' || b.status === 'warning')
        .sort((a, b) => (a.status === 'critical' ? -1 : 1) - (b.status === 'critical' ? -1 : 1))
        .slice(0, 5)

    const changes = latestByName.flatMap(current => {
        const currentValue = toNumber(current.value)
        if (currentValue === null) return []

        const previous = sorted.find(candidate =>
            candidate.name === current.name &&
            candidate.id !== current.id &&
            new Date(candidate.created_at || 0).getTime() < new Date(current.created_at || 0).getTime()
        )
        const previousValue = toNumber(previous?.value)
        if (!previous || previousValue === null || previousValue === 0) return []

        const percent = Math.round(((currentValue - previousValue) / previousValue) * 100)
        if (Math.abs(percent) < 5) return []

        return [{
            name: current.name,
            current: `${current.value} ${current.unit || ''}`.trim(),
            previous: `${previous.value} ${previous.unit || ''}`.trim(),
            percent,
            direction: percent > 0 ? 'up' : 'down',
        }]
    }).sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent)).slice(0, 4)

    const context = [
        `Patient first name: ${profile?.first_name || 'Patient'}`,
        `Flagged biomarkers: ${flagged.map(b => `${b.name} ${b.value} ${b.unit || ''} (${b.status})`).join('; ') || 'none'}`,
        `Notable changes: ${changes.map(c => `${c.name} moved from ${c.previous} to ${c.current} (${c.percent > 0 ? '+' : ''}${c.percent}%)`).join('; ') || 'none'}`,
        `Reported symptoms: ${symptoms.join(', ') || 'none reported'}`,
    ].join('\n')

    return { flagged, changes, context }
}

export async function POST(request: NextRequest) {
    const rateLimitResult = await checkRateLimit()
    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: rateLimitResult.message || 'Too many requests.' },
            { status: 429, headers: { 'Retry-After': (rateLimitResult.retryAfter || 60).toString() } }
        )
    }

    let body: unknown
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
    }

    const parseResult = requestSchema.safeParse(body)
    if (!parseResult.success) {
        return NextResponse.json({ error: parseResult.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    }

    if (parseResult.data.demo) {
        const { flagged, changes, context } = buildPrepPayload(DEMO_HISTORY, ['Fatigue', 'Low Energy'], { first_name: 'Tanmay' })
        const prep = await getAppointmentPrep(context)
        return NextResponse.json({
            ...prep,
            flagged,
            changes,
            generatedAt: new Date().toISOString(),
            reportCount: 2,
            latestSummary: DEMO_LAB_RESULT.raw_ai_json.summary,
        })
    }

    const supabase = await getAuthClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [{ data: rawBiomarkers }, { data: labResults }, { data: symptoms }, { data: profile }] = await Promise.all([
        supabase
            .from('biomarkers')
            .select('*, lab_results!inner(user_id, uploaded_at, created_at)')
            .eq('lab_results.user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(120),
        supabase
            .from('lab_results')
            .select('id, uploaded_at, created_at, raw_ai_json, plain_summary, health_score')
            .eq('user_id', user.id)
            .order('uploaded_at', { ascending: false })
            .limit(10),
        supabase.from('symptoms').select('symptom').eq('user_id', user.id),
        supabase.from('profiles').select('first_name').eq('id', user.id).single(),
    ])

    const mergedBiomarkers = mergeBiomarkerSources(rawBiomarkers as Biomarker[] | null, labResults || [])
    const symptomNames = symptoms?.map((item: { symptom: string }) => item.symptom) || []
    const { flagged, changes, context } = buildPrepPayload(mergedBiomarkers, symptomNames, profile)
    const prep = await getAppointmentPrep(context)

    return NextResponse.json({
        ...prep,
        flagged,
        changes,
        generatedAt: new Date().toISOString(),
        reportCount: labResults?.length || 0,
        latestSummary: (labResults?.[0]?.raw_ai_json as { summary?: string } | null)?.summary || labResults?.[0]?.plain_summary || '',
    })
}
