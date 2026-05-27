import { Biomarker } from "@/types/medical";

export interface DemoLabResult {
    id: string; // Always a string (e.g. "demo-latest") — matches LabResult.id in production
    created_at: string;
    uploaded_at?: string;
    summary?: string;
    raw_ai_json: {
        healthScore: number;
        riskLevel: string;
        summary: string;
        longitudinalInsights: string[];
    };
    symptom_connections?: Array<{
        symptom: string;
        relatedBiomarkers?: string[];
        explanation?: string;
    }> | null;
}

export const DEMO_PREVIOUS_LAB_RESULT: DemoLabResult = {
    id: "demo-previous",
    created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    uploaded_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    raw_ai_json: {
        healthScore: 74,
        riskLevel: "moderate",
        summary: "Previous sample report with lower Vitamin D and steadier glucose.",
        longitudinalInsights: []
    }
};

export const DEMO_HISTORY: Biomarker[] = [
    // Metabolic Profile - Glucose Trending Up
    {
        id: "demo-g-1",
        name: "Glucose",
        value: 92,
        unit: "mg/dL",
        status: "optimal",
        category: "metabolic",
        reference_range_min: 70,
        reference_range_max: 99,
        lab_result_id: "demo-previous",
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
        reference_range_min: 70,
        reference_range_max: 99,
        lab_result_id: "demo-latest",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        ai_interpretation: "Glucose has risen 15% over the last quarter and is above the report range; ask what follow-up or monitoring plan makes sense."
    },
    // Vitamin Profile - Significantly Improved
    {
        id: "demo-v-1",
        name: "Vitamin D",
        value: 18,
        unit: "ng/mL",
        status: "critical",
        category: "vitamins",
        lab_result_id: "demo-previous",
        created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        ai_interpretation: "Vitamin D was below the report range in this older sample; review the trend with a clinician."
    },
    {
        id: "demo-v-2",
        name: "Vitamin D",
        value: 42,
        unit: "ng/mL",
        status: "optimal",
        category: "vitamins",
        lab_result_id: "demo-latest",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        ai_interpretation: "Vitamin D is now within the report range; ask what maintenance monitoring makes sense."
    },
    // Lipid Profile
    {
        id: "demo-l-1",
        name: "LDL Cholesterol",
        value: 145,
        unit: "mg/dL",
        status: "warning",
        category: "lipids",
        lab_result_id: "demo-latest",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        ai_interpretation: "LDL is above the report range; ask whether lifestyle context, repeat testing, or medication discussion is appropriate."
    },
    {
        id: "demo-l-2",
        name: "HDL Cholesterol",
        value: 58,
        unit: "mg/dL",
        status: "optimal",
        category: "lipids",
        lab_result_id: "demo-latest",
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
        lab_result_id: "demo-previous",
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "demo-h-2",
        name: "Hemoglobin",
        value: 11.8,
        unit: "g/dL",
        status: "warning",
        category: "hematology",
        lab_result_id: "demo-latest",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        ai_interpretation: "Hemoglobin has decreased from the prior result; ask whether symptoms or follow-up testing should be reviewed."
    },
    {
        id: "demo-r-1",
        name: "Resting Heart Rate",
        value: 72,
        unit: "bpm",
        status: "optimal",
        category: "vitals",
        lab_result_id: "demo-latest",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "demo-m-1",
        name: "Magnesium",
        value: 2.1,
        unit: "mg/dL",
        status: "optimal",
        category: "metabolic",
        lab_result_id: "demo-latest",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "demo-t-1",
        name: "TSH",
        value: 2.4,
        unit: "uIU/mL",
        status: "optimal",
        category: "thyroid",
        lab_result_id: "demo-latest",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
];

export const DEMO_LAB_RESULT: DemoLabResult = {
    id: "demo-latest",
    created_at: new Date().toISOString(),
    uploaded_at: new Date().toISOString(),
    raw_ai_json: {
        healthScore: 82,
        riskLevel: "moderate",
        summary: "The sample report shows Vitamin D now in range, while Glucose and Hemoglobin are useful appointment discussion points. Use this as context for a clinician conversation, not as a diagnosis.",
        longitudinalInsights: [
            "Glucose has risen 15% over the last 3 months and is above the report range; ask what follow-up or monitoring plan makes sense.",
            "Vitamin D improved from 18 to 42 and is now in range; ask what maintenance and retest timeline is appropriate.",
            "Hemoglobin is trending downward; ask whether symptoms, iron, ferritin, B12, or repeat testing should be reviewed.",
            "TSH is in range in the sample report."
        ]
    }
};

export const MOCK_FAMILY_PROFILES = [
    { id: "owner-1", first_name: "Tanmay", last_name: "User", role: "Patient", parent_id: null },
    { id: "child-1", first_name: "Sarah", last_name: "User (Daughter)", role: "Patient", parent_id: "owner-1" },
    { id: "parent-1", first_name: "Robert", last_name: "User (Father)", role: "Patient", parent_id: "owner-1" },
];
