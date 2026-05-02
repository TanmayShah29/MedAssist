import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

describe("sample lab report PDF", () => {
  it("contains extractable digital text for the upload pipeline", async () => {
    vi.stubGlobal("DOMMatrix", class DOMMatrix {});
    vi.stubGlobal("ImageData", class ImageData {});
    vi.stubGlobal("Path2D", class Path2D {});

    const { extractTextFromPdf } = await import("@/services/extractionService");
    const pdf = readFileSync(join(process.cwd(), "public/samples/sample-report.pdf"));
    const result = await extractTextFromPdf(pdf, "application/pdf", "sample-report.pdf");

    expect(result.text).toContain("Hemoglobin 11.2");
    expect(result.text).toContain("Fasting Glucose 108");
    expect(result.text).toContain("Vitamin D 25-OH 22");
    expect(result.text.length).toBeGreaterThan(1000);
  });
});
