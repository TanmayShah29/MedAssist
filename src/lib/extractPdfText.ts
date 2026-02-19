import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function extractPdfText(fileBuffer: Buffer | string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Convert Buffer to base64 if necessary
    const base64Data = Buffer.isBuffer(fileBuffer)
        ? fileBuffer.toString("base64")
        : fileBuffer;

    const result = await model.generateContent([
        "Extract all text from this medical report PDF exactly as it appears. Preserve structure, headings, test names, values, units, and reference ranges. Return only the extracted text, no commentary.",
        {
            inlineData: {
                data: base64Data,
                mimeType: "application/pdf",
            },
        },
    ]);

    return result.response.text();
}
