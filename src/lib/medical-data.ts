import { Biomarker, LabResult } from "@/types/medical";
import { logger } from "@/lib/logger";
import { reconcileStatus } from "@/lib/range-check";

type RawBiomarker = {
  name?: unknown;
  value?: unknown;
  unit?: unknown;
  status?: unknown;
  category?: unknown;
  referenceMin?: unknown;
  referenceMax?: unknown;
  reference_range_min?: unknown;
  reference_range_max?: unknown;
  confidence?: unknown;
  aiInterpretation?: unknown;
  ai_interpretation?: unknown;
};

import { decrypt } from "@/lib/crypto/encryption";

// Helper to seamlessly decrypt raw_ai_json if it was stored encrypted
export function decryptRawAiJson(rawAiJson: unknown): unknown {
  if (!rawAiJson || typeof rawAiJson !== 'object') return rawAiJson;
  
  const json = rawAiJson as Record<string, unknown>;
  if (json.encrypted_payload && typeof json.encrypted_payload === 'string') {
    try {
      const decrypted = decrypt(json.encrypted_payload);
      return JSON.parse(decrypted);
    } catch (err) {
      logger.error('Failed to decrypt raw_ai_json payload', err);
      return null;
    }
  }
  
  return rawAiJson;
}

export type LabResultWithAnalysis = LabResult & {
  file_name?: string;
  plain_summary?: string | null;
  symptom_connections?: unknown;
};

function asNumber(value: unknown): number {
  if (value === null || value === undefined) {
    logger.warn("asNumber: biomarker value is null/undefined");
    return Number.NaN;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    logger.warn(`asNumber: biomarker value is not a valid number: "${value}"`);
    return Number.NaN;
  }
  return parsed;
}

function asNullableNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeStatus(
  value: unknown,
  range: { value: number; unit: string; referenceMin?: number; referenceMax?: number }
): Biomarker["status"] {
  // Legacy/AI-provided status strings are mapped to our canonical set only as a
  // fallback label for reconcileStatus to consider; the deterministic range check
  // always has final say, and 'unranged' is never silently upgraded to 'optimal'.
  let candidate: string | undefined;
  if (value === "critical" || value === "warning" || value === "optimal" || value === "unranged") {
    candidate = value;
  } else if (value === "action" || value === "high" || value === "low") {
    candidate = "critical";
  } else if (value === "monitor" || value === "borderline") {
    candidate = "warning";
  }

  return reconcileStatus(candidate, {
    value: range.value,
    unit: range.unit,
    referenceMin: range.referenceMin ?? null,
    referenceMax: range.referenceMax ?? null,
  });
}

function normalizeCategory(value: unknown): string {
  const category = typeof value === "string" ? value.trim().toLowerCase() : "";
  return category || "other";
}

export function normalizeBiomarker(row: Partial<Biomarker>): Biomarker {
  const value = asNumber(row.value);
  const unit = String(row.unit ?? "");
  const reference_range_min = asNullableNumber(row.reference_range_min);
  const reference_range_max = asNullableNumber(row.reference_range_max);
  return {
    ...row,
    id: row.id ?? `${row.name}-${row.lab_result_id ?? row.created_at ?? "biomarker"}`,
    name: String(row.name ?? "Unknown biomarker"),
    value,
    unit,
    status: normalizeStatus(row.status, { value, unit, referenceMin: reference_range_min, referenceMax: reference_range_max }),
    category: normalizeCategory(row.category),
    reference_range_min,
    reference_range_max,
    ai_interpretation: row.ai_interpretation,
    confidence: asNullableNumber(row.confidence),
    lab_result_id: row.lab_result_id ? String(row.lab_result_id) : undefined,
    lab_results: row.lab_results,
    created_at: row.created_at ?? new Date(0).toISOString(),
  };
}

export function biomarkersFromReport(report: LabResultWithAnalysis): Biomarker[] {
  const decryptedJson = decryptRawAiJson(report.raw_ai_json);
  const rawJson = decryptedJson as { biomarkers?: RawBiomarker[] } | null | undefined;
  if (!Array.isArray(rawJson?.biomarkers)) return [];

  const createdAt = report.uploaded_at ?? report.created_at ?? new Date(0).toISOString();

  return rawJson.biomarkers
    .map((b, index) => {
      const name = typeof b.name === "string" ? b.name.trim() : "";
      if (!name) return null;

      return normalizeBiomarker({
        id: `${report.id}-raw-${index}`,
        name,
        value: b.value as number | string,
        unit: typeof b.unit === "string" ? b.unit : "",
        status: b.status as Biomarker["status"] | undefined,
        category: normalizeCategory(b.category),
        reference_range_min: asNullableNumber(b.reference_range_min ?? b.referenceMin),
        reference_range_max: asNullableNumber(b.reference_range_max ?? b.referenceMax),
        confidence: asNullableNumber(b.confidence),
        ai_interpretation:
          typeof b.ai_interpretation === "string"
            ? b.ai_interpretation
            : typeof b.aiInterpretation === "string"
              ? b.aiInterpretation
              : undefined,
        lab_result_id: String(report.id),
        lab_results: { created_at: report.created_at ?? createdAt, uploaded_at: report.uploaded_at },
        created_at: createdAt,
      });
    })
    .filter((b): b is Biomarker => b !== null);
}

export function mergeBiomarkerSources(
  biomarkerRows: Partial<Biomarker>[] | null | undefined,
  labResults: LabResultWithAnalysis[] | null | undefined
): Biomarker[] {
  const normalizedRows = (biomarkerRows ?? []).map(normalizeBiomarker);
  const reports = labResults ?? [];
  const reportIdsWithRows = new Set(
    normalizedRows.map((row) => row.lab_result_id).filter((id): id is string => Boolean(id))
  );

  const fallbackRows = reports.flatMap((report) =>
    reportIdsWithRows.has(String(report.id)) ? [] : biomarkersFromReport(report)
  );

  return [...normalizedRows, ...fallbackRows].sort((a, b) => {
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });
}

export function latestUniqueBiomarkers(biomarkers: Biomarker[]): Biomarker[] {
  return Array.from(
    biomarkers
      .reduce((acc, current) => {
        const key = current.name.trim().toLowerCase();
        const existing = acc.get(key);
        if (!existing || new Date(current.created_at || 0) > new Date(existing.created_at || 0)) {
          acc.set(key, current);
        }
        return acc;
      }, new Map<string, Biomarker>())
      .values()
  );
}

export function reportDisplayDate(report?: Pick<LabResult, "uploaded_at" | "created_at"> | null): string | null {
  const date = report?.uploaded_at ?? report?.created_at;
  if (!date) return null;
  return date;
}

export function labResultSummary(report?: LabResultWithAnalysis | null): string {
  if (!report) return "";

  const rawJson = report.raw_ai_json as
    | {
        summary?: unknown;
        plainSummary?: unknown;
        plain_summary?: unknown;
      }
    | null
    | undefined;

  const candidates = [
    report.plain_summary,
    report.summary,
    rawJson?.plain_summary,
    rawJson?.plainSummary,
    rawJson?.summary,
  ];

  const summary = candidates.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0
  );

  return summary?.trim() ?? "";
}
