# MedAssist — Understand Your Lab Results

MedAssist is an intelligent health platform that transforms confusing blood work PDFs into plain-English insights. By connecting raw clinical data with advanced AI, MedAssist helps you track your longitudinal health trends and prepare for your next doctor's visit with confidence.

## Key Features
- **AI Lab Report Analysis**: Automated extraction of biomarkers from PDF reports using pdf-parse (digital PDFs) and OCR.space (scanned PDFs, requires API key).
- **Personalized Care Plans**: Data-driven diet and lifestyle recommendations based on your out-of-range values.
- **Longitudinal Tracking**: Visualize how your health markers change over time with interactive trend charts.
- **Doctor Preparation**: Auto-generated questions tailored to your specific clinical flags.
- **Privacy First**: Enterprise-grade security with Supabase row-level encryption. Your data is never sold.
- **Sample Data Mode**: Explore all app features with realistic sample data after signing up — no lab report needed to get started.
- **Supplement & Medication Tracking**: Log what you're taking and see automated correlation markers on your biomarker trend charts.
- **Data Portability & Control**: Export functionality and complete account deletion options for full control over your health data.
- **Continuous Feedback**: Built-in feedback system to continually improve the user experience.

## Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **AI Engine**: [Groq SDK](https://groq.com/) (Llama 3.3 70B)
- **OCR Engine**: [pdf-parse](https://www.npmjs.com/package/pdf-parse) (primary) + [OCR.space API](https://ocr.space/) (scanned PDF fallback)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)

## Getting Started

### Prerequisites
- Node.js 20+
- A Supabase account
- A Groq API key
- An OCR.space API key *(optional — only needed for scanned/image-based PDFs)*

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tanmayshah/medassist.git
   cd medassist
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local and fill in your keys
   ```

4. Set up the database:
   - Open your [Supabase project SQL editor](https://supabase.com/dashboard)
   - Copy the full contents of `supabase_schema.sql`
   - Run the SQL — it is fully idempotent (safe to re-run on an existing database)

5. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

See `.env.example` for the full annotated list. Summary:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Service role key (server-only, for saving reports) |
| `GROQ_API_KEY` | ✅ Yes | Groq API key for AI analysis |
| `OCR_SPACE_API_KEY` | ⚠️ Optional | Enables scanned PDF support. Without it, only digital PDFs work. |
| `NEXT_PUBLIC_APP_URL` | ⚠️ Optional | Base URL for absolute links in emails |

## Database Setup

The `supabase_schema.sql` file is the single source of truth for the database. It is:
- **Idempotent** — safe to re-run on an existing database; uses `CREATE IF NOT EXISTS`, `ALTER ... ADD COLUMN IF NOT EXISTS`, and `DROP POLICY IF EXISTS` throughout.
- **Self-migrating** — includes inline `DO $$` blocks for backward-compatible migrations (e.g., renaming columns on existing databases).

Run it in the Supabase SQL editor any time you pull new changes that include schema updates.

## Deployment

Deploy to Vercel in one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftanmayshah%2Fmedassist)

After deploying, add your environment variables in Vercel → Project Settings → Environment Variables, then run `supabase_schema.sql` against your production Supabase project.

---
© 2026 MedAssist. Built by Tanmay Shah.
