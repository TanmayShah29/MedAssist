/**
 * AI analysis service: wraps Groq medical extraction/interpretation.
 * Keeps API route thin and separates AI logic from HTTP handling.
 */

import {
    extractAndInterpretBiomarkers,
    type BiomarkerContext,
    type ExtractionResult,
} from '@/lib/groq-medical';
import { validateAndRecalculateScore } from '@/lib/health-logic';

export type { ExtractionResult, BiomarkerContext };

/**
 * Run full AI extraction + interpretation on lab text (from PDF OCR or manual entry).
 * Returns validated result with recalculated health score.
 */
export async function analyzeLabText(
    labText: string,
    options: {
        symptoms?: string[];
        history?: BiomarkerContext[];
    } = {}
): Promise<ExtractionResult> {
    const { symptoms = [], history = [] } = options;
    const result = await extractAndInterpretBiomarkers(labText, symptoms, history);
    result.healthScore = validateAndRecalculateScore(result.healthScore, result.biomarkers);
    return result;
}
