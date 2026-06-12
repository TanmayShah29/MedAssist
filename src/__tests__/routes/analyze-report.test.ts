import { describe, it, expect, vi } from "vitest";
import { POST } from "@/app/api/analyze-report/route";
import { NextRequest } from "next/server";

vi.mock("@/lib/env", () => ({
  validateEnv: vi.fn(),
}));

vi.mock("@/services/rateLimitService", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/lib/supabase/server", () => ({
  getAuthClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user-id" } },
      }),
    },
    from: vi.fn().mockImplementation((table: string) => {
      if (table === "symptoms") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ count: 0, data: null, error: null }),
          }),
        }),
      };
    }),
  }),
}));

vi.mock("@/lib/supabase-admin", () => ({
  supabaseAdmin: {},
}));

vi.mock("@/services/extractionService", () => ({
  extractTextFromPdf: vi.fn().mockResolvedValue("mock text"),
  ImageBasedPdfError: class extends Error {},
}));

vi.mock("@/services/aiAnalysisService", () => ({
  analyzeLabText: vi.fn().mockResolvedValue({
    biomarkers: [],
    healthScore: 85,
    riskLevel: "low",
    summary: "Test",
    plainSummary: "Test",
    symptomConnections: [],
  }),
}));

vi.mock("@/app/actions/user-data", () => ({
  getUserBiomarkerHistory: vi.fn().mockResolvedValue([]),
  saveLabResult: vi.fn().mockResolvedValue({ success: true, labResultId: "test-id" }),
}));

describe("POST /api/analyze-report", () => {
  it("should return 400 with no file", async () => {
    const formData = new FormData();
    const req = new NextRequest("http://localhost/api/analyze-report", {
      method: "POST",
      body: formData,
    });
    const response = await POST(req);
    expect(response.status).toBe(400);
  });
});
