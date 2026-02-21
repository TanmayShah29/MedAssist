import { Biomarker } from "@/types/medical";

export interface DemoLabResult {
    id: string;
    created_at: string;
    raw_ai_json: {
        healthScore: number;
        riskLevel: string;
        summary: string;
        longitudinalInsights: string[];
    };
}

export const DEMO_HISTORY: Biomarker[] = [
    // Glucose History (Rising trend)
    {
        id: 101,
        name: "Glucose",
        value: 92,
        unit: "mg/dL",
        status: "optimal",
        category: "metabolic",
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months ago
        ai_interpretation: "Glucose is within optimal range."
    },
    {
        id: 102,
        name: "Glucose",
        value: 98,
        unit: "mg/dL",
        status: "optimal",
        category: "metabolic",
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 2 months ago
        ai_interpretation: "Glucose is stable but slightly higher than last time."
    },
    {
        id: 103,
        name: "Glucose",
        value: 106,
        unit: "mg/dL",
        status: "warning",
        category: "metabolic",
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month ago
        ai_interpretation: "Glucose has entered a warning range. Watch your carbohydrate intake."
    },
    // Vitamin D History (Improving trend)
    {
        id: 201,
        name: "Vitamin D",
        value: 18,
        unit: "ng/mL",
        status: "critical",
        category: "vitamins",
        created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        ai_interpretation: "Severely low Vitamin D levels."
    },
    {
        id: 202,
        name: "Vitamin D",
        value: 28,
        unit: "ng/mL",
        status: "warning",
        category: "vitamins",
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        ai_interpretation: "Improving Vitamin D levels, but still below optimal."
    },
    {
        id: 203,
        name: "Vitamin D",
        value: 42,
        unit: "ng/mL",
        status: "optimal",
        category: "vitamins",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        ai_interpretation: "Vitamin D has reached an optimal level. Great progress."
    },
    // Hemoglobin History
    {
        id: 301,
        name: "Hemoglobin",
        value: 13.2,
        unit: "g/dL",
        status: "optimal",
        category: "hematology",
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 302,
        name: "Hemoglobin",
        value: 11.8,
        unit: "g/dL",
        status: "warning",
        category: "hematology",
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    }
];

export const DEMO_LAB_RESULT: DemoLabResult = {
    id: "demo-latest",
    created_at: new Date().toISOString(),
    raw_ai_json: {
        healthScore: 78,
        riskLevel: "moderate",
        summary: "Your metabolic markers show a rising trend in glucose, while your vitamin profile has significantly improved through supplementation.",
        longitudinalInsights: [
            "Metabolic Alert: Glucose has risen 15% over the last 3 months.",
            "Supplement Efficacy: Vitamin D has improved from critical (18) to optimal (42).",
            "Anemic Pattern: Hemoglobin is trending downward as Ferritin remains stable."
        ]
    }
};

export const MOCK_FAMILY_PROFILES = [
    { id: "owner-1", first_name: "Test", last_name: "User", role: "Patient", parent_id: null },
    { id: "child-1", first_name: "Sarah", last_name: "User (Daughter)", role: "Patient", parent_id: "owner-1" },
    { id: "parent-1", first_name: "Robert", last_name: "User (Father)", role: "Patient", parent_id: "owner-1" },
];
