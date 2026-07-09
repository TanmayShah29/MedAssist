/**
 * Deterministic status derivation from printed lab values.
 *
 * Why this exists: an AI-assigned "status" (optimal/warning/critical) is a judgment
 * call that can be wrong or inconsistent — even when the underlying value and the
 * report's own printed reference range are correct. A biomarker is only meaningfully
 * "in range" or "out of range" relative to the specific range printed on that
 * specific report (units and reference intervals vary by lab, assay, age, and sex).
 *
 * This module is the single source of truth for turning (value, unit, printedMin,
 * printedMax) into a status. It NEVER falls back to a textbook/global reference
 * table — if the report didn't print a range, the result is "unranged", not a guess.
 */

export type DeterministicStatus = "optimal" | "warning" | "critical" | "unranged";

export interface RangeCheckInput {
  value: number;
  unit?: string | null;
  referenceMin?: number | null;
  referenceMax?: number | null;
}

export interface RangeCheckResult {
  status: DeterministicStatus;
  /** True only when value, unit, and a valid printed min/max are all present. */
  hasUsableRange: boolean;
  /** How far outside the printed range the value sits, as a fraction of the range width. Null when in range or unranged. */
  deviationRatio: number | null;
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

/**
 * Derive status purely from the printed range. No memorized/global reference tables.
 *
 * Rules:
 * - If unit is missing/blank, OR either bound of the printed range is missing/invalid,
 *   OR min >= max (malformed range) -> "unranged". We do not guess.
 * - Otherwise: outside [min, max] -> critical if far outside (>15% of range width
 *   beyond the bound), warning if just outside; inside -> optimal.
 */
export function statusFromRange(input: RangeCheckInput): RangeCheckResult {
  const { value, unit, referenceMin, referenceMax } = input;

  const hasUnit = typeof unit === "string" && unit.trim().length > 0;
  const hasValidValue = isFiniteNumber(value);
  const hasValidMin = isFiniteNumber(referenceMin);
  const hasValidMax = isFiniteNumber(referenceMax);
  const rangeIsWellFormed = hasValidMin && hasValidMax && (referenceMax as number) > (referenceMin as number);

  if (!hasValidValue || !hasUnit || !rangeIsWellFormed) {
    return { status: "unranged", hasUsableRange: false, deviationRatio: null };
  }

  const min = referenceMin as number;
  const max = referenceMax as number;
  const width = max - min;

  if (value >= min && value <= max) {
    return { status: "optimal", hasUsableRange: true, deviationRatio: null };
  }

  const distanceOutside = value < min ? min - value : value - max;
  const deviationRatio = distanceOutside / width;

  // Mild excursions (<=15% of range width past the bound) get "warning";
  // larger excursions get "critical". This threshold is intentionally simple
  // and conservative — it's about routing to "discuss" vs "discuss soon",
  // not a clinical severity claim.
  const status: DeterministicStatus = deviationRatio <= 0.15 ? "warning" : "critical";

  return { status, hasUsableRange: true, deviationRatio };
}

/**
 * Reconciles an AI-assigned status with the deterministic, range-derived one.
 * The deterministic status always wins when a usable printed range exists,
 * since it's arithmetic against the report's own numbers rather than a judgment
 * call. When no usable range exists, we report "unranged" rather than trusting
 * an AI status that has nothing real to be derived from.
 */
export function reconcileStatus(
  aiStatus: string | undefined,
  input: RangeCheckInput
): DeterministicStatus {
  const { status, hasUsableRange } = statusFromRange(input);
  if (hasUsableRange) return status;
  return "unranged";
}
