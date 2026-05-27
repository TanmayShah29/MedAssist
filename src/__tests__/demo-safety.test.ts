import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import path from "path";

const root = process.cwd();
const demoFiles = [
  "src/app/demo/page.tsx",
  "src/lib/demo-data.ts",
  "src/app/api/demo-ask-ai/route.ts",
];

describe("demo safety copy", () => {
  it("does not use diagnosis or treatment-forward sample language", () => {
    const combined = demoFiles
      .map((file) => readFileSync(path.join(root, file), "utf8"))
      .join("\n")
      .toLowerCase();

    expect(combined).not.toContain("pre-diabetic");
    expect(combined).not.toContain("statin");
    expect(combined).not.toContain("recommended supplementation");
    expect(combined).not.toContain("supplementation protocol");
    expect(combined).not.toContain("this confirms");
  });
});
