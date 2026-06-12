import { z } from "zod";
import { MAX_SYMPTOMS_PER_REQUEST } from "@/lib/constants";

export const AskAiRequestSchema = z.object({
    question: z.string().trim().min(1, 'Question is required').max(1000, 'Question is too long'),
    symptoms: z.array(z.string()).max(MAX_SYMPTOMS_PER_REQUEST, `Too many symptoms (max ${MAX_SYMPTOMS_PER_REQUEST})`).optional().default([]),
});

export const GenerateQuestionsRequestSchema = z.object({
    biomarkers: z.array(z.object({
        name: z.string().min(1).max(200),
        value: z.union([z.number(), z.string()])
            .transform(v => Number(v))
            .refine(n => !Number.isNaN(n), { message: 'value must be numeric' }),
        unit: z.string().max(50),
        status: z.enum(['optimal', 'warning', 'critical']),
        reference_range_min: z.number().nullable().optional(),
        reference_range_max: z.number().nullable().optional(),
    })).optional().default([]),
});

export const GeneratedQuestionsSchema = z.object({
    questions: z.array(z.object({
        question: z.string(),
        context: z.string(),
    })).min(1),
});

export const FeedbackSchema = z.object({
    message: z.string().trim().min(3, 'Message is required (min 3 characters).').max(2000, 'Message too long.'),
    url: z.string().url('Invalid URL').nullable().optional()
});

export const SupplementSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    dosage: z.string().optional().nullable(),
    frequency: z.string().optional().nullable(),
    start_date: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
        message: 'Invalid start_date. Use YYYY-MM-DD.'
    })
});

export const FormSymptomsSchema = z.array(z.string().trim().min(1)).max(30).catch([]);

export const ManualPayloadBiomarkerSchema = z.object({
    name: z.string().trim().min(1),
    value: z.union([z.number(), z.string()]).transform(v => Number(v)).refine(n => !Number.isNaN(n)),
    unit: z.string().trim().default('unit').transform(u => u || 'unit')
});

export const ManualPayloadSchema = z.object({
    biomarkers: z.array(ManualPayloadBiomarkerSchema).min(1, 'Please add at least one biomarker with a valid name and numeric value.')
});
