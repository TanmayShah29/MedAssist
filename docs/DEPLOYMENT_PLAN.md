# MedAssist Vercel Deployment Plan

A phased plan to fix production blockers and deploy to Vercel. Each phase is designed so you can deploy after completing it — Phase 1 gets you *deployable*, later phases make it *robust*.

---

## Pre-Deploy Checklist (Vercel)

Before any code changes, ensure:

- [ ] **Vercel project** linked to your repo
- [ ] **Environment variables** set in Vercel (Settings → Environment Variables):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `GROQ_API_KEY`
  - `OCR_SPACE_API_KEY`
- [ ] **Supabase** — `supabase_schema.sql` fully run (tables, RLS, RPCs, `check_rate_limit`, `save_complete_report`)
- [ ] **Auth callback URL** — Add `https://your-domain.vercel.app/auth/callback` to Supabase Auth redirect URLs

---

## Phase 1 — Minimum Viable Deploy (Critical Fixes)

**Goal:** App runs without hard crashes and critical data bugs. Estimated: 2–3 hours.

### 1.1 Env validation at startup
**Why:** Missing env vars cause unclear errors; fail fast instead of on first upload.

**Approach:** Add `src/lib/env.ts`:
```ts
// Validate required env vars; throw at import if missing
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'GROQ_API_KEY',
  'OCR_SPACE_API_KEY',
] as const;

export function validateEnv() {
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing env: ${missing.join(', ')}. Check Vercel Environment Variables.`);
  }
}
```
- Call `validateEnv()` at the top of:
  - `src/app/api/analyze-report/route.ts`
  - `src/lib/groq-medical.ts` (or wherever Groq is first used)
  - `src/lib/extractPdfText.ts` (or extractionService)
- **Optional:** Call in `instrumentation.ts` (Next.js) for app-wide validation at boot.

**Files:** Create `src/lib/env.ts`; add import + call in 2–3 entry points.

---

### 1.2 Propagate saveLabResult failure to client
**Why:** User thinks data is saved when it isn’t; no retry path.

**Approach:** In `src/app/api/analyze-report/route.ts`:
- If `!saveResult.success`, return `NextResponse.json({ success: false, error: saveResult.error || 'Failed to save results. Please try again.' }, { status: 500 })` instead of silently continuing.
- Client already checks `!response.ok` — just ensure we return 500 on save failure.

**Files:** `src/app/api/analyze-report/route.ts` (PDF path ~line 112, manual path already returns on failure).

---

### 1.3 Guard JSON.parse in step-processing
**Why:** Malformed `data.analysis` throws and shows generic error.

**Approach:** In `src/app/onboarding/components/step-processing.tsx`:
```ts
let analysisData;
try {
  if (!data.analysis || typeof data.analysis !== 'string') {
    throw new Error('Invalid response from server');
  }
  analysisData = JSON.parse(data.analysis);
} catch {
  setErrorData({ title: 'Server Error', detail: 'Invalid response. Please try again.', canRetry: true });
  setState('error');
  return;
}
```

**Files:** `src/app/onboarding/components/step-processing.tsx`.

---

### 1.4 Require auth for analyze-report (optional for Phase 1)
**Why:** Unauthenticated users can burn OCR/Groq quota.

**Options:**
- **A (strict):** Require auth; if `!user`, return 401 + “Sign in to analyze reports.” Middleware already blocks `/dashboard` and `/results`; landing could link to auth before upload.
- **B (defer):** Keep current behavior; rely on rate limit. Add in Phase 2 if abuse appears.

**Recommendation:** Do **A** if you want to control cost; **B** if you want “try before signup” and accept some abuse.

---

### 1.5 Supplements: validate start_date
**Why:** Invalid dates cause DB errors or bad data.

**Approach:** In `src/app/api/supplements/route.ts` POST:
```ts
const parsed = new Date(start_date);
if (isNaN(parsed.getTime())) {
  return NextResponse.json({ error: 'Invalid start_date. Use YYYY-MM-DD.' }, { status: 400 });
}
// Use parsed.toISOString().split('T')[0] for storage
```

**Files:** `src/app/api/supplements/route.ts`.

---

### 1.6 Profile delete: safe ID handling
**Why:** `parseInt(id)` can lose precision for large bigint IDs.

**Approach:** Keep `parseInt` for now (IDs usually small). Or change `deleteLabResult` to accept `string | number` and pass through. Low risk initially.

**Priority:** Can defer to Phase 2 if IDs are < 1M.

---

**Phase 1 deployment:** Run `npm run build`; fix any build errors. Deploy to Vercel. Test: signup → onboarding → upload PDF → verify save; manual entry; skip.

---

## Phase 2 — Stability & Security

**Goal:** Hardening and protection against abuse. Estimated: 2–4 hours.

### 2.1 Rate limit: don’t bypass in production
**Approach:** Only bypass when explicit flag: `process.env.DISABLE_RATE_LIMIT === 'true'` (for local dev). Remove `NODE_ENV === 'development'` bypass, or add `RATE_LIMIT_ENABLED=true` and only skip when both dev and flag set.

**Files:** `src/services/rateLimitService.ts`.

---

### 2.2 Feedback: rate limit or auth
**Approach:** Either add rate limit to feedback (same IP hash pattern as analyze-report) or restrict insert to authenticated users (policy `CHECK (auth.uid() IS NOT NULL)`).

**Files:** New API route for feedback if needed; or server action; update Supabase policy.

---

### 2.3 global_ai_cache: RLS
**Approach:** `CREATE POLICY "Deny all" ON global_ai_cache FOR ALL USING (false);` — table only used via service role.

**Files:** Migration or `supabase_schema.sql`.

---

### 2.4 Timeouts for OCR and Groq
**Approach:** Use `AbortController` with e.g. 45s timeout for `fetch` in extractPdfText; pass `signal` to Groq SDK if supported. On timeout, throw user-friendly error.

**Files:** `src/lib/extractPdfText.ts`, `src/lib/groq-medical.ts`.

---

## Phase 3 — Polish & Observability

**Goal:** Production-grade reliability and debugging. Estimated: 2–3 hours.

### 3.1 Replace console with logger
**Approach:** Replace all `console.log`/`console.error` with `logger.info`/`logger.error`. Logger already gates in production.

**Files:** step-tour, step-upload, step-processing, doctor-questions, medicine-cabinet, layout, etc.

---

### 3.2 SetExtractedData / analysis shape
**Approach:** Add a mapper in step-processing that converts API `BiomarkerResult[]` to `ExtractedLabValue[]` (add `rangePosition: 50`, `trend: ''` if missing).

**Files:** `src/app/onboarding/components/step-processing.tsx`.

---

### 3.3 Demo mode cache isolation
**Approach:** When `demoMode` is true, either skip writing to localStorage, or use key `medassist_cached_demo` vs `medassist_cached_lab_results`. Never mix.

**Files:** `src/app/dashboard/dashboard-client.tsx`.

---

## Phase 4 — Optional Hardening

- **biomarker-trends ordering:** Confirm schema and fix ordering by report date if needed.
- **Stronger typing:** Replace `as any` with proper types.
- **Monitoring:** Wire `logger.error` to Sentry or similar.

---

## Vercel-Specific Notes

1. **Function timeout:** Default 10s on hobby; up to 60s on Pro. `analyze-report` has `maxDuration = 60`; ensure plan allows this.
2. **Edge vs Node:** `analyze-report` uses `runtime = "nodejs"` (needed for Buffer). Other routes can stay default.
3. **Env at build vs runtime:** `NEXT_PUBLIC_*` are baked in at build. Server vars (`GROQ_API_KEY`, etc.) are runtime — set in Vercel for Production, Preview, Development as needed.
4. **Cold starts:** First request after idle can be slow; consider Vercel’s speed insights or minimal keep-warm if needed.

---

## Execution Order

```
Phase 1 (must-have for deploy):
├── 1.1 Env validation
├── 1.2 saveLabResult failure propagation
├── 1.3 JSON.parse guard (step-processing)
├── 1.4 Auth for analyze-report (choose A or B)
├── 1.5 Supplements start_date validation
└── 1.6 Profile delete (defer if IDs small)

Phase 2 (soon after first deploy):
├── 2.1 Rate limit bypass fix
├── 2.2 Feedback protection
├── 2.3 global_ai_cache RLS
└── 2.4 OCR/Groq timeouts

Phase 3 (polish):
├── 3.1 Logger everywhere
├── 3.2 ExtractedData shape
└── 3.3 Demo cache isolation
```

---

## Quick Deploy Path (Minimal)

If you need to deploy **today** with minimal changes:

1. Set all env vars in Vercel.
2. Fix 1.2 (save failure) — ~5 min.
3. Fix 1.3 (JSON.parse guard) — ~5 min.
4. Run `npm run build`; fix any errors.
5. Deploy.

Add 1.1 (env validation) and 1.5 (supplements) in the next deployment. 1.4 (auth) is a product choice.
