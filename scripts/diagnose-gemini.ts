import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

console.log("--- Diagnostics ---");
console.log("GEMINI_API_KEY present:", !!key);
if (key) {
    console.log("Key length:", key.length);
    console.log("Key first 4 chars:", key.substring(0, 4));
}

async function listModels() {
    if (!key) {
        console.error("No API key found.");
        return;
    }

    try {
        console.log("\nFetching available models...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);

        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            console.error(await response.text());
            return;
        }

        const data = await response.json();
        const models = data.models?.map((m: any) => m.name) || [];
        console.log("Available models:", JSON.stringify(models, null, 2));

        // Check for specific models
        const interesting = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro-vision'];
        console.log("\nChecking target models:");
        interesting.forEach(m => {
            const found = models.some((av: string) => av.endsWith(m));
            console.log(`- ${m}: ${found ? 'AVAILABLE' : 'NOT FOUND'}`);
        });

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
