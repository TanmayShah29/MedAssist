import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { extractAndInterpretBiomarkers } from '@/lib/groq-medical'

export async function POST(request: NextRequest) {
    // 1. Get authenticated user
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse request body
    const { text, symptoms, fileName } = await request.json()

    if (!text || text.length < 50) {
        return NextResponse.json({ error: 'PDF text too short or empty. The PDF may be scanned/image-only.' }, { status: 400 })
    }

    const startTime = Date.now()

    try {
        // 3. Call Groq extraction
        const result = await extractAndInterpretBiomarkers(text, symptoms || [])

        const processingTime = Date.now() - startTime

        // 4. Save lab result record
        const { data: labResult, error: labError } = await supabase
            .from('lab_results')
            .insert({
                user_id: user.id,
                file_name: fileName || 'Lab Report',
                processed: true,
                processing_time_ms: processingTime
            })
            .select()
            .single()

        if (labError) throw new Error('Failed to save lab result: ' + labError.message)

        // 5. Save biomarkers
        if (result.biomarkers.length > 0) {
            const biomarkersToInsert = result.biomarkers.map(b => ({
                user_id: user.id,
                lab_result_id: labResult.id,
                name: b.name,
                value: b.value,
                unit: b.unit,
                status: b.status,
                reference_min: b.referenceMin,
                reference_max: b.referenceMax,
                category: b.category,
                confidence: b.confidence,
                ai_interpretation: b.aiInterpretation
            }))

            const { error: bioError } = await supabase
                .from('biomarkers')
                .insert(biomarkersToInsert)

            if (bioError) throw new Error('Failed to save biomarkers: ' + bioError.message)
        }

        // 6. Save symptoms if provided
        if (symptoms && symptoms.length > 0) {
            const symptomsToInsert = symptoms.map((s: string) => ({
                user_id: user.id,
                symptom: s
            }))
            await supabase.from('symptoms').upsert(symptomsToInsert, { onConflict: 'user_id,symptom' })
        }

        // 7. Return results
        return NextResponse.json({
            success: true,
            biomarkers: result.biomarkers,
            healthScore: result.healthScore,
            riskLevel: result.riskLevel,
            summary: result.summary,
            processingTime,
            labResultId: labResult.id
        })

    } catch (error: any) {
        console.error('Analyze report error:', error)

        if (error.message?.startsWith('RATE_LIMIT')) {
            return NextResponse.json({ error: error.message }, { status: 429 })
        }

        return NextResponse.json(
            { error: error.message || 'Analysis failed. Please try again.' },
            { status: 500 }
        )
    }
}
