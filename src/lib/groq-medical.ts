import Groq from "groq-sdk";
import { ExtractionResultSchema } from "./validations/analysis";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "llama-3.3-70b-versatile";

// ── Types ──────────────────────────────────────────────────────────────────

export interface BiomarkerResult {
    name: string;
    value: number;
    unit: string;
    referenceMin: number | null;
    referenceMax: number | null;
    status: "optimal" | "warning" | "critical";
    category: "hematology" | "inflammation" | "metabolic" | "vitamins" | "other";
    confidence: number;
    aiInterpretation: string;
}

export interface ExtractionResult {
    biomarkers: BiomarkerResult[];
    healthScore: number;
    riskLevel: "low" | "moderate" | "high";
    summary: string;
    longitudinalInsights?: string[];
}

export interface BiomarkerContext {
    name: string;
    value: number;
    unit: string;
    status: string;
    reference_range_min?: number;
    reference_range_max?: number;
    ai_interpretation?: string;
}

// ── Extraction ─────────────────────────────────────────────────────────────

export class AIExtractionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AIExtractionError";
    }
}

export async function extractAndInterpretBiomarkers(
    pdfText: string,
    symptoms: string[],
    history: BiomarkerContext[] = []
): Promise<ExtractionResult> {
    const historicalContext = history.length > 0
        ? `\n\nUser's Historical Lab Data:\n${history.map(b => `- ${b.name}: ${b.value} ${b.unit} (${b.status})`).join("\n")}`
        : "";

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a medical data extraction assistant. You are an educational tool — you NEVER diagnose, prescribe, or provide treatment plans.

Extract ALL biomarker values from the provided lab report text. Return ONLY valid JSON — no markdown, no backticks, no explanation outside the JSON.

MANDATORY: Every interpretation or summary MUST end with "Always consult your doctor before making health decisions."

Do not use emojis in your interpretations or summary.

If historical data is provided, identify trends (e.g., "Glucose has risen 5% since last month") and recognize patterns (e.g., if Ferritin and Hemoglobin are both low, note the correlation).

If the user has reported symptoms, consider them when writing interpretations, but NEVER use diagnostic language.

User's reported symptoms: ${symptoms.length > 0 ? symptoms.join(", ") : "none reported"}${historicalContext}

Return only a JSON object with this structure:
{
  "biomarkers": [
    {
      "name": string,
      "value": number,
      "unit": string,
      "referenceMin": number | null,
      "referenceMax": number | null,
      "status": "optimal" | "warning" | "critical",
      "category": "hematology" | "inflammation" | "metabolic" | "vitamins" | "other",
      "confidence": number (0-1),
      "aiInterpretation": string (1-2 sentences, plain English, never diagnostic)
    }
  ],
  "healthScore": number (0-100),
  "riskLevel": "low" | "moderate" | "high",
  "summary": string (2-3 sentences),
  "longitudinalInsights": string[] (optional, list of detected trends or multi-biomarker patterns)
}

Calculate a health score from 0-100 using this exact formula:
- Each biomarker with status "optimal" contributes 100 points
- Each biomarker with status "warning" contributes 75 points  
- Each biomarker with status "critical" contributes 40 points
- Final score = sum of all points divided by (total biomarkers × 100) × 100
- Apply a minimum floor: if any biomarkers are optimal, score cannot be below 50
- Round to nearest whole number

Score interpretation:
- 85-100: Excellent
- 70-84: Good
- 55-69: Fair
- Below 55: Needs Attention

Return the score as an integer in the "healthScore" field.

MANDATORY: AI summary MUST end with "Always consult your doctor before making health decisions."

Rules:
- Extract every biomarker present in the text
- status: "optimal" if within range, "warning" if slightly outside, "critical" if far outside
- aiInterpretation: plain English a non-medical person can understand. NEVER say "you have", "diagnosed with", or "you are suffering from"
- summary: 2-3 sentence plain English overview. Educational tone only.
- Return ONLY the JSON object. No other text.`,
                },
                {
                    role: "user",
                    content: `Extract all biomarkers from this lab report:\n\n${pdfText}`,
                },
            ],
            model: MODEL,
            temperature: 0.1,
            max_tokens: 4000,
            response_format: { type: "json_object" },
        });

        const raw = completion.choices[0].message.content || "";

        // Strip accidental markdown code fences before parsing
        const cleaned = raw
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        let parsedJson;
        try {
            parsedJson = JSON.parse(cleaned);
        } catch (err) {
            console.error("AI JSON Parse Error:", err);
            throw new AIExtractionError("AI returned malformed JSON data. Please try again.");
        }

        try {
            // Validate with Zod
            return ExtractionResultSchema.parse(parsedJson);
        } catch (err) {
            console.error("AI Validation Error:", err);
            throw new AIExtractionError("AI returned data that failed health-safety validation. Please try again.");
        }
    } catch (error: unknown) {
        if (error instanceof AIExtractionError) {
            throw error;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((error as any).status === 429 || (error as Error).message?.includes("rate_limit")) {
            throw new Error(
                "RATE_LIMIT: Too many requests. Please wait a minute and try again."
            );
        }
        throw new Error(`AI analysis failed: ${(error as Error).message || "Unknown error"}`);
    }
}

// ── Health Q&A ─────────────────────────────────────────────────────────────

export async function answerHealthQuestion(
    question: string,
    biomarkers: BiomarkerContext[],
    symptoms: string[],
    previousMessages: { role: 'user' | 'assistant', content: string }[] = []
): Promise<string> {
    const biomarkerContextStr = biomarkers?.length > 0
        ? `The user has the following biomarkers from their lab report:\n${biomarkers.map(b =>
            `- ${b.name}: ${b.value} ${b.unit} (status: ${b.status}, reference: ${b.reference_range_min}-${b.reference_range_max})`
        ).join('\n')}`
        : 'The user has not uploaded a lab report yet.'

    const systemPrompt = `You are a personal health assistant for MedAssist. You help users understand their lab results in plain English.

${biomarkerContextStr}
${symptoms.length > 0 ? `\nUser's reported symptoms: ${symptoms.join(", ")}\n` : ""}
Rules:
- Never diagnose or prescribe
- Always recommend consulting a physician
- Reference the user's specific values when answering
- Be warm, clear, and educational
- Keep responses concise and actionable
- Do not use any emojis in your response`

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                ...previousMessages,
                {
                    role: "user",
                    content: question,
                },
            ],
            model: MODEL,
            temperature: 0.3,
            max_tokens: 400,
        });

        return completion.choices[0].message.content || "";
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((error as any).status === 429 || (error as Error).message?.includes("rate_limit")) {
            throw new Error(
                "RATE_LIMIT: Too many requests. Please wait a minute and try again."
            );
        }
        throw new Error(
            `AI question failed: ${(error as Error).message || "Unknown error"}`
        );
    }
}

// ── AI Greeting ────────────────────────────────────────────────────────────

export async function generateAIGreeting(
    biomarkers: BiomarkerContext[],
    symptoms: string[],
    firstName: string
): Promise<string> {
    const biomarkerSummary = biomarkers
        .map((b) => `${b.name}: ${b.value} ${b.unit} (${b.status})`)
        .join("\n");

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are MedAssist AI, a warm and approachable health education assistant.

Generate a personalized opening message for a user named ${firstName}.

RULES:
- Reference 1-2 specific findings from their biomarkers
- Mention any symptom correlations if relevant
- Offer to discuss specific topics
- Warm, approachable tone — NOT clinical
- Max 3 sentences
- Then add 2 suggested follow-up questions the user might want to ask, formatted naturally like:
  "You might want to ask me: ..."
- NEVER use the words: diagnose, prescribe, "you have", "you are suffering"
- DO NOT use any emojis in your response

User's lab results:
${biomarkerSummary}

User's reported symptoms: ${symptoms.length > 0 ? symptoms.join(", ") : "none reported"}`,
                },
                {
                    role: "user",
                    content: "Generate my personalized greeting.",
                },
            ],
            model: MODEL,
            temperature: 0.5,
            max_tokens: 300,
        });

        return completion.choices[0].message.content || "";
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((error as any).status === 429 || (error as Error).message?.includes("rate_limit")) {
            throw new Error(
                "RATE_LIMIT: Too many requests. Please wait a minute and try again."
            );
        }
        throw new Error(
            `AI greeting failed: ${(error as Error).message || "Unknown error"}`
        );
    }
}

// ── Appointment Prep ───────────────────────────────────────────────────────

export async function getAppointmentPrep(context: string): Promise<{ summary: string, checklist: string[], questions: string[] }> {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a medical appointment preparation assistant. Generate a concise prep guide with:
- summary: 1-2 sentence overview of what to expect
- checklist: 3 items to bring/prepare
- questions: 2 important questions to ask the doctor

Return ONLY valid JSON with keys: summary, checklist (string array), questions (string array). No markdown.`
                },
                {
                    role: "user",
                    content: `Generate preparation for: ${context}`
                }
            ],
            model: MODEL,
            temperature: 0.3,
            max_tokens: 500,
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0].message.content || "{}");
        return {
            summary: result.summary || "Prepare for your appointment by reviewing recent health changes.",
            checklist: result.checklist || ["Bring recent lab results", "List current medications", "Note any new symptoms"],
            questions: result.questions || ["What do my findings indicate?", "What are the next steps?"]
        };
    } catch (err: unknown) {
        console.error("Groq appointment prep failed", (err as Error).message);
        // Fallback
        return {
            summary: "Please bring your recent lab results and a list of questions.",
            checklist: ["Lab results", "Medication list", "Symptom log"],
            questions: ["What do these results mean?", "Do I need to change my routine?"]
        };
    }
}

// ── Clinical Insight (Generic) ─────────────────────────────────────────────

export interface ClinicalInsight {
    type: 'symptom' | 'lab' | 'report';
    summary: string;
    riskLevel: 'low' | 'moderate' | 'high' | 'critical';
    confidence: number;
    details: Array<{
        label: string;
        value: string;
        status: 'stable' | 'warning' | 'critical' | 'optimal';
        trend?: 'up' | 'down' | 'flat';
    }>;
    chartData?: Array<{ key: string; data: number }>;
    biomarkers?: Array<BiomarkerResult>;
    recommendations: string[];
}

export type GroqResponse =
    | { success: true; data: ClinicalInsight }
    | { success: false; error: string; status: number; retryAfter?: number };

export async function generateClinicalInsight(prompt: string, contextType: 'symptom' | 'lab' | 'report'): Promise<GroqResponse> {
    try {
        let systemPrompt = `You are a clinical AI engine. Analyze the input and return a STRICT JSON structure.
        No markdown.
        
        Input: "${prompt}"
        
        Return this schema:
        {
            "type": "${contextType}",
            "summary": "Clinical summary...",
            "riskLevel": "low|moderate|high|critical",
            "confidence": 0-100,
            "details": [{ "label": "Observation", "value": "Value", "status": "stable|warning|critical", "trend": "up|down|flat" }],
            "recommendations": ["Action 1", "Action 2"]
        }`;

        if (contextType === 'report') {
            systemPrompt = `You are an expert medical report analyzer. Given the text of a medical report, provide:
   1. A clear summary of key findings
   2. Any values outside normal reference ranges, highlighted
   3. Possible conditions suggested by the results
   4. Recommended follow-up actions
   Always remind the user to consult a qualified doctor and not rely solely on AI analysis.
   
   Return the response in JSON format matching the schema:
   {
       "type": "report",
       "summary": "Key findings summary...",
       "riskLevel": "low|moderate|high|critical",
       "confidence": 0-100,
       "details": [{ "label": "Test Name", "value": "Result", "status": "optimal|warning|critical", "trend": "up|down|flat" }],
       "biomarkers": [{ "name": "Name", "value": 0, "unit": "unit", "status": "optimal|warning|critical", "category": "category", "referenceMin": 0, "referenceMax": 0, "aiInterpretation": "string" }],
       "recommendations": ["Follow-up 1", "Follow-up 2"]
   }
   
   IMPORTANT: "status" must be exactly one of: "optimal", "warning", or "critical"
   - optimal = value is within reference range
   - warning = slightly outside reference range
   - critical = significantly outside reference range`;
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: MODEL,
            temperature: 0.2,
            max_tokens: 2000,
            response_format: { type: "json_object" },
        });

        const text = completion.choices[0].message.content || "{}";
        const data = JSON.parse(text);
        return { success: true, data };
    } catch (err: unknown) {
        console.error("AI Generation Failed", (err as Error).message);
        return { success: false, error: "AI Generation Failed", status: 500 };
    }
}

