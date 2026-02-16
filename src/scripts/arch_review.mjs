
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Load Env manually
const envPath = path.resolve(process.cwd(), '.env.local');
let apiKey = "";
try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/GEMINI_API_KEY=(.+)/);
    if (match) apiKey = match[1].trim();
} catch (e) {
    console.error("Could not read .env.local");
    process.exit(1);
}

if (!apiKey) {
    console.error("No API Key found");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function getChat() {
    const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];

    for (const modelName of models) {
        try {
            console.log(`Testing model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            // Test ping
            await model.generateContent("Test");
            console.log(`Successfully connected to ${modelName}`);

            return model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{
                            text: `
                        SYSTEM_INSTRUCTION: You are "Gemini Principal", a Senior Distinguished Engineer at Google specializing in Distributed Systems, Postgres, and Cloud Security. 
                        
                        Current Context: You are reviewing a Rate Limiting architecture implementation for "MedAssist", a medical AI application.
                        Architecture Stack: Supabase (Postgres), Vercel (Edge), Next.js.
                        
                        Your Characteristics:
                        - Adversarial: You actively look for flaws.
                        - Technical: You speak in db-ops, latencies (ms), and big-O notation.
                        - Critical: You verify RLS, Locking, and Scaling assumptions.
                        - Constructive: You propose concrete optimizations.
                        
                        Do not be polite. Be rigorous.
                        ` }]
                    },
                    {
                        role: "model",
                        parts: [{ text: "Acknowledged. I am initialized as Gemini Principal. Present the architecture specs. I will audit for concurrency race conditions, security bypasses, and scaling bottlenecks. Proceed." }]
                    }
                ]
            });
        } catch (e) {
            console.warn(`Failed to connect to ${modelName}: ${e.message}`);
        }
    }
    throw new Error("All models failed.");
}

async function runDialogue() {
    const chat = await getChat();

    console.log("🟦 [ANTIGRAVITY]: Initiating Architecture Review...\n");

    // --- PHASE 1 ---
    const p1 = `
    PHASE 1: ARCHITECTURE PRESENTATION
    
    Here is the deployed architecture for MedAssist Rate Limiting:
    
    1. **Core Mechanism**: Deterministic Time Buckets.
       - We calculated Bucket ID = floor(extract(epoch from now()) / window_seconds).
       - Key = hash(ip) + ":" + window + ":" + bucket_id.
       
    2. **State Store**: Supabase (PostgreSQL).
       - Table rate_limits (key PK, count int, expires_at timestamptz).
       - No Redis. No In-Memory Fallback.
       
    3. **Atomicity Strategy**:
       - RPC Function check_rate_limit.
       - Uses INSERT ... VALUES ... ON CONFLICT (key) DO UPDATE SET count = count + 1.
       - This relies on Postgres Row-Level Locking for atomicity.
       
    4. **Security**:
       - RLS Policy: CREATE POLICY "Deny All" ... FOR ALL USING (false).
       - The API uses SUPABASE_SERVICE_ROLE_KEY to bypass this for writes.
       - Client uses Anon Key (which is blocked by RLS).
       
    Critique this approach. Is the Deterministic Bucket strategy sound?
    `;
    console.log(`\n👨‍💻 [ANTIGRAVITY]: ${p1.trim()}\n`);
    const r1 = await chat.sendMessage(p1);
    console.log(`\n🤖 [GEMINI]: ${r1.response.text().trim()}\n`);

    // --- PHASE 2 ---
    const p2 = `
    PHASE 2: ADVERSARIAL REVIEW
    
    Drill deeper. 
    
    1. **Concurrency**: Under high load (10k RPS), does ON CONFLICT cause contention?
       - We are hitting the SAME row for the same IP.
       - But distinct IPs hit distinct rows.
       
    2. **Index Bloat**: We index expires_at.
       - We run DELETE FROM ... WHERE expires_at < now() every 5 mins.
       - Is Vacuuming a concern here?
       
    3. **Performance**:
       - Is floor(extract(...)) computed in App or DB? 
       - Currently in DB (PLPGSQL). Is that a bottleneck?
    `;
    console.log(`\n👨‍💻 [ANTIGRAVITY]: ${p2.trim()}\n`);
    const r2 = await chat.sendMessage(p2);
    console.log(`\n🤖 [GEMINI]: ${r2.response.text().trim()}\n`);

    // --- PHASE 3 ---
    const p3 = `
    PHASE 3: STRESS SCENARIOS
    
    Scenario: Multi-Region Traffic (US, EU, JP). DB is in US-East-1.
    
    1. **Latency**:
       - User in Japan -> Edge Function (JP) -> DB (US).
       - RTT could be 150ms+.
       - User waits 150ms just for rate limit check?
       
    2. **Connection Pooling**:
       - We use Supabase Transaction Mode (Port 6543).
       - Max connections ~500 (Pro plan).
       - At 10k RPS serverless, do we exhaust the pool?
       
    Propose mitigations. Should we use Global Read Replicas? Or move RL to Edge Middleware with Redis (Backtracking)?
    Defend the Postgres choice.
    `;
    console.log(`\n👨‍💻 [ANTIGRAVITY]: ${p3.trim()}\n`);
    const r3 = await chat.sendMessage(p3);
    console.log(`\n🤖 [GEMINI]: ${r3.response.text().trim()}\n`);

    // --- PHASE 4 ---
    const p4 = `
    PHASE 4: SECURITY AUDIT
    
    1. **RLS Bypass**:
       - I set "Deny All".
       - But if I leak the Service Role Key, game over.
       - Is there a way to lock the Service Role Key to ONLY execute this specific RPC?
       
    2. **IP Spoofing**:
       - We use x-forwarded-for.
       - If Supabase/Vercel layer passes a spoofed header, we hash the spoofed IP.
       - Mitigation?
       
    3. **Replay**: 
       - Can I replay a valid RPC call? (No, because it comes from backend, not client).
    `;
    console.log(`\n👨‍💻 [ANTIGRAVITY]: ${p4.trim()}\n`);
    const r4 = await chat.sendMessage(p4);
    console.log(`\n🤖 [GEMINI]: ${r4.response.text().trim()}\n`);

    // --- PHASE 5 ---
    const p5 = `
    PHASE 5: FINAL SYNTHESIS
    
    Verdict time.
    
    1. **Go / No-Go** for Production (10k Daily Active Users)?
    2. **Go / No-Go** for Scale (1M Daily Active Users)?
    3. **Top 3 Pre-Flight Checks** I must run right now.
    `;
    console.log(`\n👨‍💻 [ANTIGRAVITY]: ${p5.trim()}\n`);
    const r5 = await chat.sendMessage(p5);
    console.log(`\n🤖 [GEMINI]: ${r5.response.text().trim()}\n`);
}

runDialogue();
