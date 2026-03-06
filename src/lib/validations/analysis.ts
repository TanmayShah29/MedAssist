import { z } from "zod";

export const BiomarkerStatusSchema = z.enum(["optimal", "warning", "critical"]);
export const BiomarkerCategorySchema = z.string().transform(val => {
    const valid = ["hematology", "inflammation", "metabolic", "vitamins", "other"] as const;
    const lowered = val.toLowerCase().trim();
    return (valid as readonly string[]).includes(lowered) ? (lowered as typeof valid[number]) : "other";
});

export const BiomarkerSchema = z.object({
    name: z.string().min(1, "Biomarker name is required"),
    value: z.coerce.number().refine((n) => !Number.isNaN(n), "Value must be a number"),
    unit: z.string().default("unit"),
    referenceMin: z.union([z.coerce.number(), z.null(), z.undefined()]).optional().nullable().transform((v) => (v === undefined || v === null || Number.isNaN(Number(v)) ? null : Number(v))),
    referenceMax: z.union([z.coerce.number(), z.null(), z.undefined()]).optional().nullable().transform((v) => (v === undefined || v === null || Number.isNaN(Number(v)) ? null : Number(v))),
    status: BiomarkerStatusSchema,
    category: BiomarkerCategorySchema,
    confidence: z.number().min(0).max(1).default(0.8),
    aiInterpretation: z.string().min(5, "Interpretation is too short").catch("No interpretation available."),
});

export const ExtractionResultSchema = z.object({
    biomarkers: z.array(BiomarkerSchema),
    healthScore: z.number().int().min(0).max(100),
    riskLevel: z.enum(["low", "moderate", "high"]),
    summary: z.string().min(10, "Summary is too short"),
    plainSummary: z.string().optional().default(""),
    symptomConnections: z.array(z.object({
        symptom: z.string(),
        relatedBiomarkers: z.array(z.string()),
        explanation: z.string()
    })).optional().default([])
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;
export type BiomarkerResult = z.infer<typeof BiomarkerSchema>;
