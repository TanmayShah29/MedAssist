# MedAssist

AI-powered lab report analysis. Upload a blood work PDF, get plain-English explanations of every biomarker, track trends over time, and know exactly what to ask your doctor.

**Stack:** Next.js 16 · Supabase · Groq AI (Llama 3.3 70B) · Tailwind CSS 4 · TypeScript

---

## Features

- **PDF Analysis** — Extract every biomarker from a digital lab report PDF in 20–40 seconds
- **Manual Entry** — Type in values directly if you don't have a PDF
- **Health Score** — 0–100 score calculated from your biomarker statuses
- **Trend Charts** — Longitudinal charts showing each biomarker across all uploads
- **AI Assistant** — Ask questions about your results in plain language
- **Supplement Tracking** — Log supplements and see correlation markers on trend charts
- **Doctor Questions** — AI-generated, value-specific questions for your next appointment
- **Symptom Connections** — Link your reported symptoms to related biomarkers
- **Account Deletion** — One click to permanently erase all data

---

## Quickstart (local dev)

### 1. Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier is fine)
- A [Groq](https://console.groq.com) API key (free tier is fine)

### 2. Clone and install

```bash
git clone https://github.com/tanmayshahh/medassist.git
cd medassist
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # Project Settings → API → service_role
GROQ_API_KEY=gsk_your_key
```

> ⚠️ **Never commit `.env.local`.** It's already in `.gitignore`.

### 4. Set up the database

Run the full schema in the Supabase SQL editor:

```bash
# Copy and paste the contents of supabase_schema.sql into:
# Supabase Dashboard → SQL Editor → New query → Run
```

This creates all tables, RLS policies, and the `check_rate_limit` and `save_complete_report` RPCs that the app requires.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to production (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "production ready"
git push origin main
```

### 2. Import into Vercel

- Go to [vercel.com/new](https://vercel.com/new) → Import your repo
- Framework: **Next.js** (auto-detected)
- Root directory: `.` (default)

### 3. Set environment variables in Vercel

In your Vercel project → **Settings → Environment Variables**, add:

| Variable | Value | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `GROQ_API_KEY` | Groq API key | ✅ |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` | Recommended |
| `OCR_SPACE_API_KEY` | [ocr.space](https://ocr.space/ocrapi) free key | Optional |
| `SENTRY_DSN` | Sentry project DSN | Optional |

### 4. Supabase Auth redirect URLs

In Supabase → **Authentication → URL Configuration**:

- **Site URL:** `https://yourdomain.com`
- **Redirect URLs:** `https://yourdomain.com/auth/callback`

### 5. Deploy

Vercel deploys automatically on every push to `main`. Manual deploy:

```bash
npx vercel --prod
```

---

## Error monitoring (Sentry — optional but recommended)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Then in `src/instrumentation.ts`, uncomment the Sentry block and add `SENTRY_DSN` to your Vercel env vars. The `logger.onError` hook will forward all `logger.error()` calls to Sentry automatically.

---

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze-report/   # PDF → AI extraction → DB save
│   │   ├── ask-ai/           # AI health assistant Q&A
│   │   ├── assistant/        # Clinical insight generation
│   │   ├── biomarker-trends/ # Trend data for charts (Edge runtime)
│   │   ├── generate-questions/ # AI doctor question generation
│   │   ├── supplements/      # CRUD for supplement tracking
│   │   ├── feedback/         # User feedback collection
│   │   └── account/delete/   # Permanent account deletion
│   ├── actions/              # Next.js Server Actions (DB writes via supabaseAdmin)
│   ├── dashboard/            # Main health dashboard
│   ├── results/              # Per-report detail view
│   ├── assistant/            # AI chat interface
│   ├── profile/              # User profile management
│   ├── settings/             # App settings
│   ├── onboarding/           # First-run onboarding flow
│   └── auth/                 # Sign in / sign up
├── components/               # React UI components
├── lib/
│   ├── groq-medical.ts       # All Groq AI calls (extraction, Q&A, greeting)
│   ├── retry.ts              # Exponential-backoff retry utility
│   ├── logger.ts             # Structured logger with Sentry hook
│   ├── env.ts                # Environment variable validation
│   ├── health-logic.ts       # Health score calculation
│   └── supabase-admin.ts     # Service-role Supabase client (server-only)
├── services/
│   ├── aiAnalysisService.ts  # Thin wrapper over groq-medical.ts
│   ├── extractionService.ts  # PDF text extraction with error mapping
│   └── rateLimitService.ts   # IP-hashed rate limiting via Supabase RPC
├── middleware.ts             # Auth + onboarding routing
└── instrumentation.ts        # Next.js startup hook (env validation + Sentry init)
```

---

## Testing

```bash
npm test           # Run all tests once
npm run test:watch # Watch mode
```

Test files live in `src/__tests__/`:

| File | What it covers |
|---|---|
| `health-logic.test.ts` | Score calculation, status normalisation |
| `retry.test.ts` | Retry logic, backoff, no-retry conditions |
| `api-validation.test.ts` | Zod schemas for all API routes |
| `extractionService.test.ts` | PDF extraction error handling |

---

## Rate limits

| Limit | Value |
|---|---|
| IP — per minute | 10 requests |
| IP — per hour | 100 requests |
| User — uploads per hour | 5 reports |
| User — AI messages per minute | 10 messages |

Rate limiting uses the `check_rate_limit` Supabase RPC with hashed IPs (raw IPs are never stored).

Set `DISABLE_RATE_LIMIT=true` in `.env.local` to bypass during local development.

---

## Security

- **Service role key** is never exposed to the client — only used in Server Actions and API routes
- **Row-Level Security (RLS)** is enabled on all Supabase tables; users can only access their own data
- **Security headers** on every response: CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy
- **Input validation** with Zod on all API routes before any DB or AI call
- **Server-side file validation** — file type, size (10 MB limit), and MIME type checked before processing
- **AI content safety** — system prompts forbid diagnostic language; all responses include medical disclaimers

---

## Environment variable reference

See [`.env.example`](.env.example) for the full annotated list.

---

## License

MIT — see [LICENSE](LICENSE).

Built by [Tanmay Shah](https://github.com/tanmayshahh).
