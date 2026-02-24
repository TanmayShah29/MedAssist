export interface Profile {
    id: string;
    first_name: string;
    last_name: string;
    role?: string;
    parent_id?: string | null;
}

export interface Biomarker {
    id: string | number;
    name: string;
    value: number;
    unit: string;
    status: 'optimal' | 'warning' | 'critical';
    category: string;
    reference_range_min?: number;
    reference_range_max?: number;
    ai_interpretation?: string;
    confidence?: number;
    lab_result_id?: number;
    lab_results?: { created_at: string };
    created_at: string;
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
