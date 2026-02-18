# MedAssist 🏥

**MedAssist** is an intelligent, AI-powered medical assistant designed to help users understand their health data, analyze lab reports, and manage their wellness journey. Built with **Next.js 16**, **Supabase**, and advanced LLMs (**Groq/Llama 3**), it provides a secure and meaningful way to interpret complex medical information.

> **Disclaimer**: MedAssist is an educational tool and does not provide medical diagnosis or treatment. Always consult a physician for professional medical advice.

---

## ✨ Key Features

- **📄 AI Lab Report Analysis**: Upload a photo or PDF of your lab report. MedAssist uses vision-capable AI (Groq/Llama 3.2 Vision) to extract biomarkers, interpret results (Optimal, Warning, Critical), and provide a plain-English summary.
- **🤖 Interactive Health Q&A**: Chat with an AI assistant that understands your specific symptoms and extracted biomarkers to answer your health questions.
- **🛡️ Rate Limiting & Security**: Custom PostgreSQL-based rate limiting to prevent abuse, coupled with robust Row Level Security (RLS) via Supabase.
- **📊 Health Dashboard**: Visualize your health data, track trends over time, and manage your profile.
- **🔐 Secure Authentication**: Integrated with Supabase Auth for secure user management.

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Framer Motion](https://www.framer.com/motion/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **Integration**: [Gemini AI](https://deepmind.google/technologies/gemini/) (Optional), [Groq SDK](https://groq.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)

## 🔍 How it Works

MedAssist operates on a sophisticated pipeline designed to transform raw medical data into actionable health insights.

### 1. The User Journey
1.  **Onboarding & Profile**: New users complete a secure onboarding flow, providing basic demographic data and current symptoms. This creates a personalized context for AI analysis.
2.  **Smart Upload**: Users upload lab reports (PDF/Images). The app provides immediate feedback and handles file validation.
3.  **Real-time Processing**: The specific file is sent to our secure API route (`/api/analyze-report`).
4.  **Interactive Dashboard**: Once processed, users land on a comprehensive dashboard showing their "Health Score," critical biomarkers, and trend analysis.

### 2. Technical Architecture & AI Pipeline
The core of MedAssist is the **Biomarker Extraction & reasoning Engine**:

1.  **Vision Analysis**:
    - The uploaded document is converted to base64 and passed to **Llama 3.2 Vision** (via Groq).
    - The model OCRs the text and structurally identifies biomarker names, values, units, and reference ranges.
2.  **Data Normalization**:
    - The raw AI output is strictly validated against a JSON schema.
    - Biomarkers are categorized (e.g., Hematology, Metabolic) and status is normalized (Optimal, Warning, Critical).
3.  **Database Storage**:
    - Validated data is stored in **Supabase (PostgreSQL)**.
    - `lab_results` table links to `biomarkers` (1:N relationship), ensuring efficient querying.
4.  **RAG-Powered Q&A**:
    - When a user asks "What does my high cholesterol mean?", the system retrieves the user's specific recent biomarker data.
    - This context is injected into the system prompt, allowing the LLM to give a personalized answer based on *actual* lab values, not just generic advice.

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js 18+ installed
- A [Supabase](https://supabase.com/) account
- A [Groq](https://groq.com/) API Key

### 1. Clone the repository

```bash
git clone https://github.com/your-username/medassist.git
cd medassist
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and add the following keys:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Configuration
GROQ_API_KEY=your_groq_api_key
# GEMINI_API_KEY=your_gemini_api_key (if used)
```

### 4. Database Setup

Run the SQL migration in your Supabase SQL Editor. You can find the schema in [`supabase_schema.sql`](./supabase_schema.sql) to set up the tables (`rate_limits`, `lab_results`, `biomarkers`, etc.) and Row Level Security policies.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
src/
├── app/                  # Next.js App Router pages and API routes
│   ├── (auth)/           # Authentication pages (login/signup)
│   ├── api/              # API Routes (analyze-report, ask-ai)
│   ├── dashboard/        # User Dashboard
│   ├── onboarding/       # User Onboarding Flow
│   └── results/          # Analysis Results
├── components/           # Reusable UI components
│   ├── charts/           # Recharts components
│   └── ui/               # Radix UI primitives
├── lib/                  # Utility functions and configurations
│   ├── groq-medical.ts   # Groq AI integration logic
│   └── supabase.ts       # Supabase client setup
└── store/                # Zustand stores
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
