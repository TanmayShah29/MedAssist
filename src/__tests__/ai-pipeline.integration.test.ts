import { describe, it, expect, vi } from "vitest";
import { ExtractionResultSchema } from "@/lib/validations/analysis";

// Mock the Groq SDK
vi.mock("groq-sdk", () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: JSON.stringify({
            biomarkers: [{ name: "Hemoglobin", value: 14.5, unit: "g/dL", status: "optimal", category: "hematology", confidence: 0.95, aiInterpretation: "Within normal range." }],
            healthScore: 85,
            riskLevel: "low",
            summary: "All values are within normal range.",
            plainSummary: "Good results overall.",
            symptomConnections: []
          }) } }]
        })
      }
    }
  }))
}));

describe("AI Analysis Pipeline", () => {
  it("should produce valid extraction result schema", () => {
    const result = {
      biomarkers: [{ name: "Hemoglobin", value: 14.5, unit: "g/dL", status: "optimal", category: "hematology", confidence: 0.95, aiInterpretation: "Within normal range." }],
      healthScore: 85,
      riskLevel: "low",
      summary: "All values are within normal range.",
      plainSummary: "Good results overall.",
      symptomConnections: [],
    };
    const parsed = ExtractionResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("should reject empty biomarkers array", () => {
    const result = {
      biomarkers: [],
      healthScore: 0,
      riskLevel: "low",
      summary: "No data.",
      plainSummary: "",
      symptomConnections: [],
    };
    const parsed = ExtractionResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });
});
