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
    // Metabolic Profile - Glucose Trending Up
    {
        id: "demo-g-1",
        name: "Glucose",
        value: 92,
        unit: "mg/dL",
        status: "optimal",
        category: "metabolic",
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        ai_interpretation: "Glucose is within optimal range."
    },
    {
        id: "demo-g-2",
        name: "Glucose",
        value: 106,
        unit: "mg/dL",
        status: "warning",
        category: "metabolic",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        ai_interpretation: "Glucose has risen 15% over the last quarter. This confirms a pre-diabetic trend that warrants dietary review."
    },
    // Vitamin Profile - Significantly Improved
    {
        id: "demo-v-1",
        name: "Vitamin D",
        value: 18,
        unit: "ng/mL",
        status: "critical",
        category: "vitamins",
        created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        ai_interpretation: "Severely low. Risk of bone density loss."
    },
    {
        id: "demo-v-2",
        name: "Vitamin D",
        value: 42,
        unit: "ng/mL",
        status: "optimal",
        category: "vitamins",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        ai_interpretation: "Excellent recovery. Supplementation protocol is highly effective."
    },
    // Lipid Profile
    {
        id: "demo-l-1",
        name: "LDL Cholesterol",
        value: 145,
        unit: "mg/dL",
        status: "warning",
        category: "lipids",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        ai_interpretation: "Borderline high. Recommend increasing soluble fiber intake."
    },
    {
        id: "demo-l-2",
        name: "HDL Cholesterol",
        value: 58,
        unit: "mg/dL",
        status: "optimal",
        category: "lipids",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    // CBC
    {
        id: "demo-h-1",
        name: "Hemoglobin",
        value: 13.5,
        unit: "g/dL",
        status: "optimal",
        category: "hematology",
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "demo-h-2",
        name: "Hemoglobin",
        value: 11.8,
        unit: "g/dL",
        status: "warning",
        category: "hematology",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        ai_interpretation: "Downward trend detected. Monitor for symptoms of fatigue."
    },
    {
        id: "demo-r-1",
        name: "Resting Heart Rate",
        value: 72,
        unit: "bpm",
        status: "optimal",
        category: "vitals",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "demo-m-1",
        name: "Magnesium",
        value: 2.1,
        unit: "mg/dL",
        status: "optimal",
        category: "metabolic",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "demo-t-1",
        name: "TSH",
        value: 2.4,
        unit: "uIU/mL",
        status: "optimal",
        category: "thyroid",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
];

export const DEMO_LAB_RESULT: DemoLabResult = {
    id: "demo-latest",
    created_at: new Date().toISOString(),
    raw_ai_json: {
        healthScore: 82,
        riskLevel: "moderate",
        summary: "Clinical analysis of your latest report reveals a significant recovery in Vitamin D levels and a robust lipid profile. However, there is a persistent upward trend in Glucose and a slight decline in Hemoglobin that requires attention.",
        longitudinalInsights: [
            "Metabolic Alert: Glucose has risen 15% over the last 3 months, indicating a transition to pre-diabetic ranges.",
            "Supplement Efficacy: Vitamin D has successfully recovered from a critical level (18) to an optimal maintenance level (42).",
            "Anemic Pattern: Hemoglobin is trending downward as Ferritin remains stable; monitor dietary iron intake.",
            "Thyroid Stability: TSH levels remain ideal, suggesting no metabolic impact from thyroid function."
        ]
    }
};

export const MOCK_FAMILY_PROFILES = [
    { id: "owner-1", first_name: "Tanmay", last_name: "User", role: "Patient", parent_id: null },
    { id: "child-1", first_name: "Sarah", last_name: "User (Daughter)", role: "Patient", parent_id: "owner-1" },
    { id: "parent-1", first_name: "Robert", last_name: "User (Father)", role: "Patient", parent_id: "owner-1" },
];
