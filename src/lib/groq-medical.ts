import Groq from "groq-sdk";

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
    riskLevel: string;
    summary: string;
}

export interface BiomarkerContext {
    name: string;
    value: number;
    unit: string;
    status: string;
}

// ── Extraction ─────────────────────────────────────────────────────────────

export async function extractAndInterpretBiomarkers(
    pdfText: string,
    symptoms: string[]
): Promise<ExtractionResult> {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a medical data extraction assistant. You are an educational tool — you NEVER diagnose, prescribe, or provide treatment plans.

Extract ALL biomarker values from the provided lab report text. Return ONLY valid JSON — no markdown, no backticks, no explanation outside the JSON.

If the user has reported symptoms, consider them when writing interpretations, but NEVER use diagnostic language.

User's reported symptoms: ${symptoms.length > 0 ? symptoms.join(", ") : "none reported"}

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
  "summary": string (2-3 sentences)
}

Rules:
- Extract every biomarker present in the text
- status: "optimal" if within range, "warning" if slightly outside, "critical" if far outside
- healthScore: 0-100 based on proportion of optimal vs warning vs critical values
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

        let parsed: any;
        try {
            parsed = JSON.parse(cleaned);
        } catch {
            throw new Error("AI returned invalid format. Please try again.");
        }

        return {
            biomarkers: parsed.biomarkers || [],
            healthScore: parsed.healthScore ?? 0,
            riskLevel: parsed.riskLevel ?? "low",
            summary: parsed.summary ?? "",
        };
    } catch (error: any) {
        if (error.status === 429 || error.message?.includes("rate_limit")) {
            throw new Error(
                "RATE_LIMIT: Too many requests. Please wait a minute and try again."
            );
        }
        if (error.message?.startsWith("AI returned")) {
            throw error;
        }
        throw new Error(`AI analysis failed: ${error.message || "Unknown error"}`);
    }
}

// ── Health Q&A ─────────────────────────────────────────────────────────────

export async function answerHealthQuestion(
    question: string,
    biomarkers: BiomarkerContext[],
    symptoms: string[]
): Promise<string> {
    const biomarkerSummary = biomarkers
        .map((b) => `${b.name}: ${b.value} ${b.unit} (${b.status})`)
        .join("\n");

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an educational health data assistant. You are NOT a doctor.

You help users understand their lab results in plain, approachable language.

STRICT RULES:
- NEVER use the words: diagnose, prescribe, treatment plan, "you have", "you are suffering"
- Keep answers under 200 words
- Always end your response with: "For personalized medical advice, please consult your physician."
- Use educational, not clinical, tone
- If you don't know something, say so honestly

User's lab results:
${biomarkerSummary}

User's reported symptoms: ${symptoms.length > 0 ? symptoms.join(", ") : "none reported"}`,
                },
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
    } catch (error: any) {
        if (error.status === 429 || error.message?.includes("rate_limit")) {
            throw new Error(
                "RATE_LIMIT: Too many requests. Please wait a minute and try again."
            );
        }
        throw new Error(
            `AI question failed: ${error.message || "Unknown error"}`
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
    } catch (error: any) {
        if (error.status === 429 || error.message?.includes("rate_limit")) {
            throw new Error(
                "RATE_LIMIT: Too many requests. Please wait a minute and try again."
            );
        }
        throw new Error(
            `AI greeting failed: ${error.message || "Unknown error"}`
        );
    }
}
