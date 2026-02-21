export interface Profile {
    id: string;
    first_name: string;
    last_name: string;
    role?: string;
    parent_id?: string | null;
}

export interface Biomarker {
    id: number;
    name: string;
    value: number;
    unit: string;
    status: 'optimal' | 'warning' | 'critical';
    category: string;
    ai_interpretation?: string;
    lab_result_id?: number;
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
