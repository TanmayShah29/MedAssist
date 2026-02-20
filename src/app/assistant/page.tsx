"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Sparkles, ChevronRight, Activity, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// Types
type Message = {
    id: string;
    role: "user" | "assistant" | "system_reasoning";
    content: string;
    timestamp: Date;
};

type ContextData = {
    title: string;
    value?: string;
    trend?: string;
    status: "optimal" | "warning" | "critical";
    relatedMarkers?: { name: string; status: string }[];
};

type Biomarker = {
    name: string;
    value: number;
    unit: string;
    status: "optimal" | "warning" | "critical";
    category: string;
};

export default function AssistantPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const contextParam = searchParams.get("context");
    const [contextData, setContextData] = useState<ContextData | null>(null);
    const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Hello. I'm ready to help answer your health questions.",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const [bResponse, sResponse, cResponse] = await Promise.all([
                supabase.from('biomarkers').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
                supabase.from('symptoms').select('symptom').eq('user_id', user.id),
                supabase.from('conversations').select('id, role, content, created_at').eq('user_id', user.id).order('created_at', { ascending: true }).limit(50)
            ]);

            if (bResponse.data && bResponse.data.length > 0) {
                setBiomarkers(bResponse.data);
            }

            if (cResponse.data && cResponse.data.length > 0) {
                setMessages(cResponse.data.map((m: any) => ({
                    id: m.id,
                    role: m.role as "user" | "assistant",
                    content: m.content,
                    timestamp: new Date(m.created_at)
                })));
            } else if (bResponse.data && bResponse.data.length > 0) {
                // Find most critical biomarker
                const critical = bResponse.data.find((b: any) => b.status === "critical")
                    || bResponse.data.find((b: any) => b.status === "warning")
                    || bResponse.data[0];

                setMessages([
                    {
                        id: "1",
                        role: "assistant",
                        content: `Hello! I'm here to help you understand your health data. I notice your ${critical.name} is ${critical.status === 'optimal' ? 'looking good' : 'currently ' + critical.status}. What would you like to know about your results?`,
                        timestamp: new Date()
                    }
                ]);
            }
            if (sResponse.data) setSymptoms(sResponse.data.map((s: { symptom: string }) => s.symptom));
        };
        fetchData();
    }, []);

    // Set Context from Real Data
    useEffect(() => {
        if (contextParam && biomarkers.length > 0) {
            const found = biomarkers.find(b => b.name.toLowerCase() === contextParam.toLowerCase());
            if (found) {
                setContextData({
                    title: found.name,
                    value: `${found.value} ${found.unit}`,
                    status: found.status,
                    relatedMarkers: [] // Could imply related from category if needed
                });
            }
        }
    }, [contextParam, biomarkers]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isProcessing) return;

        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue("");
        setIsProcessing(true);

        try {
            const response = await fetch('/api/ask-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: inputValue,
                    biomarkers: biomarkers,
                    symptoms: symptoms
                })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            const aiContent = data.answer || "I'm sorry, I couldn't process that.";

            // Add engagement nudge if strictly needed
            const showNudge = biomarkers.length > 0 && biomarkers.length < 20;
            const finalContent = showNudge
                ? `${aiContent}\n\nThe more reports you upload, the more personalized my analysis becomes.`
                : aiContent;

            const newAiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: finalContent,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, newAiMsg]);
        } catch (error) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "I'm having trouble connecting to the server. Please try again later.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSuggestedQuestion = (question: string) => {
        setInputValue(question);
        // Optional: auto-send
    };

    return (
        <div className="min-h-screen bg-[#FAFAF7] font-sans selection:bg-sky-100">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 pt-20 lg:pt-8 pb-8">

                {/* HEADER */}
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="font-display text-3xl text-[#1C1917]">
                            AI Health Assistant
                        </h1>
                        <p className="text-sm text-[#A8A29E] mt-1 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-sky-500" />
                            Context: {contextData?.title || "General"} · {contextData?.status === "critical" ? "Critical" : "Updated"} · Updated 2 min ago
                        </p>
                    </div>

                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2.5 bg-[#F5F4EF] hover:bg-[#EFEDE6] text-[#57534E] text-sm font-medium rounded-[10px] border border-[#E8E6DF] transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Results
                    </button>
                </header>

                {/* CONTEXT SUMMARY CARD */}
                {contextData && (
                    <div className="bg-[#E0F2FE] rounded-[18px] border border-[#BAE6FD] p-5 mb-6">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-600 mb-2 flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            Current Context
                        </p>

                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="font-display text-xl text-sky-800">
                                    {contextData.title} {contextData.value && `— ${contextData.value}`}
                                </p>
                                <p className="text-sm text-sky-700 mt-1">
                                    {contextData.trend} {contextData.status === "critical" && "· Below optimal range"}
                                </p>
                            </div>

                            {contextData.status === "critical" && (
                                <span className="px-3 py-1 bg-red-100/80 text-red-700 text-xs font-bold rounded-full border border-red-200">
                                    Action Required
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* MAIN GRID Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5 items-stretch h-[calc(100vh-300px)] min-h-[600px]">

                    {/* LEFT: CONVERSATION PANEL */}
                    <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] flex flex-col overflow-hidden shadow-sm relative">

                        {/* Welcome Banner (No Results) */}
                        {biomarkers.length === 0 && (
                            <div style={{
                                background: '#F5F4EF',
                                borderBottom: '1px solid #E8E6DF',
                                padding: 24,
                            }}>
                                <p style={{ fontSize: 15, color: '#1C1917', fontWeight: 600, margin: '0 0 8px 0' }}>
                                    Welcome to your AI health assistant
                                </p>
                                <p style={{ fontSize: 14, color: '#57534E', margin: 0, lineHeight: 1.6 }}>
                                    I can answer general health questions right now, but I&apos;ll give you much more personalized insights once you upload your first lab report. Head to the dashboard to upload one.
                                </p>
                            </div>
                        )}

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {messages.map((msg) => (
                                <div key={msg.id} className={cn(
                                    "flex w-full",
                                    msg.role === "user" ? "justify-end" : "justify-start"
                                )}>
                                    {/* MESSAGE BUBBLES */}
                                    {msg.role === "user" ? (
                                        <div className="bg-sky-500 text-white text-sm px-5 py-3.5 rounded-[14px] rounded-tr-sm max-w-[80%] shadow-md shadow-sky-500/10">
                                            {msg.content}
                                        </div>
                                    ) : msg.role === "system_reasoning" ? (
                                        <div className="bg-[#0F172A] rounded-[12px] p-4 max-w-[90%] border border-slate-800 shadow-xl">
                                            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400 mb-2 flex items-center gap-1.5">
                                                <Sparkles className="w-3 h-3" />
                                                Clinical Pattern Analysis
                                            </p>
                                            <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                                                {msg.content}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="bg-[#FAFAF7] border border-[#E8E6DF] text-sm text-[#57534E] px-5 py-3.5 rounded-[14px] rounded-tl-sm max-w-[85%] shadow-sm">
                                            {msg.content}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="border-t border-[#E8E6DF] p-4 bg-[#FAFAF7] sticky bottom-0 z-10">
                            <div className="flex items-center gap-3">
                                <input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    onKeyDown={(e: any) => e.key === "Enter" && !isProcessing && handleSendMessage()}
                                    disabled={isProcessing}
                                    className="flex-1 px-4 py-3 bg-[#F5F4EF] border border-[#E8E6DF] rounded-[12px] text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder={isProcessing ? "AI is thinking..." : "Ask about your results..."}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isProcessing}
                                    style={{
                                        background: isProcessing || !inputValue.trim() ? '#94A3B8' : '#0EA5E9',
                                        cursor: isProcessing || !inputValue.trim() ? 'not-allowed' : 'pointer',
                                        opacity: isProcessing || !inputValue.trim() ? 0.7 : 1,
                                        transition: 'all 0.15s ease'
                                    }}
                                    className="px-4 py-3 text-white rounded-[12px] shadow-md shadow-sky-500/20 flex items-center justify-center min-w-[50px]"
                                >
                                    {isProcessing ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            <p className="text-[11px] text-[#A8A29E] text-center mt-3">
                                AI-generated insights for educational purposes only. Always consult your physician.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT: CONTEXTUAL INTELLIGENCE PANEL */}
                    <div className="flex flex-col gap-5 overflow-y-auto">

                        {/* 1. Related Biomarkers */}
                        {contextData?.relatedMarkers && contextData.relatedMarkers.length > 0 && (
                            <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] p-5 shadow-sm">
                                <p className="text-sm font-semibold text-[#1C1917] mb-4 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-[#A8A29E]" />
                                    Related Markers
                                </p>
                                <div className="space-y-3">
                                    {contextData.relatedMarkers.map((marker, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm p-2 bg-[#FAFAF7] rounded-lg border border-[#E8E6DF]/50">
                                            <span className="text-[#57534E] font-medium">{marker.name}</span>
                                            <span className={cn(
                                                "font-semibold text-xs px-2 py-0.5 rounded-full",
                                                marker.status === "Low" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                                            )}>{marker.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2. Suggested Questions */}
                        <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] p-5 shadow-sm">
                            <p className="text-sm font-semibold text-[#1C1917] mb-3 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-[#A8A29E]" />
                                Suggested Questions
                            </p>
                            <div className="space-y-2">
                                {["What causes iron deficiency?", "Should I take supplements?", "How can I improve this through diet?"].map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSuggestedQuestion(q)}
                                        className="w-full text-left px-3 py-2.5 bg-[#FAFAF7] hover:bg-[#EFEDE6] hover:border-[#D6D3C9] border border-transparent rounded-[10px] text-sm text-[#57534E] transition-all flex justify-between items-center group"
                                    >
                                        {q}
                                        <ChevronRight className="w-3.5 h-3.5 text-[#D6D3C9] group-hover:text-[#A8A29E]" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Recommended Actions */}
                        <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] p-5 shadow-sm">
                            <p className="text-sm font-semibold text-[#1C1917] mb-4 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#A8A29E]" />
                                Recommended Actions
                            </p>
                            <div className="space-y-3">
                                <button className="w-full px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-[10px] transition-colors shadow-md shadow-sky-500/10 flex items-center justify-center gap-2">
                                    View full dashboard
                                    <ArrowLeft className="w-3 h-3 rotate-180" />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
