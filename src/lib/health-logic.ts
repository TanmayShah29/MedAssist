/**
 * Health score logic.
 *
 * The AI (Groq) returns a calculated health score. We trust that score when
 * it's a valid integer in [0, 100]. We only fall back to the formula-based
 * recalculation when the AI score is missing, NaN, or out of range — which
 * can happen if the AI JSON response is salvaged after a Zod validation failure.
 */

/**
 * Returns the AI score when valid, otherwise recalculates from biomarker statuses.
 * Previously this function always recalculated and ignored the AI score — fixed.
 */
export function validateAndRecalculateScore(
  groqScore: number,
  biomarkers: { status: string }[]
): number {
  // Trust the AI score when it's a valid finite number in range
  if (
    typeof groqScore === 'number' &&
    Number.isFinite(groqScore) &&
    !Number.isNaN(groqScore) &&
    groqScore >= 0 &&
    groqScore <= 100
  ) {
    return Math.round(groqScore);
  }

  // Fallback: derive score from biomarker statuses
  const total = biomarkers.length;
  if (total === 0) return 0;

  const optimal = biomarkers.filter(b => b.status === 'optimal').length;
  const warning = biomarkers.filter(b => b.status === 'warning').length;
  const critical = biomarkers.filter(b => b.status === 'critical').length;

  const rawScore = ((optimal * 100) + (warning * 75) + (critical * 40)) / total;
  // Apply a floor so users with some optimal markers aren't demoralised by minor deviations
  const floor = optimal > 0 ? 50 : 30;
  return Math.round(Math.max(floor, rawScore));
}

/**
 * Normalizes various status strings from different AI responses / legacy data
 * into the app's canonical three-value set.
 */
export function normalizeStatus(status: string): 'optimal' | 'warning' | 'critical' {
  const s = status?.toLowerCase()?.trim();
  if (s === 'normal' || s === 'optimal' || s === 'stable' || s === 'within range') return 'optimal';
  if (s === 'critical' || s === 'high' || s === 'low' || s === 'action required' || s === 'abnormal') return 'critical';
  // Default ambiguous values to warning (conservative — better to flag than ignore)
  return 'warning';
}
