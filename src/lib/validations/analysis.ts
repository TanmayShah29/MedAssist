import { z } from "zod";

export const BiomarkerStatusSchema = z.enum(["optimal", "warning", "critical"]);
export const BiomarkerCategorySchema = z.string().transform(val => {
    const valid = ["hematology", "inflammation", "metabolic", "vitamins", "other"] as const;
    const lowered = val.toLowerCase();
    return (valid.includes(lowered as any) ? lowered : "other") as typeof valid[number];
});

export const BiomarkerSchema = z.object({
    name: z.string().min(1, "Biomarker name is required"),
    value: z.coerce.number(),
    unit: z.string().default("unit"),
    referenceMin: z.coerce.number().nullable(),
    referenceMax: z.coerce.number().nullable(),
    status: BiomarkerStatusSchema,
    category: BiomarkerCategorySchema,
    confidence: z.number().min(0).max(1).default(0.8),
    aiInterpretation: z.string().min(5, "Interpretation is too short"),
});

export const ExtractionResultSchema = z.object({
    biomarkers: z.array(BiomarkerSchema),
    healthScore: z.number().int().min(0).max(100),
    riskLevel: z.enum(["low", "moderate", "high"]),
    summary: z.string().min(10, "Summary is too short"),
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;
export type BiomarkerResult = z.infer<typeof BiomarkerSchema>;
