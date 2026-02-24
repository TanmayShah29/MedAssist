# MedAssist — Understand Your Lab Results

MedAssist is an intelligent health platform that transforms confusing blood work PDFs into plain-English insights. By connecting raw clinical data with advanced AI, MedAssist helps you track your longitudinal health trends and prepare for your next doctor's visit with confidence.

![Landing Page Mockup](https://raw.githubusercontent.com/tanmayshah/medassist/main/public/screenshot-landing.png)
*Note: Please replace with actual screenshot paths after deployment.*

## Key Features
- **AI Lab Report Analysis**: Automated extraction of biomarkers from PDF reports using OCR.space and Groq (Llama 3.3).
- **Personalized Care Plans**: Data-driven diet and lifestyle recommendations based on your out-of-range values.
- **Longitudinal Tracking**: Visualize how your health markers change over time with interactive trend charts.
- **Doctor Preparation**: Auto-generated questions tailored to your specific clinical flags.
- **Privacy First**: Enterprise-grade security with Supabase row-level encryption. Your data is never sold.

## Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **AI Engine**: [Groq SDK](https://groq.com/) (Llama 3.3 70B)
- **OCR Engine**: [OCR.space API](https://ocr.space/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)

## Getting Started

### Prerequisites
- Node.js 20+ 
- A Supabase account
- A Groq API key
- An OCR.space API key

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/medassist.git
   cd medassist
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see `.env.example`):
   ```bash
   cp .env.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables
The following keys are required in your `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations (server-only)
- `GROQ_API_KEY`: API key from Groq Console
- `OCR_SPACE_API_KEY`: API key from OCR.space

## Deployment
Deploy to Vercel in one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftanmayshah%2Fmedassist)

---
© 2026 MedAssist. Built by Tanmay Shah.
