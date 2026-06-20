import type { Biomarker, LabResult } from "@/types/medical";
import { getPatientStatus, sortByPatientPriority } from "@/lib/patient-status";

export type CarePlanKind = "ask_doctor" | "monitor" | "lifestyle" | "retest";
export type CarePlanStatus = "not_started" | "in_progress" | "done" | "dismissed";

export type CarePlanItem = {
  id: string;
  user_id?: string;
  title: string;
  reason: string;
  kind: CarePlanKind;
  status: CarePlanStatus;
  timeframe?: string;
  related_biomarkers?: string[];
  source?: "generated" | "user" | "assistant";
  created_at?: string;
};

export type TimelineEvent = {
  id: string;
  type: "report" | "biomarker" | "action" | "note" | "export" | "reminder";
  title: string;
  detail?: string;
  date?: string;
};

export type BiomarkerKnowledge = {
  name: string;
  aliases: string[];
  category: string;
  plainEnglish: string;
  commonQuestions: string[];
};

export const BIOMARKER_KNOWLEDGE: BiomarkerKnowledge[] = [
  {
    name: "Glucose",
    aliases: ["fasting glucose", "blood glucose"],
    category: "metabolic",
    plainEnglish: "Glucose is the main sugar in your blood and is often used to understand blood sugar regulation.",
    commonQuestions: [
      "Could this value be related to fasting, meals, or medications?",
      "Should we repeat this with HbA1c or fasting insulin?",
    ],
  },
  {
    name: "HbA1c",
    aliases: ["A1C", "Hemoglobin A1c", "Hemoglobin A1C"],
    category: "metabolic",
    plainEnglish: "HbA1c estimates average blood sugar over roughly the past three months.",
    commonQuestions: [
      "Does this suggest I should monitor glucose more closely?",
      "What lifestyle context would help interpret this result?",
    ],
  },
  {
    name: "LDL Cholesterol",
    aliases: ["LDL", "LDL-C"],
    category: "lipids",
    plainEnglish: "LDL cholesterol is one marker doctors use when discussing cardiovascular risk.",
    commonQuestions: [
      "Should we look at ApoB or other heart-risk markers?",
      "How does this fit with my overall risk profile?",
    ],
  },
  {
    name: "Hemoglobin",
    aliases: ["Hgb", "Hb"],
    category: "hematology",
    plainEnglish: "Hemoglobin is the oxygen-carrying protein in red blood cells.",
    commonQuestions: [
      "Could this explain fatigue or shortness of breath?",
      "Should we look at iron, ferritin, B12, or folate?",
    ],
  },
  {
    name: "Vitamin D",
    aliases: ["25-OH Vitamin D", "25 Hydroxy Vitamin D"],
    category: "vitamins",
    plainEnglish: "Vitamin D supports bone, muscle, and immune health and is often tracked over time.",
    commonQuestions: [
      "Is this level appropriate for me?",
      "When should we retest after changing supplements or sun exposure?",
    ],
  },
  {
    name: "TSH",
    aliases: ["Thyroid Stimulating Hormone"],
    category: "thyroid",
    plainEnglish: "TSH is a signal from the brain that helps regulate thyroid hormone production.",
    commonQuestions: [
      "Should we also check Free T4 or Free T3?",
      "Could symptoms like fatigue or temperature sensitivity be relevant?",
    ],
  },
];

export function findBiomarkerKnowledge(name: string): BiomarkerKnowledge | null {
  const normalized = normalizeBiomarkerName(name);
  return BIOMARKER_KNOWLEDGE.find((item) => {
    const names = [item.name, ...item.aliases].map(normalizeBiomarkerName);
    return names.includes(normalized);
  }) ?? null;
}

export function normalizeBiomarkerName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function getStatusCounts(biomarkers: Biomarker[]) {
  return {
    optimal: biomarkers.filter((b) => b.status === "optimal").length,
    warning: biomarkers.filter((b) => b.status === "warning").length,
    critical: biomarkers.filter((b) => b.status === "critical").length,
  };
}

export function getVisitFocus(biomarkers: Biomarker[]) {
  const prioritized = sortByPatientPriority(biomarkers).filter((b) => getPatientStatus(b.status).priority > 0);
  if (prioritized.length === 0) {
    return {
      title: "No urgent discussion points detected",
      detail: "Your latest report does not show any values marked Discuss or Discuss soon. Keep your report handy for routine review.",
      biomarkers: [],
    };
  }

  const top = prioritized.slice(0, 3);
  return {
    title: `${top.length} visit focus ${top.length === 1 ? "item" : "items"}`,
    detail: top.map((b) => `${b.name} is marked ${getPatientStatus(b.status).label.toLowerCase()}`).join("; "),
    biomarkers: top,
  };
}

function getDelta(current: Biomarker, previous?: Biomarker) {
  if (!previous) return null;
  const curr = parseFloat(String(current.value));
  const prev = parseFloat(String(previous.value));
  if (!Number.isFinite(curr) || !Number.isFinite(prev) || prev === 0) return null;
  const percent = Math.round(((curr - prev) / prev) * 100);
  if (Math.abs(percent) < 5) return null;
  return { percent, direction: percent > 0 ? "rose" : "fell" };
}

export function getTopTrendChanges(latest: Biomarker[], all: Biomarker[], latestLabResultId?: string) {
  return latest
    .map((current) => {
      const previous = all.find((candidate) => candidate.name === current.name && candidate.lab_result_id !== latestLabResultId);
      const delta = getDelta(current, previous);
      if (!delta) return null;
      return {
        biomarker: current,
        title: `${current.name} ${delta.direction} ${Math.abs(delta.percent)}%`,
        detail: previous
          ? `Changed from ${previous.value} ${previous.unit} to ${current.value} ${current.unit}.`
          : undefined,
        percent: delta.percent,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent))
    .slice(0, 3);
}

export function generateCarePlanItems({
  biomarkers,
  reportCount,
  symptomCount,
}: {
  biomarkers: Biomarker[];
  reportCount: number;
  symptomCount: number;
}): CarePlanItem[] {
  const prioritized = sortByPatientPriority(biomarkers).filter((b) => getPatientStatus(b.status).priority > 0);
  const items: CarePlanItem[] = prioritized.slice(0, 4).map((b) => ({
    id: `generated-${b.id}-ask`,
    title: `Ask your clinician about ${b.name}`,
    reason: `${b.name} is marked ${getPatientStatus(b.status).label.toLowerCase()} on your latest report. Bring the value, range, and any symptoms to the visit.`,
    kind: b.status === "critical" ? "ask_doctor" : "monitor",
    status: "not_started",
    timeframe: b.status === "critical" ? "Before or at your next visit" : "At your next appointment",
    related_biomarkers: [b.name],
    source: "generated",
  }));

  if (reportCount < 2 && biomarkers.length > 0) {
    items.push({
      id: "generated-retest-baseline",
      title: "Upload your next report to build trends",
      reason: "A second report lets MedAssist show what is changing instead of only explaining one point in time.",
      kind: "retest",
      status: "not_started",
      timeframe: "After your next lab draw",
      related_biomarkers: [],
      source: "generated",
    });
  }

  if (symptomCount === 0 && biomarkers.length > 0) {
    items.push({
      id: "generated-add-symptoms",
      title: "Add symptoms or context before your visit",
      reason: "Symptoms, medications, and supplements help turn lab values into better doctor questions.",
      kind: "lifestyle",
      status: "not_started",
      timeframe: "Takes 1 minute",
      related_biomarkers: [],
      source: "generated",
    });
  }

  if (items.length === 0) {
    items.push({
      id: "generated-routine-review",
      title: "Keep this report ready for routine review",
      reason: "No values are currently marked Discuss or Discuss soon. Use the prep pack to keep the visit focused.",
      kind: "ask_doctor",
      status: "not_started",
      timeframe: "At your next appointment",
      related_biomarkers: [],
      source: "generated",
    });
  }

  return items.slice(0, 6);
}

export function buildTimeline({
  labResults,
  biomarkers,
  actions = [],
}: {
  labResults: LabResult[];
  biomarkers: Biomarker[];
  actions?: CarePlanItem[];
}): TimelineEvent[] {
  const reportEvents = labResults.slice(0, 10).map((report) => ({
    id: `report-${report.id}`,
    type: "report" as const,
    title: report.file_name ? `Uploaded ${report.file_name}` : "Uploaded lab report",
    detail: report.plain_summary || report.summary || "Report added to your health workspace.",
    date: report.uploaded_at || report.created_at,
  }));

  const biomarkerEvents = sortByPatientPriority(biomarkers)
    .filter((b) => getPatientStatus(b.status).priority > 0)
    .slice(0, 6)
    .map((b) => ({
      id: `biomarker-${b.id}`,
      type: "biomarker" as const,
      title: `${b.name} marked ${getPatientStatus(b.status).label}`,
      detail: `${b.value} ${b.unit}${b.ai_interpretation ? ` - ${b.ai_interpretation}` : ""}`,
      date: b.created_at,
    }));

  const actionEvents = actions.slice(0, 6).map((action) => ({
    id: `action-${action.id}`,
    type: "action" as const,
    title: action.title,
    detail: action.reason,
    date: action.created_at,
  }));

  return [...reportEvents, ...biomarkerEvents, ...actionEvents]
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 20);
}
