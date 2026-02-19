# Groq/Gemini Diagnosis Report

## Root Cause Analysis
The error reported as a "Groq rate limit" is actually a **Gemini Free Tier Quota Exhaustion**.

1.  **Exact Error**:
    *   **Status Code**: 500 Internal Server Error (from `/api/analyze-report`).
    *   **Upstream Error**: `429 Too Many Requests` from `generativelanguage.googleapis.com`.
    *   **Message**: "Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests".

2.  **Execution Flow**:
    *   The request failed at **Step 3 (Text Extraction)** in `src/app/api/analyze-report/route.ts`.
    *   It never reached **Step 4 (Groq Analysis)**.
    *   **Text Length Sent to Groq**: 0 characters (Function exited before call).
    *   **Duplicate Calls**: None.

3.  **Why the Confusion?**:
    *   The frontend error handling likely sees a 500 or 429 and assumes it's the main AI service (Groq), displaying a generic "Rate Limited" message.

## Configuration Details
- **Gemini Model**: `gemini-2.0-flash` (Working, but quota limit hit).
- **Groq Model**: `llama-3.3-70b-versatile`.
- **Groq Max Tokens**: 4000.

## Recommendation
1.  **Immediate**: Wait for the Gemini free tier quota to reset (usually daily or per minute).
2.  **Code Fix**: Update `src/app/api/analyze-report/route.ts` to distinguish between Gemini errors and Groq errors, so the UI can tell the user *which* service failed.
3.  **Alternative**: Use a paid Gemini key or a different PDF extraction method if volume is high.
