"use server";

import Groq from "groq-sdk";
import { checkRateLimit } from "@/services/rateLimitService";
import { logger } from "@/lib/logger";

// Initialize Groq (conditionally)
let groq: Groq;
if (process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
} else {
    logger.error("GROQ_API_KEY is not set. Groq SDK will not be initialized.");
}

export interface ClinicalInsight {
    type: 'symptom' | 'lab';
    summary: string;
    riskLevel: 'low' | 'moderate' | 'high' | 'critical';
    confidence: number;
    details: Array<{
        label: string;
        value: string;
        status: 'stable' | 'warning' | 'critical';
        trend?: 'up' | 'down' | 'flat';
    }>;
    chartData?: Array<{ key: string; data: number }>;
    biomarkers?: Array<{ name: string; value: number; unit: string; range: [number, number]; status: 'normal' | 'abnormal' }>;
    recommendations: string[];
}

// Appointment prep using Groq AI
export async function getAppointmentPrep() {
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
                    content: `Generate preparation for a Hematology follow-up appointment regarding recent hemoglobin changes.`
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 500,
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0].message.content || "{}");
        return {
            summary: result.summary || "Prepare for your upcoming appointment by reviewing recent lab results.",
            checklist: result.checklist || ["Bring recent lab results", "List current medications", "Note any new symptoms"],
            questions: result.questions || ["What do my recent results indicate?", "Should I adjust my current treatment?"]
        };
    } catch (err: unknown) {
        logger.error("Groq appointment prep failed", (err as Error).message);
        // Fallback
        return {
            summary: "For your Hematology follow-up, Dr. Chen will focus on your recent hemoglobin drop.",
            checklist: [
                "Bring log of daily energy levels",
                "List of current supplements",
                "Record of any dizzy spells"
            ],
            questions: [
                "Is the drop in hemoglobin related to my new medication?",
                "When should I re-test?"
            ]
        };
    }
}

// Real AI Generation using Groq
export type GroqResponse =
    | { success: true; data: ClinicalInsight }
    | { success: false; error: string; status: number; retryAfter?: number };

export async function generateClinicalInsight(prompt: string, contextType: 'symptom' | 'lab' | 'report'): Promise<GroqResponse> {
    const limit = await checkRateLimit();
    if (!limit.success) {
        return {
            success: false,
            error: limit.message || "Too Many Requests",
            status: 429,
            retryAfter: limit.retryAfter
        };
    }

    if (!process.env.GROQ_API_KEY || !groq) { // Check if groq was initialized
        logger.error("Missing Groq API Key or Groq SDK not initialized");
        return { success: false, error: "Configuration Error", status: 500 };
    }

    const validContextTypes = ['symptom', 'lab', 'report'];
    if (!validContextTypes.includes(contextType)) {
        logger.error(`Invalid contextType provided: ${contextType}`);
        return { success: false, error: "Invalid context type", status: 400 };
    }

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
       "details": [{ "label": "Test Name", "value": "Result", "status": "normal|high|low|critical", "trend": "up|down|flat" }],
       "recommendations": ["Follow-up 1", "Follow-up 2"]
   }`;
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
            model: "llama-3.3-70b-versatile",
            temperature: 0.2, // Low temperature for consistent, factual results
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
