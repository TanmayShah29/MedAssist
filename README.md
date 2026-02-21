# MedAssist

**MedAssist** is an intelligent, AI-powered medical assistant designed to help users understand their health data, analyze lab reports, and manage their wellness journey. Built with **Next.js 16**, **Supabase**, and advanced LLMs (**Groq/Llama 3.3**), it provides a secure and meaningful way to interpret complex medical information.

> **Disclaimer**: MedAssist is an educational tool and does not provide medical diagnosis or treatment. Always consult a physician for professional medical advice.

---

## Key Features

- **AI Lab Report Analysis**: Upload a PDF of your lab report. MedAssist uses **OCR.space** for precise text extraction and **Groq (Llama 3.3 70B)** to extract biomarkers, interpret results (Optimal, Warning, Critical), and provide a plain-English summary.
- **Optimistic Health Scoring**: A proprietary, forgiving health score algorithm that rewards "Optimal" values while providing context for areas needing attention. No more demoralizing scores for minor deviations.
- **Interactive Health Q&A**: Chat with an AI assistant that understands your specific symptoms and extracted biomarkers to answer your health questions contextually.
- **Smart Dashboard**: A visualized clinical overview showing your critical biomarkers, trends, and categorized health insights (Metabolic, Hematology, etc.).
- **Secure Platform**: Integrated with Supabase Auth for secure user management and Row Level Security (RLS) for data privacy.
- **Engaging Onboarding**: A verified, step-by-step processing flow that keeps you informed while the AI analyzes your data.

## Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Framer Motion](https://www.framer.com/motion/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **AI & OCR**: 
  - [OCR.space](https://ocr.space/) (PDF Text Extraction)
  - [Groq SDK](https://groq.com/) (Llama 3.3 70B for medical reasoning)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)

## How it Works

MedAssist operates on a sophisticated pipeline designed to transform raw medical data into actionable health insights.

### 1. The User Journey
1.  **Onboarding & Profile**: New users complete a secure onboarding flow, providing basic demographics and symptoms to create a personalized context.
2.  **Smart Upload**: Users upload lab reports. The app validates the file and initiates a binary upload stream.
3.  **Real-time Processing**: 
    - **Step 1 (OCR)**: The file is sent to OCR.space to extract raw text from validity-verified PDFs.
    - **Step 2 (Analysis)**: The extracted text is processed by Llama 3.3 (via Groq) to identify biomarkers and detailed interpretations.
4.  **Interactive Dashboard**: Users land on a dashboard showing a "Health Score", categorized results, and priority actions.

### 2. Technical Architecture
1.  **Direct Binary Upload**: Files are streamed directly to the OCR provider to ensure data integrity and bypass encoding issues.
2.  **Data Normalization**: 
    - Raw AI output is validated against a strict JSON schema.
    - Biomarkers are normalized to standard units and statuses (Optimal, Warning, Critical).
3.  **RAG-Powered Q&A**: 
    - User questions trigger a Retrieval-Augmented Generation flow, pulling the user's *actual* recent biomarkers to provide personalized answers.

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js 18+ installed
- A [Supabase](https://supabase.com/) account
- A [Groq](https://groq.com/) API Key
- An [OCR.space](https://ocr.space/) API Key (Free)

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

# AI & OCR Configuration
GROQ_API_KEY=your_groq_api_key
OCR_SPACE_API_KEY=your_ocr_space_api_key
```

### 4. Database Setup

Run the SQL migration in your Supabase SQL Editor to set up the tables (`rate_limits`, `lab_results`, `biomarkers`, etc.) and Row Level Security policies.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Login/Signup
│   ├── api/              # API Routes (analyze-report, ask-ai)
│   ├── dashboard/        # Main Dashboard
│   ├── onboarding/       # Upload & Processing Flow
│   └── results/          # Detailed Results
├── components/           # UI Components
├── lib/                  # Utilities
│   ├── extractPdfText.ts # OCR.space integration
│   ├── groq-medical.ts   # Groq AI logic
│   └── supabase.ts       # Supabase client
└── store/                # Zustand stores
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
