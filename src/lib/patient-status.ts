import type { Biomarker } from "@/types/medical";

export type InternalBiomarkerStatus = "optimal" | "warning" | "critical" | "unranged";

export type PatientStatusMeta = {
  label: "In range" | "Discuss" | "Discuss soon" | "No range on report";
  shortLabel: "In range" | "Discuss" | "Soon" | "No range";
  printLabel: string;
  description: string;
  priority: number;
  dotClass: string;
  badgeClass: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  barClass: string;
};

const FALLBACK_STATUS: InternalBiomarkerStatus = "unranged";

export const PATIENT_STATUS: Record<InternalBiomarkerStatus, PatientStatusMeta> = {
  optimal: {
    label: "In range",
    shortLabel: "In range",
    printLabel: "In range",
    description: "This value appears within the report's reference range.",
    priority: 0,
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
    textClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-100",
    barClass: "bg-emerald-500",
  },
  warning: {
    label: "Discuss",
    shortLabel: "Discuss",
    printLabel: "Discuss with clinician",
    description: "This result may be worth reviewing at your next appointment.",
    priority: 1,
    dotClass: "bg-amber-500",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-100",
    textClass: "text-amber-700",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-100",
    barClass: "bg-amber-500",
  },
  critical: {
    label: "Discuss soon",
    shortLabel: "Soon",
    printLabel: "Discuss soon with clinician",
    description: "This value is outside range and should be reviewed with a qualified clinician.",
    priority: 2,
    dotClass: "bg-red-500",
    badgeClass: "bg-red-50 text-red-700 border-red-100",
    textClass: "text-red-700",
    bgClass: "bg-red-50",
    borderClass: "border-red-100",
    barClass: "bg-red-500",
  },
  unranged: {
    label: "No range on report",
    shortLabel: "No range",
    printLabel: "No reference range printed",
    description: "This report didn't print a reference range (or unit) for this value, so it isn't scored as in-range or out-of-range.",
    priority: -1,
    dotClass: "bg-stone-400",
    badgeClass: "bg-stone-50 text-stone-600 border-stone-200",
    textClass: "text-stone-600",
    bgClass: "bg-stone-50",
    borderClass: "border-stone-200",
    barClass: "bg-stone-400",
  },
};

export function normalizePatientStatus(status: string | null | undefined): InternalBiomarkerStatus {
  return status === "warning" || status === "critical" || status === "optimal" || status === "unranged"
    ? status
    : FALLBACK_STATUS;
}

export function getPatientStatus(status: string | null | undefined): PatientStatusMeta {
  return PATIENT_STATUS[normalizePatientStatus(status)];
}

export function needsClinicianDiscussion(biomarker: Pick<Biomarker, "status">): boolean {
  return getPatientStatus(biomarker.status).priority > 0;
}

export function sortByPatientPriority<T extends Pick<Biomarker, "status" | "name">>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const priorityDiff = getPatientStatus(b.status).priority - getPatientStatus(a.status).priority;
    return priorityDiff || a.name.localeCompare(b.name);
  });
}

export function computeBriefCompleteness({
  biomarkerCount,
  reportCount,
  symptomCount,
  medicationContextCount,
}: {
  biomarkerCount: number;
  reportCount: number;
  symptomCount: number;
  medicationContextCount: number;
}) {
  let score = 0;
  if (biomarkerCount > 0) score += 45;
  if (reportCount > 1) score += 20;
  if (symptomCount > 0) score += 20;
  if (medicationContextCount > 0) score += 15;
  return Math.min(100, score);
}
