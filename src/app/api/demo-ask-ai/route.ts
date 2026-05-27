import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/services/rateLimitService';
import { answerHealthQuestion, streamHealthQuestion } from '@/lib/groq-medical';
import { z } from 'zod';

export const maxDuration = 30;
export const runtime = 'nodejs';

const requestSchema = z.object({
    question: z.string().trim().min(1).max(1000),
    symptoms: z.array(z.string()).optional().default([]),
});

// Demo biomarkers — matches the static demo data on the /demo page
const DEMO_BIOMARKERS = [
    { name: 'Glucose', value: 106, unit: 'mg/dL', status: 'warning', reference_range_min: 70, reference_range_max: 99, ai_interpretation: 'Glucose is above the report range and has risen from the prior result, which could be worth reviewing with a clinician.' },
    { name: 'Vitamin D', value: 42, unit: 'ng/mL', status: 'optimal', reference_range_min: 30, reference_range_max: 80, ai_interpretation: 'Vitamin D is within the report range and improved from the prior result; ask what maintenance monitoring makes sense.' },
    { name: 'LDL Cholesterol', value: 145, unit: 'mg/dL', status: 'warning', reference_range_min: 0, reference_range_max: 100, ai_interpretation: 'LDL is above the report range; ask whether lifestyle context, repeat testing, or medication discussion is appropriate.' },
    { name: 'HDL Cholesterol', value: 58, unit: 'mg/dL', status: 'optimal', reference_range_min: 40, reference_range_max: 100, ai_interpretation: 'HDL is within the report range and can be discussed as part of the overall cholesterol picture.' },
    { name: 'Hemoglobin', value: 11.8, unit: 'g/dL', status: 'warning', reference_range_min: 13.5, reference_range_max: 17.5, ai_interpretation: 'Hemoglobin is below the report range and has decreased from the prior result; ask what follow-up context or testing is needed.' },
    { name: 'TSH', value: 2.4, unit: 'uIU/mL', status: 'optimal', reference_range_min: 0.4, reference_range_max: 4.0, ai_interpretation: 'TSH is within the report range.' },
    { name: 'Magnesium', value: 2.1, unit: 'mg/dL', status: 'optimal', reference_range_min: 1.7, reference_range_max: 2.3, ai_interpretation: 'Magnesium is within the report range.' },
    { name: 'C-Reactive Protein', value: 1.2, unit: 'mg/L', status: 'optimal', reference_range_min: 0, reference_range_max: 3.0, ai_interpretation: 'CRP is within the report range; discuss it alongside symptoms and other results if relevant.' },
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
        const wantsStream = request.headers.get('accept')?.includes('text/plain');
        if (wantsStream) {
            const encoder = new TextEncoder();
            const stream = await streamHealthQuestion(
                question,
                DEMO_BIOMARKERS,
                symptoms.length > 0 ? symptoms : ['Fatigue', 'Low Energy'],
                [],
                DEMO_PROFILE
            );

            const responseStream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of stream) {
                            const text = chunk.choices[0]?.delta?.content || '';
                            if (text) controller.enqueue(encoder.encode(text));
                        }
                    } catch (error) {
                        controller.error(error);
                        return;
                    }
                    controller.close();
                }
            });

            return new Response(responseStream, {
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Cache-Control': 'no-cache, no-transform',
                    'X-Accel-Buffering': 'no',
                },
            });
        }

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
