# MedAssist Production Readiness Audit

Comprehensive list of bugs, logic errors, and blockers identified across the codebase.

---

## CRITICAL — Must fix before production

### 1. **Missing environment variables crash with unclear errors**

**Location:** `src/lib/extractPdfText.ts`, `src/lib/groq-medical.ts`, multiple API routes

**Issue:** `process.env.OCR_SPACE_API_KEY!` and `process.env.GROQ_API_KEY` — if undefined, OCR/Groq calls fail with cryptic errors (e.g. "Invalid API key" or network/500). No startup validation.

**Impact:** App appears to work until user uploads; then fails. Support/debugging is hard.

**Fix:** Add env validation at build/startup; fail fast with clear message listing missing vars.

---

### 2. **analyze-report allows unauthenticated PDF analysis (quota abuse)**

**Location:** `src/app/api/analyze-report/route.ts` (lines 88–115)

**Issue:** When `!user`, the route still runs OCR + Groq AI and returns analysis. It just skips `saveLabResult`. So anyone can burn OCR.space and Groq quota without signing up.

**Impact:** Cost abuse; rate limit (IP-based) is the only protection, easily bypassed with VPN/proxies.

**Fix:** Either require auth for analyze-report (redirect to signup), or add stricter rate limits / captcha for anon.

---

### 3. **Step-processing: JSON.parse(data.analysis) can throw**

**Location:** `src/app/onboarding/components/step-processing.tsx` (line 132)

**Issue:** `const analysisData = JSON.parse(data.analysis);` — if API returns malformed JSON or `data.analysis` is undefined, this throws. The outer catch sets generic "Network error" and state "error".

**Impact:** User sees "Something went wrong" instead of a specific message. Hard to debug.

**Fix:** Wrap in try/catch; check `data.analysis` exists and is string; on parse error show "Invalid response from server — please try again."

---

### 4. **Step-upload manual entry: no router.refresh() after save**

**Location:** `src/app/onboarding/components/step-upload.tsx` (onSubmitManualEntry)

**Issue:** After successful manual entry, we `setAnalysisResult`, `completeStep(3)`, `setStep(5)`. The report is saved server-side. But when user lands on dashboard (from step-tour), the dashboard page was server-rendered before the save. So dashboard may show stale data (no new report) until user refreshes.

**Impact:** User completes onboarding with manual entry, arrives at dashboard, sees "Ready when you are" / empty state instead of their new report. Confusing.

**Fix:** Use `router.refresh()` before navigation, or ensure step-tour triggers a full navigation that refetches (it uses `window.location.href = "/dashboard"` which does full reload — so actually it should refetch. The dashboard is server-rendered on that request, so we get fresh data. So this might be OK. Let me re-check — step-upload manual goes to setStep(5) which shows StepTour. StepTour's handleFinish calls saveLabResult (for analysisResult) and completeOnboarding, then window.location.href = "/dashboard". So we're doing a full page load. The save happens in handleFinish. So when we navigate, the save is done. Dashboard will fetch fresh. OK, so this might not be a bug. But step-upload manual doesn't go through step-tour — it goes directly to step 5. And step 5 is StepTour. So we land on StepTour with analysisResult set. User clicks "Finish" or similar — that's handleFinish. So we do save. Good. Actually in manual flow we setStep(5) which shows StepTour. But we didn't call saveLabResult in step-upload — we just setAnalysisResult. So the data is in the store. StepTour's handleFinish will call saveLabResult(analysisResult) and completeOnboarding. So we do save. Good.

Actually wait — in step-upload manual flow we go directly to step 5. Step 5 is the "your dashboard is ready" screen. Does it have a "Finish" button that calls handleFinish? Let me check. StepTour has handleFinish which saves and then window.location.href = "/dashboard". So user must click that. Good. So the flow is correct. I'll remove this from critical.

---

### 5. **Medicine cabinet / supplements: no validation of start_date format**

**Location:** `src/app/api/supplements/route.ts` (POST)

**Issue:** `start_date` is passed to Supabase without validation. If client sends `"2025-02-21"` it works. If client sends `"invalid"` or `"02/21/2025"`, Postgres may error or store wrong value.

**Impact:** UI might send different formats; silent corruption or 500.

**Fix:** Validate with Zod/date parse; return 400 for invalid format.

---

### 6. **Profile deleteLabResult: id type mismatch**

**Location:** `src/app/profile/page.tsx` (line 81)

**Issue:** `reports` state has `id: string` (from Supabase bigint comes as string in JSON). `deleteLabResult(parseInt(id))` — for bigint IDs > Number.MAX_SAFE_INTEGER, parseInt loses precision.

**Impact:** Rare for new apps; could fail to delete correct report if IDs get large.

**Fix:** Use `Number(id)` or pass string to a server action that accepts string/bigint.

---

### 7. **Supplements API: setAll may not persist cookies**

**Location:** `src/app/api/supplements/route.ts`

**Issue:** The Supabase client uses `cookieStore.set` — in Route Handlers, `cookies()` from `next/headers` returns a readonly interface in some versions. The `setAll` implementation might not actually persist. Compare with `analyze-report` which uses a try/catch and `cookieStore.set(name, value, options)`.

**Impact:** Session might not persist after supplement operations. (Needs verification against Next.js 14/15 docs.)

---

## HIGH — Should fix

### 8. **Rate limit: development bypass in production build**

**Location:** `src/services/rateLimitService.ts` (lines 51–54, 116–118)

**Issue:** When `NODE_ENV === 'development'`, rate limit is bypassed entirely. In production, rate limit works. But if someone deploys with NODE_ENV=development by mistake, no rate limiting.

**Fix:** Explicit env var like `RATE_LIMIT_ENABLED=true` or only bypass when `DISABLE_RATE_LIMIT=true` for local dev.

---

### 9. **OCR/extractPdfText: Buffer in Edge runtime**

**Location:** `src/lib/extractPdfText.ts`, `src/app/api/analyze-report/route.ts`

**Issue:** `Buffer.from(arrayBuffer)` — `Buffer` is a Node.js API. The analyze-report route has `runtime = "nodejs"` so it's fine. But extractionService and extractPdfText don't enforce this. If someone changed the route to `edge`, Buffer would fail.

**Fix:** Document or assert nodejs runtime where Buffer is used.

---

### 10. **biomarker-trends: Supabase order may not work as expected**

**Location:** `src/app/api/biomarker-trends/route.ts` (line 45)

**Issue:** `.order('created_at', { foreignTable: 'lab_results', ascending: true })` — Supabase/PostgREST order with foreignTable can be tricky. The biomarkers table has `created_at` or relies on `lab_results.created_at`. If biomarkers has its own created_at, we might be ordering by the wrong column.

**Fix:** Verify schema (biomarkers has created_at?); ensure we're ordering by report date.

---

### 11. **Feedback: RLS policy allows anyone to insert**

**Location:** `supabase_schema.sql` (feedback table)

**Issue:** `CREATE POLICY "Users can insert feedback" ON feedback FOR INSERT WITH CHECK (true)` — any role (including anon) can insert. Combined with no rate limit on feedback endpoint, this allows spam.

**Fix:** Add rate limiting to feedback, or restrict insert to authenticated with CHECK (auth.uid() IS NOT NULL) if you want only signed-in feedback.

---

### 12. **saveLabResult failure is logged but not returned to client**

**Location:** `src/app/api/analyze-report/route.ts` (lines 111–114)

**Issue:** `if (!saveResult.success) { logger.error(...); }` — we don't return error to client. User gets 200 with analysis, but data wasn't saved. User thinks it's saved.

**Impact:** User loses data silently; "Analysis complete" but nothing in dashboard.

**Fix:** If !saveResult.success, return 500 (or 207 with partial success) and explicit error so client can retry or show message.

---

## MEDIUM — Logic / UX issues

### 13. **Step-processing: setExtractedData uses wrong shape for setAnalysisResult**

**Location:** `src/app/onboarding/components/step-processing.tsx` (lines 134–140)

**Issue:** `setExtractedData` expects `labValues` with ExtractedLabValue shape (referenceMin, referenceMax, rangePosition, trend, etc.). API returns BiomarkerResult (referenceMin, referenceMax, etc.). We pass `analysisData.biomarkers` which may not have rangePosition, trend. The store’s setExtractedData might overwrite or mismatch.

**Fix:** Ensure API response shape matches ExtractedLabValue, or map before calling setExtractedData.

---

### 14. **Dashboard: useSearchParams in client without Suspense**

**Location:** `src/app/dashboard/dashboard-client.tsx`

**Issue:** Next.js 14+ recommends wrapping components that use `useSearchParams` in `<Suspense>` to avoid draining the entire tree. You added Suspense in page.tsx; verify no hydration warnings.

---

### 15. **Demo mode: cached to localStorage includes demo data**

**Location:** `src/app/dashboard/dashboard-client.tsx` (lines 328–345)

**Issue:** When demoMode is true, we cache `displayLabResults` and `displayBiomarkers` (demo + real) to localStorage. On next load, demo is off by default, but the cache key is the same. The cache is written but I don't see where it's read on initial load. If there's offline/preload logic that reads it, we might show stale demo+real mix.

**Fix:** Don't cache when demoMode is true, or use a separate cache key for demo vs real.

---

### 16. **Settings export: potential empty or partial export**

**Location:** `src/app/settings/page.tsx` (handleExportData)

**Issue:** Export fetches user data; if a Supabase call fails partway, we might export incomplete JSON. No validation that all data was fetched.

---

### 17. **Onboarding skip: setIsSkipping never set to false on error path**

**Location:** `src/app/onboarding/components/step-upload.tsx` (onSkip)

**Issue:** If completeOnboarding fails, we catch and do `window.location.href = "/dashboard"`. We never set `setIsSkipping(false)`. The component unmounts on navigate, so state is lost. Minor — but if navigation were delayed, the button would stay loading.

---

## LOW — Polish / hardening

### 18. **Console statements in production**

**Location:** Various (step-tour, step-upload, step-processing, doctor-questions, medicine-cabinet, etc.)

**Issue:** `console.error` and `console.log` left in. In production, these can leak info and add noise.

**Fix:** Use logger everywhere; strip or gate in production.

---

### 19. **`as any` and loose typing**

**Location:** Multiple files (see grep results)

**Issue:** Weak typing hides bugs (e.g. wrong field names, missing null checks).

**Fix:** Add proper types for API responses; replace `as any` gradually.

---

### 20. **No request timeout for OCR/Groq**

**Issue:** `extractPdfText` and Groq calls have no explicit timeout. A hung OCR or Groq request could block the route until platform timeout (e.g. Vercel 60s).

**Fix:** Add AbortSignal with timeout; fail fast and return user-friendly error.

---

### 21. **global_ai_cache: no RLS**

**Location:** `supabase_schema.sql`

**Issue:** `global_ai_cache` has no RLS policies. If anon/authenticated can access it, they might read or mutate cache. The generate-questions route uses it with admin client (service role) so it bypasses RLS. But direct Supabase client access would depend on schema.

**Fix:** Add RLS to deny all for global_ai_cache, or ensure it's only ever accessed via service role.

---

### 22. **check_rate_limit granted to anon**

**Location:** `supabase_schema.sql` (line 44)

**Issue:** `grant execute on function check_rate_limit(...) to anon, authenticated` — anon can call it. That's required for unauthenticated analyze-report. OK.

---

## SUMMARY

| Severity | Count |
|----------|-------|
| Critical | 6 |
| High     | 5 |
| Medium   | 5 |
| Low      | 5 |

**Recommended order of fixes:**
1. Env validation (Critical #1)
2. saveLabResult failure propagation (Critical #12)
3. JSON.parse guard in step-processing (Critical #3)
4. analyze-report auth or stricter limits (Critical #2)
5. Supplements start_date validation (Critical #5)
6. Profile id type for delete (Critical #6)

After these, production readiness is much improved.
