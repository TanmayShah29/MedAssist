"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
    Send,
    Paperclip,
    Brain,
    ChevronRight,
    Search,
    FileText,
    Activity,
    Zap,
    Upload
} from "lucide-react";
import { BadgeGroup } from "@/components/ui/badge-group";
import { MessageBubble, type Message } from "@/components/ui/message-bubble";
import { BouncingDots } from "@/components/ui/bouncing-dots";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────
interface BiomarkerData {
    name: string;
    value: number;
    unit: string;
    status: string;
    category: string;
}

// ── Static sidebar data ────────────────────────────────────────────────────
const evidenceSteps = [
    { id: "1", label: "Symptom extraction", source: "Groq AI", ms: "120ms", Icon: Search },
    { id: "2", label: "Lab correlation", source: "Knowledge Graph", ms: "45ms", Icon: FileText },
    { id: "3", label: "Risk scoring", source: "MedCalc API", ms: "89ms", Icon: Activity },
    { id: "4", label: "Response generation", source: "Groq Llama 3.3", ms: "1.2s", Icon: Zap },
];

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AssistantPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const prefillQuery = searchParams.get("q");

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [biomarkers, setBiomarkers] = useState<BiomarkerData[]>([]);
    const [symptoms, setSymptoms] = useState<string[]>([]);

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, sending]);

    // ── Init: fetch user data + generate greeting ──────────────────────────
    const initAssistant = useCallback(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push("/auth");
            return;
        }

        const [{ data: profile }, { data: bms }, { data: syms }] = await Promise.all([
            supabase.from("profiles").select("first_name").eq("id", user.id).single(),
            supabase.from("biomarkers").select("*").eq("user_id", user.id).limit(20),
            supabase.from("symptoms").select("symptom").eq("user_id", user.id),
        ]);

        const biomarkerData: BiomarkerData[] = (bms || []).map(b => ({
            name: b.name,
            value: b.value,
            unit: b.unit,
            status: b.status,
            category: b.category,
        }));
        const symptomData = (syms || []).map((s: { symptom: string }) => s.symptom);

        setBiomarkers(biomarkerData);
        setSymptoms(symptomData);

        // If no biomarkers, show static greeting
        if (biomarkerData.length === 0) {
            setMessages([{
                id: "1",
                role: "assistant",
                content: "Welcome! Upload your lab results first so I can give you personalized insights. Once I have your biomarker data, I can help you understand your results and answer any health-related questions.",
            }]);
            setLoading(false);
            return;
        }

        // Generate personalized greeting via API
        try {
            const response = await fetch("/api/ask-ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: `Generate a warm, personalized greeting for ${profile?.first_name || "the user"}. Briefly mention 1-2 notable findings from their lab results and offer to discuss them. Keep it to 2-3 sentences plus 2 suggested questions.`,
                    biomarkers: biomarkerData,
                    symptoms: symptomData,
                }),
            });
            const { answer } = await response.json();

            setMessages([{
                id: "1",
                role: "assistant",
                content: answer,
            }]);
        } catch {
            setMessages([{
                id: "1",
                role: "assistant",
                content: `Hi${profile?.first_name ? ` ${profile.first_name}` : ""}! I've reviewed your latest results. Ask me anything about your biomarkers — I'm here to help you understand them.`,
            }]);
        }

        setLoading(false);
    }, [router]);

    useEffect(() => {
        initAssistant();
    }, [initAssistant]);

    // Prefill query from URL param
    useEffect(() => {
        if (prefillQuery && !loading) {
            setInput(decodeURIComponent(prefillQuery));
            inputRef.current?.focus();
        }
    }, [prefillQuery, loading]);

    // ── Send message ───────────────────────────────────────────────────────
    const sendMessage = async () => {
        if (!input.trim() || sending) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
        };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setSending(true);

        try {
            const response = await fetch("/api/ask-ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: input,
                    biomarkers,
                    symptoms,
                }),
            });

            const { answer, error } = await response.json();

            setMessages(prev => [...prev, {
                id: Date.now().toString() + "_ai",
                role: "assistant",
                content: error
                    ? "Sorry, I encountered an error. Please try again."
                    : answer,
            }]);
        } catch {
            setMessages(prev => [...prev, {
                id: Date.now().toString() + "_ai",
                role: "assistant",
                content: "Sorry, something went wrong. Please try again in a moment.",
            }]);
        }

        setSending(false);
    };

    // ── Derive sidebar data from real biomarkers ───────────────────────────
    const detectedEntities = [
        ...symptoms.slice(0, 2).map((s, i) => ({
            id: `s_${i}`,
            label: s,
            type: "symptom" as const,
        })),
        ...biomarkers
            .filter(b => b.status !== "optimal")
            .slice(0, 2)
            .map((b, i) => ({
                id: `b_${i}`,
                label: b.name,
                type: "lab" as const,
            })),
    ];

    const biomarkerConfidence = biomarkers.length > 0
        ? Math.round(biomarkers.reduce((sum, b) => sum + (b.status === "optimal" ? 95 : b.status === "warning" ? 75 : 55), 0) / biomarkers.length)
        : 0;

    // ── Loading state ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col lg:flex-row h-screen lg:h-[100dvh] overflow-hidden bg-[#FAFAF7]">
                <div className="flex flex-col flex-1 lg:w-[52%] lg:flex-none border-r-2 border-[#D4CBBB] bg-[#F7F6F2] h-full">
                    <div className="h-16 border-b border-[#E2DFD8] bg-[#F0EEE8] flex-shrink-0" />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <BouncingDots message="Loading your health context..." />
                        </div>
                    </div>
                    <div className="p-5 border-t border-[#E2DFD8] bg-[#F7F6F2]">
                        <div className="h-11 bg-[#E8E6DF] rounded-[12px] animate-pulse" />
                    </div>
                </div>
                <div className="flex-1 bg-[#1C2B3A] animate-pulse">
                    <div className="h-16 border-b border-[#243447]" />
                    <div className="p-6 space-y-6">
                        <div className="h-12 bg-[#243447] rounded-lg" />
                        <div className="h-24 bg-[#243447] rounded-lg" />
                        <div className="h-40 bg-[#243447] rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col lg:flex-row h-screen lg:h-[100dvh] overflow-hidden bg-[#FAFAF7]">

            {/* LEFT: Chat panel */}
            <div className="flex flex-col flex-1 lg:w-[52%] lg:flex-none border-r-2 border-[#D4CBBB] bg-[#F7F6F2] h-full overflow-hidden">

                {/* Chat header */}
                <div className="h-16 flex items-center justify-between px-4 lg:px-5 
                        border-b border-[#E2DFD8] bg-[#F0EEE8] flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="lg:hidden w-8" />
                        <span className="text-sm font-semibold text-[#1C1917]">
                            Clinical Conversation
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                        <span className="text-xs text-sky-600 font-medium">
                            {biomarkers.length > 0 ? "Context Active" : "No Lab Data"}
                        </span>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.length === 0 && !sending ? (
                        /* Welcome state */
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-sky-100 border 
                                    border-sky-200 flex items-center justify-center 
                                    flex-shrink-0">
                                    <Brain className="w-4 h-4 text-sky-500" />
                                </div>
                                <div className="bg-white rounded-[14px] rounded-tl-[4px] 
                                    border border-[#EAE8E1] p-5 flex-1 shadow-sm">
                                    <p className="text-sm text-[#57534E] leading-relaxed">
                                        {biomarkers.length > 0
                                            ? "I'm ready to discuss your lab results. What would you like to know?"
                                            : "Welcome! Upload your lab results first, then I can provide personalized insights."
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Suggested prompts */}
                            <div className="pl-12">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] 
                                    text-[#A8A29E] mb-3">
                                    Suggested Questions
                                </p>
                                <div className="space-y-2">
                                    {(biomarkers.length > 0 ? [
                                        "What are my most important findings?",
                                        "Explain any out-of-range values",
                                        "What should I ask my doctor?",
                                        "Show me what's most urgent",
                                    ] : [
                                        "What kind of reports can you analyze?",
                                        "What biomarkers do you track?",
                                        "How does the analysis work?",
                                    ]).map(prompt => (
                                        <button
                                            key={prompt}
                                            onClick={() => {
                                                setInput(prompt);
                                                inputRef.current?.focus();
                                            }}
                                            className="w-full text-left px-4 py-3 bg-white 
                                                hover:bg-[#F5F4EF] border border-[#E2DFD8] 
                                                hover:border-[#D9D6CD] rounded-[10px] text-sm 
                                                text-[#57534E] hover:text-[#1C1917] 
                                                transition-all min-h-[44px] flex items-center shadow-sm"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map(msg => (
                                <MessageBubble key={msg.id} message={msg} />
                            ))}

                            {/* Typing indicator */}
                            {sending && (
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 
                                        flex items-center justify-center flex-shrink-0">
                                        <Brain className="w-4 h-4 text-emerald-700" />
                                    </div>
                                    <div className="p-4 rounded-[14px] rounded-tl-[4px] bg-[#F5F4EF] 
                                        border border-[#E8E6DF] min-w-[80px]">
                                        <BouncingDots dots={3} />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-5 border-t border-[#E2DFD8] bg-[#F7F6F2]">
                    <div className="flex gap-3 items-end">
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Describe symptoms or ask about your results..."
                                rows={1}
                                className="w-full px-4 py-3 bg-white border border-[#E2DFD8]
                                    rounded-[12px] text-sm text-[#1C1917] 
                                    placeholder-[#A8A29E] resize-none shadow-sm
                                    focus:outline-none focus:border-sky-400 
                                    focus:ring-2 focus:ring-sky-100/50 transition-all"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                            />
                            <button className="absolute right-3 bottom-3 text-[#A8A29E] 
                                hover:text-sky-500 transition-colors">
                                <Paperclip className="w-4 h-4" />
                            </button>
                        </div>
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || sending}
                            className="w-11 h-11 rounded-[12px] bg-sky-500 hover:bg-sky-600 
                                disabled:bg-[#E2DFD8] text-white disabled:text-[#C5C2B8]
                                flex items-center justify-center transition-colors 
                                flex-shrink-0 shadow-sm"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-[10px] text-[#A8A29E] text-center mt-3 italic">
                        AI-generated insights only. Always consult a qualified physician.
                    </p>
                </div>
            </div>

            {/* RIGHT: Analysis panel */}
            <div className="flex-1 bg-[#1C2B3A] overflow-y-auto flex flex-col">

                <div className="h-16 flex items-center px-5 
                        border-b border-[#243447] bg-[#1C2B3A]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] 
                        text-[#5B7A99]">
                        Live Analysis Context
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Model Confidence */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] 
                                text-[#5B7A99]">
                                Model Confidence
                            </p>
                            <span className="font-display text-xl text-sky-400/80">
                                {biomarkerConfidence > 0 ? `${biomarkerConfidence}%` : "—"}
                            </span>
                        </div>
                        <div className="h-1 bg-[#243447] rounded-full">
                            <div
                                className="h-full bg-sky-600/70 rounded-full transition-all duration-700"
                                style={{ width: `${biomarkerConfidence}%` }}
                            />
                        </div>
                        <p className="text-xs text-[#8BA5C0] mt-2">
                            {biomarkers.length > 0
                                ? `Based on ${biomarkers.length} biomarker${biomarkers.length !== 1 ? "s" : ""} and ${symptoms.length} symptom${symptoms.length !== 1 ? "s" : ""}`
                                : "Upload lab results to enable analysis"
                            }
                        </p>
                    </div>

                    <div className="border-t border-[#243447]" />

                    {/* Entities Detected */}
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] 
                            text-[#5B7A99] mb-4">
                            Entities Detected
                        </p>
                        {detectedEntities.length > 0 ? (
                            <BadgeGroup badges={detectedEntities} />
                        ) : (
                            <p className="text-xs text-[#5B7A99]">No entities detected yet</p>
                        )}
                    </div>

                    <div className="border-t border-[#243447]" />

                    {/* Biomarker Summary */}
                    {biomarkers.length > 0 && (
                        <>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] 
                                    text-[#5B7A99] mb-4">
                                    Active Biomarker Context
                                </p>
                                <div className="space-y-3">
                                    {biomarkers.slice(0, 5).map((b, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <span className="text-xs text-[#8BA5C0] font-medium truncate mr-2">
                                                {b.name}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-[#5B7A99] font-mono">
                                                    {b.value} {b.unit}
                                                </span>
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    b.status === "optimal" ? "bg-emerald-500" :
                                                        b.status === "warning" ? "bg-amber-500" : "bg-red-500"
                                                )} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-[#243447]" />
                        </>
                    )}

                    {/* Evidence Trail */}
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] 
                            text-[#5B7A99] mb-4">
                            Evidence Trail
                        </p>
                        <div className="space-y-3">
                            {evidenceSteps.map(step => (
                                <div key={step.id} className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-[#243447] border 
                                        border-[#2D4060] flex items-center justify-center 
                                        flex-shrink-0">
                                        <step.Icon className="w-3.5 h-3.5 text-sky-500/70" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-[#8BA5C0]">
                                            {step.label}
                                        </p>
                                        <p className="text-[10px] text-[#5B7A99] mt-0.5">
                                            {step.source} · {step.ms}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-[#243447]" />

                    {/* Cross-page CTAs */}
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="w-full px-4 py-3 bg-[#243447]/60 hover:bg-[#2D4060] 
                                text-[#8BA5C0] hover:text-[#B8CDD9] text-sm rounded-[10px] 
                                border border-[#2D4060] transition-all text-left 
                                flex items-center justify-between group"
                        >
                            <span>See trends on dashboard</span>
                            <ChevronRight className="w-4 h-4 text-[#5B7A99] group-hover:text-[#B8CDD9] transition-colors" />
                        </button>
                        <button
                            onClick={() => router.push("/results")}
                            className="w-full px-4 py-3 bg-[#243447]/60 hover:bg-[#2D4060] 
                                text-[#8BA5C0] hover:text-[#B8CDD9] text-sm rounded-[10px] 
                                border border-[#2D4060] transition-all text-left 
                                flex items-center justify-between group"
                        >
                            <span>View full lab context</span>
                            <ChevronRight className="w-4 h-4 text-[#5B7A99] group-hover:text-[#B8CDD9] transition-colors" />
                        </button>
                        {biomarkers.length === 0 && (
                            <button
                                onClick={() => router.push("/onboarding")}
                                className="w-full px-4 py-3 bg-sky-600/20 hover:bg-sky-600/30 
                                    text-sky-300 hover:text-sky-200 text-sm rounded-[10px] 
                                    border border-sky-500/30 transition-all text-left 
                                    flex items-center justify-between group"
                            >
                                <span className="flex items-center gap-2">
                                    <Upload className="w-4 h-4" />
                                    Upload lab report
                                </span>
                                <ChevronRight className="w-4 h-4 text-sky-500/60 group-hover:text-sky-200 transition-colors" />
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
