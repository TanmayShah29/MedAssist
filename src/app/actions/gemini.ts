"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "");

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
    chartData?: Array<{ key: string; data: number }>; // For simple visualizations
    biomarkers?: Array<{ name: string; value: number; unit: string; range: [number, number]; status: 'normal' | 'abnormal' }>;
    recommendations: string[];
}

// MOCK data for appointments (Restored for build compatibility)
export async function getAppointmentPrep(appointmentId: string) {
    // Simulate AI generation
    await new Promise(r => setTimeout(r, 1000));

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

import { checkRateLimit } from "@/services/rateLimitService";
import { logger } from "@/lib/logger";

// Real AI Generation
export type GeminiResponse =
    | { success: true; data: ClinicalInsight }
    | { success: false; error: string; status: number; retryAfter?: number };

export async function generateClinicalInsight(prompt: string, contextType: 'symptom' | 'lab'): Promise<GeminiResponse> {
    const limit = await checkRateLimit();
    if (!limit.success) {
        // Return proper 429 response
        return {
            success: false,
            error: limit.message || "Too Many Requests",
            status: 429,
            retryAfter: limit.retryAfter
        };
    }

    if (!process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY) {
        logger.error("Missing Gemini API Key in environment");
        return { success: false, error: "Configuration Error", status: 500 };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const systemPrompt = `
        You are a clinical AI engine. Analyze the input and return a STRICT JSON structure.
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
        }
        `;
        const result = await model.generateContent(systemPrompt);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(text);
        return { success: true, data };
    } catch (err) {
        logger.error("AI Generation Failed", err);
        return { success: false, error: "AI Generation Failed", status: 500 };
    }
}
