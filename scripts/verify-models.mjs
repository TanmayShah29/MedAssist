import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function verifyModels() {
    console.log("🔍 Starting Direct Model Verification...\n");

    // 1. Verify Environment Variables
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (!geminiKey) {
        console.error("❌ ERROR: Missing Gemini API Key (GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY)");
    } else {
        console.log("✅ Gemini API Key detected (" + geminiKey.substring(0, 5) + "...)");
    }

    if (!groqKey) {
        console.error("❌ ERROR: Missing Groq API Key (GROQ_API_KEY)");
    } else {
        console.log("✅ Groq API Key detected (" + groqKey.substring(0, 5) + "...)");
    }

    if (!geminiKey || !groqKey) {
        process.exit(1);
    }

    // 2. Test Gemini 2.0 Flash (OCR Simulation)
    console.log("\n--- Testing Gemini 2.0 Flash (OCR) ---");
    const genAI = new GoogleGenerativeAI(geminiKey);
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    try {
        console.log("Sending simple text prompt to Gemini...");
        const result = await geminiModel.generateContent("Explain what OCR is in one sentence.");
        const text = result.response.text();
        console.log("✅ Gemini Response:", text.trim());
    } catch (error) {
        console.error("❌ Gemini Failed:", error.message);
        if (error.message.includes("404")) {
            console.error("   -> Hint: Model name might be incorrect or API key doesn't have access.");
        }
    }

    // 3. Test Groq Llama 3.3 (Clinical Logic Simulation)
    console.log("\n--- Testing Groq Llama 3.3 (Clinical Logic) ---");
    const groq = new Groq({ apiKey: groqKey });

    try {
        console.log("Sending simple medical reasoning prompt to Groq...");
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a medical assistant." },
                { role: "user", content: "Is a Fasting Glucose of 150 mg/dL high? Answer in one word: High/Normal/Low." }
            ],
            model: "llama-3.3-70b-versatile",
        });
        const ans = completion.choices[0]?.message?.content;
        console.log("✅ Groq Response:", ans);
    } catch (error) {
        console.error("❌ Groq Failed:", error.message);
    }

    console.log("\n--------------------------------");
    console.log("Verification Complete.");
}

verifyModels();
