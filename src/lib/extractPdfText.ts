import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

export async function extractPdfText(base64: string, mimeType: string = 'application/pdf'): Promise<string> {
    // Only gemini-2.0-flash is available for this key
    const modelName = 'gemini-2.0-flash';

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
        } else {
            throw new Error(`Text extraction too short (${text?.length} chars).`);
        }
    } catch (error: any) {
        console.error(`Gemini extraction failed with model ${modelName}:`);
        console.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        if (error.response) {
            console.error(`Response status: ${error.response.status}`);
            console.error(`Response body:`, await error.response.text().catch(() => 'No body'));
        }
        throw new Error(`Gemini PDF extraction failed: ${error.message}`);
    }
}
