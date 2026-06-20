import { describe, expect, it } from "vitest";
import {
  findBiomarkerKnowledge,
  generateCarePlanItems,
  getTopTrendChanges,
  getVisitFocus,
} from "@/lib/health-companion";
import type { Biomarker } from "@/types/medical";

function biomarker(overrides: Partial<Biomarker>): Biomarker {
  return {
    id: overrides.id ?? "b-1",
    name: overrides.name ?? "Glucose",
    value: overrides.value ?? "100",
    unit: overrides.unit ?? "mg/dL",
    status: overrides.status ?? "optimal",
    category: overrides.category ?? "metabolic",
    created_at: overrides.created_at ?? "2026-01-01T00:00:00Z",
    lab_result_id: overrides.lab_result_id,
    ai_interpretation: overrides.ai_interpretation,
  };
}

describe("health companion helpers", () => {
  it("prioritizes clinician discussion in the visit focus", () => {
    const focus = getVisitFocus([
      biomarker({ id: "1", name: "Vitamin D", status: "optimal" }),
      biomarker({ id: "2", name: "Glucose", status: "warning" }),
      biomarker({ id: "3", name: "Hemoglobin", status: "critical" }),
    ]);

    expect(focus.title).toBe("2 visit focus items");
    expect(focus.detail).toContain("Hemoglobin");
    expect(focus.detail).toContain("Glucose");
  });

  it("generates patient-safe plan items from latest biomarkers", () => {
    const items = generateCarePlanItems({
      biomarkers: [
        biomarker({ id: "2", name: "Glucose", status: "warning" }),
      ],
      reportCount: 1,
      symptomCount: 0,
    });

    expect(items.some((item) => item.kind === "monitor" && item.title.includes("Glucose"))).toBe(true);
    expect(items.some((item) => item.kind === "retest")).toBe(true);
    expect(items.some((item) => item.title.includes("symptoms"))).toBe(true);
  });

  it("computes meaningful trend changes between reports", () => {
    const latest = [biomarker({ id: "new", value: "120", lab_result_id: "r2" })];
    const all = [
      latest[0],
      biomarker({ id: "old", value: "100", lab_result_id: "r1" }),
    ];

    const changes = getTopTrendChanges(latest, all, "r2");
    expect(changes[0]?.title).toBe("Glucose rose 20%");
  });

  it("resolves common biomarker aliases", () => {
    expect(findBiomarkerKnowledge("A1C")?.name).toBe("HbA1c");
    expect(findBiomarkerKnowledge("LDL-C")?.name).toBe("LDL Cholesterol");
  });
});
