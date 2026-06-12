import { logger } from "@/lib/logger";

export interface UrgentFinding {
    biomarkerName: string;
    value: number;
    unit: string;
    severity: "warning" | "critical";
    message: string;
}

interface ThresholdRule {
    name: string;
    unit?: string;
    check: (value: number) => { severity: "warning" | "critical"; message: string } | null;
}

const URGENT_THRESHOLDS: ThresholdRule[] = [
    {
        name: "glucose",
        check: (v) =>
            v > 300
                ? { severity: "critical", message: "Blood glucose is severely elevated. Seek immediate medical attention." }
                : v < 54
                  ? { severity: "critical", message: "Blood glucose is dangerously low. Seek immediate medical attention." }
                  : null,
    },
    {
        name: "potassium",
        check: (v) =>
            v > 6.0
                ? { severity: "critical", message: "Potassium is critically high. Seek immediate medical attention." }
                : v < 3.0
                  ? { severity: "critical", message: "Potassium is critically low. Seek immediate medical attention." }
                  : null,
    },
    {
        name: "sodium",
        check: (v) =>
            v > 160
                ? { severity: "critical", message: "Sodium is critically high. Seek immediate medical attention." }
                : v < 120
                  ? { severity: "critical", message: "Sodium is critically low. Seek immediate medical attention." }
                  : null,
    },
    {
        name: "hemoglobin",
        check: (v) =>
            v < 7
                ? { severity: "critical", message: "Hemoglobin is critically low. Seek immediate medical attention." }
                : v > 20
                  ? { severity: "critical", message: "Hemoglobin is critically high. Seek immediate medical attention." }
                  : null,
    },
    {
        name: "platelets",
        check: (v) =>
            v < 20
                ? { severity: "critical", message: "Platelet count is critically low. Risk of bleeding. Seek immediate medical attention." }
                : v > 1000
                  ? { severity: "critical", message: "Platelet count is critically high. Seek immediate medical attention." }
                  : null,
    },
    {
        name: "hba1c",
        check: (v) =>
            v > 12
                ? { severity: "critical", message: "HbA1c is severely elevated. Immediate clinical review required." }
                : null,
    },
    {
        name: "troponin",
        check: (v) =>
            v > 0.4
                ? { severity: "critical", message: "Troponin is elevated, which may indicate heart muscle injury. Seek emergency care immediately." }
                : null,
    },
];

export function checkUrgentFindings(
    biomarkers: Array<{ name: string; value: number; unit?: string }>
): UrgentFinding[] {
    const findings: UrgentFinding[] = [];
    for (const biomarker of biomarkers) {
        const rule = URGENT_THRESHOLDS.find(
            (r) => r.name.toLowerCase() === biomarker.name.toLowerCase().trim()
        );
        if (rule) {
            const result = rule.check(biomarker.value);
            if (result) {
                findings.push({
                    biomarkerName: biomarker.name,
                    value: biomarker.value,
                    unit: biomarker.unit ?? "",
                    ...result,
                });
            }
        }
    }
    if (findings.length > 0) {
        logger.warn(
            `Urgent findings detected: ${findings.map((f) => `${f.biomarkerName}=${f.value} (${f.severity})`).join(", ")}`
        );
    }
    return findings;
}
