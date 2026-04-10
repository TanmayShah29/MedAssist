# MedAssist — Production Deployment Checklist

Use this before every production release. Check each item before merging to `main`.

---

## 1. Environment variables

- [ ] `NEXT_PUBLIC_SUPABASE_URL` set in Vercel env (all environments)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Vercel env (all environments)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in Vercel env (**Production only** — never Preview)
- [ ] `GROQ_API_KEY` set in Vercel env (Production + Preview)
- [ ] `NEXT_PUBLIC_SITE_URL` set to production domain (e.g. `https://medassist.health`)
- [ ] `DISABLE_RATE_LIMIT` is **not** set (or explicitly `false`) in Production
- [ ] `ENABLE_VERBOSE_LOGGING` is **not** set in Production (or set to `false`)
- [ ] No `.env.local` or `.env.production` file accidentally committed

---

## 2. Supabase

- [ ] `supabase_schema.sql` applied to production project (all tables, RLS, RPCs)
- [ ] `check_rate_limit` RPC exists (run: `SELECT proname FROM pg_proc WHERE proname = 'check_rate_limit'`)
- [ ] `save_complete_report` RPC exists
- [ ] RLS is **enabled** on all tables: `lab_results`, `biomarkers`, `profiles`, `symptoms`, `supplements`, `conversations`, `feedback`
- [ ] Auth → URL Configuration → **Site URL** = production domain
- [ ] Auth → URL Configuration → **Redirect URLs** includes `https://yourdomain.com/auth/callback`
- [ ] Email templates configured (confirmation, password reset)

---

## 3. Security

- [ ] No API keys or secrets in source code or comments
- [ ] `SUPABASE_SERVICE_ROLE_KEY` only referenced in `src/lib/supabase-admin.ts` (server-only file, no `"use client"`)
- [ ] CSP header in `next.config.ts` is up to date — no unnecessary `connect-src` domains
- [ ] `robots.txt` correctly disallows `/dashboard`, `/auth`, `/api/`, `/profile`, `/settings`

---

## 4. Build

```bash
npm run build
```

- [ ] Build completes with **0 errors**
- [ ] Build completes with **0 TypeScript errors** (`npx tsc --noEmit`)
- [ ] Lint passes (`npm run lint`)

---

## 5. Tests

```bash
npm test
```

- [ ] All tests pass (0 failures)
- [ ] Coverage includes: health-logic, retry, API validation, extraction service

---

## 6. Vercel configuration

- [ ] `vercel.json` has `maxDuration` set for all AI routes (analyze-report: 60s, ask-ai: 30s)
- [ ] Vercel project is on **Pro plan** (Hobby plan has 10s function timeout — insufficient for AI analysis)
- [ ] Static assets (`/_next/static/`) have immutable cache headers

---

## 7. Monitoring

- [ ] Error logs visible in Vercel → Functions → Logs
- [ ] (Recommended) Sentry DSN set and `instrumentation.ts` Sentry block uncommented
- [ ] (Recommended) Uptime monitor configured (e.g. Better Uptime, Vercel checks)

---

## 8. Post-deploy smoke test

After deploying, manually verify:

- [ ] Landing page loads at production URL
- [ ] `/auth` sign-up flow works end-to-end (email confirmation if enabled)
- [ ] Onboarding completes and redirects to `/dashboard`
- [ ] Upload a sample PDF — analysis completes in < 60s
- [ ] Dashboard shows health score and biomarkers
- [ ] AI assistant answers a question
- [ ] Supplement can be added and deleted
- [ ] Account deletion wipes all data

---

## 9. Domain & DNS (first deploy only)

- [ ] Custom domain added in Vercel → Settings → Domains
- [ ] DNS records pointed to Vercel (A/CNAME per Vercel instructions)
- [ ] SSL certificate issued (automatic via Vercel)
- [ ] `NEXT_PUBLIC_SITE_URL` updated to custom domain
- [ ] `sitemap.xml` accessible at `https://yourdomain.com/sitemap.xml`
- [ ] `robots.txt` accessible at `https://yourdomain.com/robots.txt`

---

## Quick commands

```bash
# Full pre-deploy check
npm run lint && npx tsc --noEmit && npm test && npm run build

# Deploy to production
npx vercel --prod
```
