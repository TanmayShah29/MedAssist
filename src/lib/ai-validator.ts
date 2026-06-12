import { logger } from "@/lib/logger";

export interface ValidationWarning {
    biomarkerName: string;
    field: string;
    issue: string;
    severity: "warning" | "error";
}

interface PhysiologicalRange {
    min: number;
    max: number;
    unit: string;
}

const PHYSIOLOGICAL_RANGES: Record<string, PhysiologicalRange> = {
    hemoglobin: { min: 2, max: 25, unit: "g/dL" },
    glucose: { min: 10, max: 1000, unit: "mg/dL" },
    potassium: { min: 1, max: 10, unit: "mmol/L" },
    sodium: { min: 100, max: 180, unit: "mmol/L" },
    calcium: { min: 4, max: 18, unit: "mg/dL" },
    creatinine: { min: 0.1, max: 20, unit: "mg/dL" },
    bun: { min: 1, max: 150, unit: "mg/dL" },
    alt: { min: 1, max: 2000, unit: "U/L" },
    ast: { min: 1, max: 2000, unit: "U/L" },
    alp: { min: 10, max: 1000, unit: "U/L" },
    bilirubin: { min: 0.1, max: 50, unit: "mg/dL" },
    albumin: { min: 0.5, max: 7, unit: "g/dL" },
    platelets: { min: 5, max: 1500, unit: "10^3/uL" },
    wbc: { min: 0.1, max: 100, unit: "10^3/uL" },
    rbc: { min: 1, max: 10, unit: "10^6/uL" },
    hba1c: { min: 2, max: 20, unit: "%" },
    cholesterol: { min: 50, max: 600, unit: "mg/dL" },
    triglycerides: { min: 10, max: 2000, unit: "mg/dL" },
    hdl: { min: 5, max: 150, unit: "mg/dL" },
    ldl: { min: 10, max: 400, unit: "mg/dL" },
    tsh: { min: 0.01, max: 100, unit: "mIU/L" },
    t3: { min: 10, max: 500, unit: "ng/dL" },
    t4: { min: 0.5, max: 30, unit: "ug/dL" },
    ferritin: { min: 1, max: 2000, unit: "ng/mL" },
    vitamin_b12: { min: 20, max: 2000, unit: "pg/mL" },
    "vitamin b12": { min: 20, max: 2000, unit: "pg/mL" },
    vitamin_d: { min: 1, max: 200, unit: "ng/mL" },
    "vitamin d": { min: 1, max: 200, unit: "ng/mL" },
    folate: { min: 0.5, max: 50, unit: "ng/mL" },
    crp: { min: 0.01, max: 500, unit: "mg/L" },
    esr: { min: 0, max: 200, unit: "mm/hr" },
    iron: { min: 5, max: 500, unit: "ug/dL" },
    uric_acid: { min: 0.5, max: 20, unit: "mg/dL" },
};

export function validateBiomarkerPlausibility(
    biomarkers: Array<{
        name: string;
        value: number;
        unit?: string;
        referenceMin?: number | null;
        referenceMax?: number | null;
    }>
): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    for (const biomarker of biomarkers) {
        const key = biomarker.name.toLowerCase().trim();
        const rule = PHYSIOLOGICAL_RANGES[key];
        if (!rule) continue;

        if (biomarker.value < rule.min || biomarker.value > rule.max) {
            warnings.push({
                biomarkerName: biomarker.name,
                field: "value",
                issue: `Value ${biomarker.value} ${biomarker.unit ?? ""} is outside physiological range [${rule.min}–${rule.max} ${rule.unit}]`,
                severity: "error",
            });
        }

        if (
            biomarker.referenceMin !== null &&
            biomarker.referenceMin !== undefined &&
            biomarker.referenceMin < 0
        ) {
            warnings.push({
                biomarkerName: biomarker.name,
                field: "referenceMin",
                issue: `Reference range minimum cannot be negative (${biomarker.referenceMin})`,
                severity: "error",
            });
        }

        if (
            biomarker.referenceMax !== null &&
            biomarker.referenceMax !== undefined &&
            biomarker.referenceMax < biomarker.referenceMin!
        ) {
            warnings.push({
                biomarkerName: biomarker.name,
                field: "referenceMax",
                issue: `Reference range max (${biomarker.referenceMax}) is less than min (${biomarker.referenceMin})`,
                severity: "error",
            });
        }
    }
    if (warnings.some((w) => w.severity === "error")) {
        logger.error("AI plausibility validation failed:", warnings);
    }
    return warnings;
}
