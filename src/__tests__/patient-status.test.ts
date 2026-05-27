import { describe, expect, it } from "vitest";
import {
  computeBriefCompleteness,
  getPatientStatus,
  needsClinicianDiscussion,
  sortByPatientPriority,
} from "../lib/patient-status";

describe("patient-facing status labels", () => {
  it("maps internal statuses to calm patient-facing labels", () => {
    expect(getPatientStatus("optimal").label).toBe("In range");
    expect(getPatientStatus("warning").label).toBe("Discuss");
    expect(getPatientStatus("critical").label).toBe("Discuss soon");
  });

  it("keeps discussion filtering compatible with internal DB statuses", () => {
    expect(needsClinicianDiscussion({ status: "optimal" })).toBe(false);
    expect(needsClinicianDiscussion({ status: "warning" })).toBe(true);
    expect(needsClinicianDiscussion({ status: "critical" })).toBe(true);
  });

  it("sorts discuss-soon markers before discuss markers", () => {
    const sorted = sortByPatientPriority([
      { name: "LDL", status: "warning" },
      { name: "Hemoglobin", status: "critical" },
      { name: "Glucose", status: "warning" },
    ]);

    expect(sorted.map((b) => b.name)).toEqual(["Hemoglobin", "Glucose", "LDL"]);
  });
});

describe("brief completeness", () => {
  it("scores appointment-prep context instead of health", () => {
    expect(
      computeBriefCompleteness({
        biomarkerCount: 8,
        reportCount: 2,
        symptomCount: 1,
        medicationContextCount: 1,
      })
    ).toBe(100);
  });

  it("does not imply health quality when only lab data exists", () => {
    expect(
      computeBriefCompleteness({
        biomarkerCount: 8,
        reportCount: 1,
        symptomCount: 0,
        medicationContextCount: 0,
      })
    ).toBe(45);
  });
});
