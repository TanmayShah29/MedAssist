import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

export async function extractPdfText(base64: string, mimeType: string = 'application/pdf'): Promise<string> {
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest'];

    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent([
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64
                    }
                },
                {
                    text: 'Extract all text content from this lab report PDF. Return the raw text exactly as it appears, including all numbers, units, and reference ranges. Do not summarize or interpret — just extract the text.'
                }
            ]);

            const text = result.response.text();

            if (text && text.length >= 50) {
                return text;
            }
        } catch (error) {
            console.warn(`Model ${modelName} failed:`, error);
            // Continue to next model
        }
    }

    throw new Error('Could not extract text from PDF. All models failed or file may be empty.');
}
