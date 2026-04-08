# MedAssist — AI-Powered Clinical Intelligence

![Landing Page Mockup](https://raw.githubusercontent.com/TanmayShah29/MedAssist/main/public/image.png)

## 1. Abstract
**MedAssist** is an intelligent health platform engineered to bridge the clinical communication gap between complex diagnostics and patient health literacy. It transforms unstructured, clinical blood work PDFs into longitudinal, plain-English insights, enabling proactive healthcare management and reducing physician consultation friction. 

This project demonstrates a production-ready application of modern **Design Engineering**, integrating robust system architecture, seamless LLM integration, and a carefully constrained user experience (UX).

## 2. The Problem Space
Patients frequently receive lab results via patient portals with limited to zero context. Standard reference ranges lack nuance—a "normal" value might actually be suboptimal, while a slightly elevated value may induce unnecessary panic. Physicians, meanwhile, lack the time to manually parse historical lab PDFs to construct longitudinal trend analyses.

**Key Challenges Identified:**
- **Data Silos:** Diagnostic PDFs are effectively "dark data", inaccessible for computational trend analysis.
- **Health Illiteracy:** Medical jargon creates a high barrier to entry for patient engagement.
- **Provider Friction:** Physicians spend valuable consultation time explaining baseline variances rather than discussing proactive treatment plans.

## 3. Engineering & Design Solution

### Data Pipeline Architecture
To solve the "dark data" problem, MedAssist utilizes a hybrid extraction pipeline:
1. **First-Pass Digital Extraction:** PDF.js is used to strip pure text vectors from modern digital lab reports.
2. **OCR Fallback Layer:** If a user uploads a scanned or photographed document, the system automatically routes the buffer to the `OCR.space` Vision layer to reconstruct the tabular data.
3. **Structured AI Synthesis:** The combined raw strings are piped to **Groq (Meta Llama-3.3-70B-Versatile)** with strict JSON-schema enforcement to extract validated arrays of `Biomarkers`.

### Human-Computer Interaction (HCI) Decisions
We engineered the UI with several distinct constraints to respect the gravity of clinical data:
- **Triage Taxonomy:** Biomarkers are strictly categorized via traffic-light heuristics (`Optimal`, `Warning`, `Critical`). Muted neutral tones form the base UI layer so that these clinical flags immediately capture maximum visual hierarchy.
- **Contextual Disclosure:** Rather than dumping exhaustive definitions, MedAssist uses hover-state tooltips on biomarkers to reveal clinical purpose on-demand.
- **Print Optimization:** Recognizing that physicians still heavily rely on physical charts or PDF attachments, the `@media print` CSS engine is aggressively targeted to strip away digital "fluff" while maintaining the color taxonomy for glanceable triage.
- **Zero-State Fallback:** A fully functional "Demo Mode" was architected to bypass the "blank slate" problem, allowing end-users to immediately experience the platform's value proposition without uploading sensitive data.

### 4. Technical Implementation details
Built on a modern Full-Stack foundation:
- **Application Framework:** Next.js (App Router, Server Actions, API Routes) natively designed for edge-compatible speed.
- **State & Database:** Supabase PostgreSQL with structured relational schemas (`Users`, `Profiles`, `Lab Results`, `Biomarkers`).
- **Performance:** Extensive use of `React.useMemo` for client-side calculations and dynamic Framer Motion animations for perceived-latency reduction during AI processing waits.
- **Type Safety:** 100% end-to-end TypeScript interfaces.

## 5. UI/UX Quick Wins Implemented
During our iterative sprint, the following high-impact improvements were implemented:
1. **Dynamic Symptom Mapping:** Moved away from rigid text inputs toward dynamic, pre-compiled symptom chips (e.g., Fatigue, Headache) which the Groq LLM layers against the lab metrics.
2. **Context-Aware Chat:** Replaced static chat prompt suggestions with dynamically synthesized "Pills" generated conditionally by scanning the user's immediate `Critical` and `Warning` flags.
3. **Comprehensive Data Dictionary:** Expanded the internal cross-reference dictionary to handle over 35 unique biomarkers, rendering plain-English tooltips flawlessly.

---

## 6. Development & Installation

### Prerequisites
- Node.js 20+
- Active Supabase Project / Account
- Groq API Key
- OCR.space API Key

### Start the Build
1. Clone the repository:
   ```bash
   git clone https://github.com/TanmayShah29/MedAssist.git
   cd MedAssist
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables via `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OCR_SPACE_API_KEY=your_ocr_apikey
   GROQ_API_KEY=your_groq_apikey
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

---
*Developed for Academic Design Engineering Requirements | 2026*
