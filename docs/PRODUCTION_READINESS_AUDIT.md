# MedAssist — Production Readiness Audit

Status as of April 2026 — all critical and high issues resolved.

---

## ✅ RESOLVED — Critical

### 1. Missing environment variables crash with unclear errors
**Fix:** `src/lib/env.ts` + `src/instrumentation.ts` — startup validation throws on missing required vars with a clear list.

### 2. Unauthenticated PDF analysis (quota abuse)
**Fix:** `src/app/api/analyze-report/route.ts` — auth check runs before any AI/OCR call. Unauthenticated requests receive 401.

### 3. `JSON.parse(data.analysis)` can throw in step-processing
**Fix:** `src/app/onboarding/components/step-processing.tsx` — wrapped in try/catch with `typeof` guard; shows "Invalid response from server" on failure.

### 4. saveLabResult failure not propagated to client
**Fix:** `src/app/api/analyze-report/route.ts` — returns 500 with explicit error when save fails; client shows error message.

### 5. Supplements start_date not validated
**Fix:** `src/app/api/supplements/route.ts` — Zod schema with `.refine()` validates ISO date format; normalised to YYYY-MM-DD before insert.

### 6. Profile delete ID type mismatch
**Fix:** `src/app/actions/user-data.ts` — `deleteLabResult()` accepts `number | string`, parses internally with `parseInt(id, 10)` and validates with `Number.isNaN`.

---

## ✅ RESOLVED — High

### 7. Rate limit dev bypass not explicit
**Fix:** `src/services/rateLimitService.ts` — bypass only when `DISABLE_RATE_LIMIT=true` (explicit env var). Never bypasses on `NODE_ENV` alone.

### 8. generate-questions: JSON response not wrapped in object
**Fix:** `src/app/api/generate-questions/route.ts` — prompt asks for `{ "questions": [...] }` wrapper; Zod validates the wrapper; bare array fallback for backward compat.

### 9. global_ai_cache: no RLS
**Fix:** `supabase_schema.sql` — deny-all RLS policy on `global_ai_cache`. Accessed via service role only.

### 10. feedback INSERT policy allowed any user_id
**Fix:** `supabase_schema.sql` — INSERT policy now `WITH CHECK ((SELECT auth.uid()) = user_id)`.

### 11. Type-unsafe cache read in generate-questions
**Fix:** `src/app/api/generate-questions/route.ts` — `parseCachedQuestions()` type guard validates shape before use.

### 12. supabaseAdmin null-guard
**Fix:** `src/app/api/generate-questions/route.ts` — null-checks `supabaseAdmin` before any call.

---

## ✅ RESOLVED — Security / Production

### 13. `javascript:history.back()` in not-found.tsx
**Fix:** `src/app/not-found.tsx` — replaced `<Link href="javascript:...">` with `<button onClick={() => window.history.back()}>`. Added `"use client"` directive.

### 14. Service worker caching authenticated routes
**Fix:** `public/sw.js` — rewrote SW. Auth-protected routes (`/dashboard`, `/results`, `/auth`, etc.) are explicitly excluded from cache. Network-first for HTML navigation. Cache-first only for `/_next/static/` and icons.

### 15. global-error.tsx Tailwind classes not applied
**Fix:** `src/app/global-error.tsx` — replaced all Tailwind `className` with inline styles. The global error boundary renders its own `<html>/<body>` without the app's CSS pipeline.

### 16. LICENSE file missing
**Fix:** `LICENSE` created (MIT, copyright Tanmay Shah 2026).

### 17. generate-questions missing from vercel.json
**Fix:** `vercel.json` — added `generate-questions` (30s) and `demo-ask-ai` (30s).

### 18. OCR.space missing from CSP connect-src
**Fix:** `next.config.ts` — added `https://api.ocr.space` to `connect-src`.

### 19. /demo missing from sitemap and robots.txt
**Fix:** `src/app/sitemap.ts` — added `/demo` (priority 0.8). `public/robots.txt` — added `Allow: /demo`.

### 20. manifest.json minimal
**Fix:** `public/manifest.json` — added `display_override`, `shortcuts` for Dashboard and AI Assistant, `categories`, `lang`, `scope`.

### 21. README GitHub placeholder URLs
**Fix:** `README.md` — replaced `your-username` with `tanmayshahh`.

---

## Remaining known limitations (acceptable for launch)

| Item | Note |
|------|------|
| Sentry not configured | Instrumentation hook is in place; enable by uncommenting and adding `SENTRY_DSN` |
| OCR.space scanned PDF support | Works when `OCR_SPACE_API_KEY` is set; gracefully falls back to image-based error |
| Wearable sync (Apple Health, Oura) | Roadmapped Q3 2026 |
| Health timeline | Roadmapped Q2 2026 |
| Vercel Pro plan required | Hobby plan's 10s timeout is insufficient for AI analysis route (60s needed) |

---

## Summary

| Severity | Total | Resolved |
|----------|-------|----------|
| Critical | 6 | 6 ✅ |
| High | 6 | 6 ✅ |
| Security/Production | 9 | 9 ✅ |
| **Total** | **21** | **21 ✅** |
