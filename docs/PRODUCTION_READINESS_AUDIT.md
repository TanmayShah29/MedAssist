# MedAssist — Production Readiness Audit

Status as of June 2026 — all critical and high issues resolved via Deep CTO Review.

---

## ✅ RESOLVED — Critical (June 2026 Deep Audit)

### 1. Direct RPC Injection (IDOR)
**Fix:** `supabase_schema.sql` — Enforced `(SELECT auth.uid()) = p_user_id` inside the `save_complete_report` PL/pgSQL function to prevent spoofing.

### 2. Streaming Data Loss (Race Condition)
**Fix:** `src/app/api/ask-ai/route.ts` — Wrapped the conversation history DB insert inside Vercel's `waitUntil()` so the write survives HTTP stream closures.

### 3. Unbounded AI Context Window (DoS)
**Fix:** `src/app/api/ask-ai/route.ts` — Bounded the `previousMessages` query to 10 and implemented a strict 1000-character cap per message to prevent Groq API timeouts.

### 4. Deceptive Health Score Floor (Medical Safety)
**Fix:** `src/lib/health-logic.ts` — Removed the hardcoded score floor of 50. The score now mathematically reflects actual biomarker values.

### 5. Silent Data Loss on Historical Records
**Fix:** `src/app/actions/user-data.ts` — Increased the `getUserBiomarkerHistory` query limit from 50 to 1000.

### 6. Open Redirect Vulnerability
**Fix:** `src/app/onboarding/components/step-processing.tsx` — Validated that `errorData.redirect` starts with `/` to prevent external redirects.

### 7. PDF Extraction DoS
**Fix:** `src/lib/extractPdfText.ts` — Added a strict 20-second `Promise.race` timeout to the synchronous `pdf-parse` execution.

### 8. Unencrypted PHI at Rest
**Fix:** `src/lib/crypto/encryption.ts` + `medical-data.ts` — Implemented AES-256-GCM application-level encryption for `raw_ocr_text` and `raw_ai_json` payloads.

---

## Remaining known limitations (acceptable for launch)

| Item | Note |
|------|------|
| Sentry not configured | Instrumentation hook is in place; enable by uncommenting and adding `SENTRY_DSN` |
| OCR.space scanned PDF support | Works when `OCR_SPACE_API_KEY` is set; gracefully falls back to image-based error |
| Wearable sync (Apple Health, Oura) | Roadmapped Q3 2026 |
| Health timeline | Roadmapped Q2 2026 |
| Vercel Pro plan required | Hobby plan's 10s timeout is insufficient for AI analysis route (60s needed) |
