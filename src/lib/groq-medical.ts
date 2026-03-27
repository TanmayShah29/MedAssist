import Groq from "groq-sdk";
import { ExtractionResultSchema } from "./validations/analysis";
import { logger } from "@/lib/logger";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "llama-3.3-70b-versatile";
const GROQ_TIMEOUT_MS = 45_000; // 45s to avoid hung requests

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
    plainSummary: string;
    symptomConnections: Array<{
        symptom: string;
        relatedBiomarkers: string[];
        explanation: string;
    }>;
    longitudinalInsights?: string[];
}

export interface BiomarkerContext {
    name: string;
    value: number | string; // DB stores as TEXT; use parseFloat() for arithmetic
    unit: string;
    status: string;
    reference_range_min?: number | null;
    reference_range_max?: number | null;
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);
    try {
        const completion = await groq.chat.completions.create(
            {
                messages: [
                    {
                        role: "system",
                        content: `You are a medical data extraction assistant. You are an educational tool — you NEVER diagnose, prescribe, or provide treatment plans.

Extract ALL biomarker values from the provided lab report text. Return ONLY valid JSON — no markdown, no backticks, no explanation outside the JSON.

CRITICAL INSTRUCTION: NEVER guess, impute, or hallucinate values. If a specific biomarker (e.g., Vitamin D, Iron) is NOT explicitly listed in the text with a corresponding value, DO NOT include it in the JSON output at all. Only extract what is visibly present.

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
      "category": must be EXACTLY one of: "hematology" | "inflammation" | "metabolic" | "vitamins" | "other"
             Use these definitions:
             - hematology: CBC values like Hemoglobin, RBC, WBC, Platelets, Hematocrit, PCV, MCV, MCH, MCHC, Neutrophils, Lymphocytes, Eosinophils, Basophils, Monocytes, Reticulocytes
             - inflammation: CRP, ESR, Ferritin, Procalcitonin, IL-6, Fibrinogen, D-Dimer
             - metabolic: Glucose, HbA1c, Insulin, Cholesterol (Total/LDL/HDL/VLDL), Triglycerides, Creatinine, BUN, eGFR, Uric Acid, ALT, AST, ALP, GGT, Bilirubin, Albumin, Total Protein, Sodium, Potassium, Chloride, Bicarbonate, Calcium, Magnesium, Phosphorus, Iron, TIBC, TSH, T3, T4
             - vitamins: Vitamin B12, Vitamin D, Vitamin C, Vitamin E, Vitamin K, Folate, Folic Acid, Zinc, Selenium, Biotin, Thiamine, Riboflavin
             - other: anything that doesn't fit the above categories
      "confidence": number (0-1),
      "aiInterpretation": string (1-2 sentences, plain English, never diagnostic)
    }
  ],
  "healthScore": number (0-100),
  "riskLevel": "low" | "moderate" | "high",
  "summary": string (2-3 sentences),
  "plainSummary": string (2-3 sentences),
  "symptomConnections": [
    {
      "symptom": string,
      "relatedBiomarkers": string[],
      "explanation": string
    }
  ],
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
- STRICT RULE: Extract ONLY the biomarkers physically present in the text. Do NOT populate fields with random, default, or assumed values. If the report doesn't mention Magnesium, do not include Magnesium.
- Extract every biomarker present in the text
- status: "optimal" if within range, "warning" if slightly outside (≤20% outside range), "critical" if significantly outside (>20% outside range or clinically concerning)
- aiInterpretation must follow ALL of these rules:
    1. State what the biomarker measures in simple, plain terms (1 sentence)
    2. Reference the patient's actual numeric value AND their reference range in the same sentence
    3. If out of range, explain 2-3 possible causes in plain language (e.g., "This can occur with iron-poor diet, heavy periods, or chronic inflammation.")
    4. If in range, briefly note why this is good (e.g., "This is within the healthy range, which means your red blood cells are carrying oxygen efficiently.")
    5. NEVER make it only "consult a doctor" — always give actual educational information first
    6. NEVER say "you have", "diagnosed with", "you are suffering from", or any diagnostic language
    7. NEVER use emojis
    GOOD example: "Hemoglobin measures the oxygen-carrying protein in your red blood cells. Your level of 11.2 g/dL is below the reference range of 12–16 g/dL, which can indicate mild anemia. This may result from low iron intake, vitamin B12 deficiency, or increased red blood cell breakdown — worth discussing with your doctor if you experience fatigue or breathlessness. Always consult your doctor before making health decisions."
    BAD example: "Hemoglobin is a protein that carries oxygen. Your result is slightly low. Please consult a doctor."
- summary: 2-3 sentence plain English overview. Educational tone only.
- plainSummary: a 2-3 sentence plain English summary of the overall report. Reference the actual categories present and any flagged values specifically. Example: "Your blood count is healthy with all markers in the normal range. Your metabolic panel shows one concern — glucose is elevated at 145 mg/dL which is above the normal limit of 100. Vitamin levels were not included in this report."
- symptomConnections: map user's reported symptoms to relevant extracted biomarkers. Only include connections that are medically relevant to the actual extracted values. If no connection exists for a symptom, omit it from the array.
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
            },
            { signal: controller.signal }
        );

        // Scenario A: empty content from Groq
        const raw = completion.choices[0]?.message?.content;
        if (!raw || raw.trim().length === 0) {
            throw new AIExtractionError("AI analysis returned no content. Please try again.");
        }

        // FOR AUDIT - Log exact Groq response
        logger.info("\n================ GROQ RAW JSON RESPONSE ================\n" + raw + "\n========================================================\n");

        // Strip accidental markdown code fences before parsing
        const cleaned = raw
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        // Scenario B: malformed JSON
        let parsedJson;
        try {
            parsedJson = JSON.parse(cleaned);
        } catch (err) {
            logger.error("AI JSON Parse Error:", err);
            throw new AIExtractionError("AI returned malformed JSON data. Please try again.");
        }

        // Zod validation with safeParse for better error logging
        const validationResult = ExtractionResultSchema.safeParse(parsedJson);
        if (!validationResult.success) {
            logger.error("AI Validation Error (Zod issues):", JSON.stringify(validationResult.error.issues, null, 2));
            // Scenario A variant: try to salvage biomarkers if the rest of the schema failed
            const salvaged = (parsedJson.biomarkers || []).filter(
                (b: Record<string, unknown>) => b.name && b.value !== undefined && b.status
            );
            if (salvaged.length === 0) {
                throw new AIExtractionError("AI returned data that failed validation and no valid biomarkers could be extracted. Please try again.");
            }
            logger.warn(`Salvaged ${salvaged.length} biomarkers after Zod validation failure — proceeding with partial data.`);
            // Return a minimal valid structure with salvaged biomarkers
            return {
                biomarkers: salvaged,
                healthScore: typeof parsedJson.healthScore === 'number' ? parsedJson.healthScore : 50,
                riskLevel: ['low', 'moderate', 'high'].includes(parsedJson.riskLevel) ? parsedJson.riskLevel : 'moderate',
                summary: typeof parsedJson.summary === 'string' && parsedJson.summary.length > 5
                    ? parsedJson.summary
                    : 'Lab report processed. Please consult your doctor for interpretation.',
                plainSummary: typeof parsedJson.plainSummary === 'string' ? parsedJson.plainSummary : '',
                symptomConnections: Array.isArray(parsedJson.symptomConnections) ? parsedJson.symptomConnections : [],
            };
        }

        // Scenario C: empty biomarkers array — Groq couldn't find any values
        if (validationResult.data.biomarkers.length === 0) {
            throw new AIExtractionError(
                "No biomarkers were found in this PDF. Make sure you are uploading a digital lab report with numeric test results, not a prescription or doctor note."
            );
        }

        return validationResult.data;
    } catch (error: unknown) {
        if (error instanceof AIExtractionError) {
            throw error;
        }
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('AI analysis timed out. Please try again.');
        }
        const isRateLimit = (error as { status?: number })?.status === 429 || (error as Error).message?.includes("rate_limit");
        if (isRateLimit) {
            throw new Error(
                "RATE_LIMIT: Too many requests. Please wait a minute and try again."
            );
        }
        throw new Error(`AI analysis failed: ${(error as Error).message || "Unknown error"}`);
    } finally {
        clearTimeout(timeoutId);
    }
}

// ── Health Q&A ─────────────────────────────────────────────────────────────

export async function answerHealthQuestion(
    question: string,
    biomarkers: BiomarkerContext[],
    symptoms: string[],
    previousMessages: { role: 'user' | 'assistant', content: string }[] = [],
    profile?: { first_name?: string; age?: number; sex?: string; blood_type?: string } | null
): Promise<string> {
    const biomarkerContextStr = biomarkers?.length > 0
        ? `The user has the following biomarkers from their lab report:\n${biomarkers.map(b =>
            `- ${b.name}: ${b.value} ${b.unit} (status: ${b.status}, reference: ${b.reference_range_min}-${b.reference_range_max})`
        ).join('\n')}`
        : 'The user has not uploaded a lab report yet.'

    const systemPrompt = `You are a personal health assistant for MedAssist. You help users understand their lab results in plain English.

User Profile:
- Name: ${profile?.first_name || 'Not provided'}
- Age: ${profile?.age || 'Not provided'}
- Sex: ${profile?.sex || 'Not provided'}
- Blood Type: ${profile?.blood_type || 'Not provided'}

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
        // FOR AUDIT - Log system prompt
        console.log("\n================ GROQ ASSISTANT SYSTEM PROMPT ================\n");
        console.log(systemPrompt);
        console.log("\n==============================================================\n");

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
        const isRateLimit = (error as { status?: number })?.status === 429 || (error as Error).message?.includes("rate_limit");
        if (isRateLimit) {
            throw new Error(
                "RATE_LIMIT: Too many requests. Please wait a minute and try again."
            );
        }
        throw new Error(
            `AI question failed: ${(error as Error).message || "Unknown error"}`
        );
    }
}

export async function generateDoctorQuestions(biomarkers: BiomarkerContext[]): Promise<string[]> {
    const focusMarkers = biomarkers
        .filter(b => b.status !== 'optimal')
        .sort((a, _b) => (a.status === 'critical' ? -1 : 1))
        .slice(0, 5);

    if (focusMarkers.length === 0) {
        return [
            "What proactive steps can I take to maintain my current optimal levels?",
            "Are there any specific screenings I should plan for my age group?",
            "How often should I repeat this exact panel to track my stability?"
        ];
    }

    try {
        const context = focusMarkers.map(b =>
            `${b.name}: ${b.value} ${b.unit} (Status: ${b.status}, Ref: ${b.reference_range_min}-${b.reference_range_max})`
        ).join('\n');

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a clinical assistant. Generate 3 highly specific, professional questions for a user to ask their doctor based on their lab results.
Questions should:
- Reference specific values and units
- Be professional but easy for the user to say
- Focus on the most concerning (critical/warning) findings
- Ask about potential next steps, lifestyle changes, or follow-up tests
- NO preamble, just a JSON array of strings.`
                },
                {
                    role: "user",
                    content: `Generate questions for these markers:\n${context}`
                }
            ],
            model: MODEL,
            response_format: { type: "json_object" },
            temperature: 0.3,
        });

        const result = JSON.parse(completion.choices[0].message.content || '{"questions": []}');
        return result.questions || result || [];
    } catch (err) {
        logger.error("Failed to generate doctor questions", err);
        return [
            "What do these specific findings mean for my long-term health?",
            "What lifestyle changes could help improve my marker levels?",
            "When should we re-test to see if my interventions are working?"
        ];
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
        const isRateLimit = (error as { status?: number })?.status === 429 || (error as Error).message?.includes("rate_limit");
        if (isRateLimit) {
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
        logger.error("Groq appointment prep failed", (err as Error).message);
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
        logger.error("AI Generation Failed", (err as Error).message);
        return { success: false, error: "AI Generation Failed", status: 500 };
    }
}

