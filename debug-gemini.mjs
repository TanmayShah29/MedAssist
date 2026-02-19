import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listModels() {
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No API Key found in .env.local");
        return;
    }
    console.log("Using API Key starting with:", key.substring(0, 5) + "...");

    const genAI = new GoogleGenerativeAI(key);
    try {
        // Note: listModels is a method on the GoogleGenerativeAI instance directly in newer versions,
        // or sometimes requires a ModelManager. Let's try the direct approach first or access via getGenerativeModel meta.
        // Actually, the SDK exposes it via the `response` of a generic request or specific manager?
        // Checking docs... actually, for the JS SDK, listing models might not be directly exposed in the main class in all versions.
        // However, we can try a simple generation with a known model to see if it works, or just print available if `listModels` exists.
        // Wait, the SDK doesn't have a simple listModels() on the main class in v0.1.0? 
        // Let's rely on the error message "Call ListModels to see...".

        // Attempt to just instantiate the detailed one the user wants.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Attempting to generate content with 'gemini-1.5-flash'...");
        const result = await model.generateContent("Test");
        console.log("Success! Model found.");
        console.log(result.response.text());
    } catch (error) {
        console.error("Error:", error.message);
        // If it fails, maybe we can hack it or use fetch directly to list models.
    }
}

// Direct fetch fallback to list models
async function fetchModels() {
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    console.log("Fetching models via REST API...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        if (data.models) {
            console.log("\nAvailable Models:");
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log("No models returned or error:", data);
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

listModels().then(() => fetchModels());
