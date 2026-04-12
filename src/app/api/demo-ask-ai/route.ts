import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/services/rateLimitService';
import { answerHealthQuestion } from '@/lib/groq-medical';
import { z } from 'zod';

export const maxDuration = 30;
export const runtime = 'nodejs';

const requestSchema = z.object({
    question: z.string().trim().min(1).max(1000),
    symptoms: z.array(z.string()).optional().default([]),
});

// Demo biomarkers — matches the static demo data on the /demo page
const DEMO_BIOMARKERS = [
    { name: 'Glucose', value: 106, unit: 'mg/dL', status: 'warning', reference_range_min: 70, reference_range_max: 99, ai_interpretation: 'Glucose has risen 15% over the last quarter, indicating a pre-diabetic trend.' },
    { name: 'Vitamin D', value: 42, unit: 'ng/mL', status: 'optimal', reference_range_min: 30, reference_range_max: 80, ai_interpretation: 'Excellent recovery from deficiency. D3 supplementation has been highly effective.' },
    { name: 'LDL Cholesterol', value: 145, unit: 'mg/dL', status: 'warning', reference_range_min: 0, reference_range_max: 100, ai_interpretation: 'Borderline high. Increase soluble fiber and Omega-3 intake.' },
    { name: 'HDL Cholesterol', value: 58, unit: 'mg/dL', status: 'optimal', reference_range_min: 40, reference_range_max: 100, ai_interpretation: 'Good protective cholesterol level from regular aerobic exercise.' },
    { name: 'Hemoglobin', value: 11.8, unit: 'g/dL', status: 'warning', reference_range_min: 13.5, reference_range_max: 17.5, ai_interpretation: 'Downward trend detected — a drop of 12.6% since last report. Monitor for fatigue symptoms.' },
    { name: 'TSH', value: 2.4, unit: 'uIU/mL', status: 'optimal', reference_range_min: 0.4, reference_range_max: 4.0, ai_interpretation: 'Thyroid Stimulating Hormone is well within range. Stable thyroid function.' },
    { name: 'Magnesium', value: 2.1, unit: 'mg/dL', status: 'optimal', reference_range_min: 1.7, reference_range_max: 2.3, ai_interpretation: 'Magnesium is in optimal range, supporting healthy muscle and nerve function.' },
    { name: 'C-Reactive Protein', value: 1.2, unit: 'mg/L', status: 'optimal', reference_range_min: 0, reference_range_max: 3.0, ai_interpretation: 'Low CRP indicates minimal systemic inflammation — excellent for cardiovascular health.' },
];

const DEMO_PROFILE = {
    first_name: 'Tanmay',
    age: 22,
    sex: 'male',
    blood_type: 'B+',
};

export async function POST(request: NextRequest) {
    const rateLimitResult = await checkRateLimit();
    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: rateLimitResult.message || 'Too many requests.' },
            { status: 429, headers: { 'Retry-After': (rateLimitResult.retryAfter || 60).toString() } }
        );
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
    }

    const parseResult = requestSchema.safeParse(body);
    if (!parseResult.success) {
        return NextResponse.json({ error: parseResult.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const { question, symptoms } = parseResult.data;

    try {
        const answer = await answerHealthQuestion(
            question,
            DEMO_BIOMARKERS,
            symptoms.length > 0 ? symptoms : ['Fatigue', 'Low Energy'],
            [],
            DEMO_PROFILE
        );
        return NextResponse.json({ answer });
    } catch (error: unknown) {
        if ((error as Error).message?.startsWith('RATE_LIMIT')) {
            return NextResponse.json({ error: (error as Error).message }, { status: 429 });
        }
        return NextResponse.json({ error: 'Failed to get answer. Please try again.' }, { status: 500 });
    }
}
