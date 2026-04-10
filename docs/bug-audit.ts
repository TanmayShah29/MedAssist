// Bug inventory — every issue found in the full codebase audit
// Status: fixing all below

/**
 * BUG 1 — results/page.tsx — CRITICAL: Type mismatch in report selector
 * r.id is a number from DB, selectedReportId is a string.
 * `r.id === selectedReportId` is always false → plain_summary never shows for a specific report.
 * Fix: String(r.id) === selectedReportId
 *
 * BUG 2 — results/page.tsx — HIGH: Report date in dropdown shows "Invalid Date"
 * Uses r.created_at but the DB column is uploaded_at; created_at is not selected.
 * Fix: r.uploaded_at || r.created_at
 *
 * BUG 3 — results/page.tsx — HIGH: b.lab_results?.created_at is always undefined
 * The join select is `lab_results!inner(user_id, uploaded_at)` — created_at not included.
 * Fix: select created_at in the join OR use uploaded_at
 *
 * BUG 4 — onboarding-store.ts — HIGH: ExtractedLabValue.category missing "other"
 * API can return "other" but type only allows 4 values.
 * Both step-processing and step-upload then silently map "other" → "metabolic" (wrong).
 * Fix: add "other" to the type; fix the fallback in both components.
 *
 * BUG 5 — step-processing.tsx & step-upload.tsx — MEDIUM: "other" category → "metabolic"
 * Related to bug 4. When category is unrecognised it falls back to "metabolic" instead of "other".
 * Fix: change fallback to "other".
 *
 * BUG 6 — assistant/page.tsx — LOW: /api/assistant/greeting endpoint doesn't exist (404)
 * The call is in a try/catch so it silently falls back to a hardcoded greeting.
 * Fix: point to /api/ask-ai with a greeting prompt, or use the existing /api/assistant route.
 *
 * BUG 7 — auth/page.tsx — LOW: console.error instead of logger.error
 * Fix: use logger.error
 *
 * BUG 8 — assistant/page.tsx — LOW: console.warn instead of logger.warn
 * Fix: use logger.warn
 *
 * BUG 9 — settings/page.tsx — MEDIUM: CSV export uses data URI (fails for large data)
 * encodeURI on a long data: string hits browser URL length limits.
 * Fix: use Blob + URL.createObjectURL
 *
 * BUG 10 — results/page.tsx — MEDIUM: lab_results query selects id/uploaded_at/raw_ai_json
 * but not created_at, which some fallback paths reference.
 * Fix: add created_at to the select.
 */
