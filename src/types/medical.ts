export interface Profile {
    id: string;
    first_name: string;
    last_name: string;
    age?: number | null;
    sex?: string | null;
    blood_type?: string | null;
    onboarding_complete?: boolean;
    role?: string;
    parent_id?: string | null;
}

export interface Biomarker {
    id: string | number;
    name: string;
    value: number | string; // Bug 4: DB stores as TEXT; use parseFloat() for arithmetic
    unit: string;
    status: 'optimal' | 'warning' | 'critical';
    category: string;
    reference_range_min?: number;
    reference_range_max?: number;
    ai_interpretation?: string;
    confidence?: number;
    lab_result_id?: string; // UUID in production DB
    lab_results?: { created_at: string; uploaded_at?: string };
    created_at: string;
}

export interface LabResult {
    id: string; // UUID in production DB
    health_score?: number;
    created_at?: string;       // legacy alias; prefer uploaded_at
    uploaded_at?: string;      // actual DB column name
    summary?: string;
    raw_ai_json?: Record<string, unknown>;
    raw_ocr_text?: string;
    processing_time_ms?: number;
}

export interface Symptom {
    symptom: string;
}

export interface ExtractionResult {
    biomarkers: Biomarker[];
    healthScore: number;
    riskLevel: 'low' | 'moderate' | 'high';
    summary: string;
    longitudinalInsights?: string[];
}
