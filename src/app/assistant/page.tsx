"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Sparkles, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import { AssistantSidebar } from "@/components/assistant/sidebar";
import { AnalysisPanel } from "@/components/assistant/analysis-panel";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Biomarker } from "@/types/medical";
import DOMPurify from "dompurify";
import { latestUniqueBiomarkers, mergeBiomarkerSources } from "@/lib/medical-data";
import { useStore } from "@/store/useStore";

// Types
type Message = {
    id: string;
    role: "user" | "assistant" | "system_reasoning" | "typing";
    content: string;
    timestamp: Date;
    isError?: boolean;
};

type ContextData = {
    title: string;
    value?: string;
    trend?: string;
    status: "optimal" | "warning" | "critical";
    relatedMarkers?: { name: string; status: string }[];
};



export function AssistantPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const contextParam = searchParams.get("context");
    const demoMode = useStore(s => s.demoMode);
    const getDemoBiomarkers = useStore(s => s.getDemoBiomarkers);
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
    const [showContextModal, setShowContextModal] = useState(false);
    const [doctorQuestions, setDoctorQuestions] = useState<{ question: string, context: string }[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            if (demoMode) {
                const demoBiomarkers = latestUniqueBiomarkers(getDemoBiomarkers() as Biomarker[]);
                setBiomarkers(demoBiomarkers);
                setSymptoms(["Fatigue", "Low Energy"]);
                setDoctorQuestions([
                    {
                        question: "Could my rising glucose indicate prediabetes?",
                        context: "Glucose is above the reference range and trending upward in the sample report.",
                    },
                    {
                        question: "Should we investigate my declining hemoglobin?",
                        context: "Hemoglobin has moved from optimal to monitor range in the sample trend.",
                    },
                ]);
                setMessages([{
                    id: "1",
                    role: "assistant",
                    content: "Hello. You're viewing sample lab data. Vitamin D has recovered well, while Glucose and Hemoglobin are worth discussing with a clinician.",
                    timestamp: new Date()
                }]);
                return;
            }

            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const [bResponse, lrResponse, sResponse, cResponse] = await Promise.all([
                supabase
                    .from('biomarkers')
                    .select('*, lab_results!inner(user_id, uploaded_at, created_at)')
                    .eq('lab_results.user_id', user.id)
                    .order('created_at', { ascending: false }),
                supabase
                    .from('lab_results')
                    .select('id, uploaded_at, created_at, raw_ai_json')
                    .eq('user_id', user.id)
                    .order('uploaded_at', { ascending: false })
                    .limit(10),
                supabase.from('symptoms').select('symptom').eq('user_id', user.id),
                supabase.from('conversations').select('id, role, content, created_at').eq('user_id', user.id).order('created_at', { ascending: true }).limit(50)
            ]);

            let fetchedBiomarkers: Biomarker[] = [];
            let fetchedSymptoms: string[] = [];

            fetchedBiomarkers = mergeBiomarkerSources(
                bResponse.data as Biomarker[] | null,
                lrResponse.data || []
            );
            if (fetchedBiomarkers.length > 0) {
                setBiomarkers(fetchedBiomarkers);
            }

            if (sResponse.data) {
                fetchedSymptoms = sResponse.data.map((s: { symptom: string }) => s.symptom);
                setSymptoms(fetchedSymptoms);
            }

            if (cResponse.data && cResponse.data.length > 0) {
                setMessages(cResponse.data.map((m: { id: string, role: string, content: string, created_at: string }) => ({
                    id: m.id,
                    role: m.role as "user" | "assistant",
                    content: m.content,
                    timestamp: new Date(m.created_at)
                })));
            } else if (fetchedBiomarkers.length > 0) {
                // Feature 8: Proactive Greeting
                try {
                    // Use the existing ask-ai endpoint with a greeting prompt
                    // instead of the non-existent /api/assistant/greeting route
                    const gRes = await fetch('/api/ask-ai', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            question: `Please greet me by name and briefly comment on my most notable lab result. Keep it to 2-3 sentences.`,
                            symptoms: fetchedSymptoms
                        })
                    });
                    const gData = await gRes.json();
                    if (gData.answer) {
                        setMessages([{
                            id: "1",
                            role: "assistant",
                            content: gData.answer,
                            timestamp: new Date()
                        }]);
                    }
                } catch (_e) {
                    // Fallback to simple proactive message
                    const critical = fetchedBiomarkers.find((b: Biomarker) => b.status === "critical")
                        || fetchedBiomarkers.find((b: Biomarker) => b.status === "warning")
                        || fetchedBiomarkers[0];

                    setMessages([{
                        id: "1",
                        role: "assistant",
                        content: `Hello! I'm here to help you understand your health data. I notice your ${critical.name} is ${critical.status === 'optimal' ? 'looking good' : 'currently ' + critical.status}. What would you like to know?`,
                        timestamp: new Date()
                    }]);
                }
            }

            // Feature 8: Proactive Insights (Doctor Questions)
            if (fetchedBiomarkers.length > 0) {
                try {
                    const qRes = await fetch('/api/generate-questions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ biomarkers: fetchedBiomarkers })
                    });
                    const qData = await qRes.json();
                    if (qData.questions) setDoctorQuestions(qData.questions);
                } catch (_e) {
                    logger.warn("Failed to fetch doctor questions", _e);
                }
            }
        };
        fetchData();
    }, [demoMode, getDemoBiomarkers]);

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

    const handleSendMessage = async (overrideMsg?: string) => {
        const messageToSend = overrideMsg || inputValue;
        if (!messageToSend.trim() || isProcessing) return;

        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: messageToSend,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue("");
        setIsProcessing(true);

        try {
            const response = await fetch(demoMode ? '/api/demo-ask-ai' : '/api/ask-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: messageToSend,
                    symptoms: symptoms
                    // biomarkers intentionally omitted — the server fetches them
                    // directly from the DB to ensure data integrity
                })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            const aiContent = data.answer || "I'm sorry, I couldn't process that.";

            const showNudge = false; // Removed engagement nudge — it felt patronising and broke the AI's tone
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
            let errorText = "I'm having trouble connecting to the server. Please try again later.";
            if (error instanceof Error && error.message) {
                errorText = error.message;
            } else if (typeof error === 'string') {
                errorText = error;
            }

            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: errorText,
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsProcessing(false);
        }
    };

    const renderChatPanel = () => (
        <>
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
            <div className="grow shrink basis-0 overflow-y-auto p-5 space-y-6">
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
                        ) : msg.role === "typing" ? (
                            <div className="bg-[#FAFAF7] border border-[#E8E6DF] text-sm text-[#57534E] px-5 py-3.5 rounded-[14px] rounded-tl-sm max-w-[85%] shadow-sm">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-[#A8A29E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-[#A8A29E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-[#A8A29E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span className="text-xs text-[#A8A29E]">Thinking...</span>
                                </div>
                            </div>
                        ) : msg.isError ? (
                            <div className="bg-red-50 border border-red-200 text-sm text-red-700 px-5 py-3.5 rounded-[14px] rounded-tl-sm max-w-[85%] shadow-sm">
                                <p>{msg.content}</p>
                                <button
                                    onClick={() => {
                                        const errorIndex = messages.findIndex(m => m.id === msg.id);
                                        const originalMsg = errorIndex > 0
                                            ? messages.slice(0, errorIndex).reverse().find(m => m.role === 'user')
                                            : undefined;
                                        if (originalMsg) {
                                            setMessages(prev => prev.filter(m => m.id !== msg.id));
                                            handleSendMessage(originalMsg.content);
                                        }
                                    }}
                                    className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                                >
                                    ↻ Retry
                                </button>
                            </div>
                        ) : (
                            <div className="bg-[#FAFAF7] border border-[#E8E6DF] text-sm text-[#57534E] px-5 py-3.5 rounded-[14px] rounded-tl-sm max-w-[85%] shadow-sm" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.content) }} />
                        )}
                    </div>
                ))}
                {isProcessing && messages[messages.length - 1]?.role !== 'typing' && (
                    <div className="flex w-full justify-start">
                        <div className="bg-[#FAFAF7] border border-[#E8E6DF] text-sm text-[#57534E] px-5 py-3.5 rounded-[14px] rounded-tl-sm max-w-[85%] shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-[#A8A29E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-[#A8A29E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-[#A8A29E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-xs text-[#A8A29E]">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-[#E8E6DF] p-4 bg-[#FAFAF7] sticky bottom-0 z-10"
                 style={{ paddingBottom: 'max(1rem, calc(1rem + env(safe-area-inset-bottom, 0px)))' }}>
                {/* Suggested Questions */}
                {messages.filter(m => m.role === 'user').length === 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none mb-1">
                        {(() => {
                            const criticalMarkers = biomarkers.filter(b => b.status === 'critical').map(b => b.name);
                            const warningMarkers = biomarkers.filter(b => b.status === 'warning').map(b => b.name);
                            const dynamicQuestions = [];
                            
                            if (criticalMarkers.length > 0) {
                                dynamicQuestions.push(`Explain my flagged ${criticalMarkers[0]}`);
                                dynamicQuestions.push(`How do I fix my ${criticalMarkers[0]}?`);
                            }
                            if (warningMarkers.length > 0) {
                                dynamicQuestions.push(`What should I eat to improve ${warningMarkers[0]}?`);
                            }
                            if (dynamicQuestions.length === 0) {
                                dynamicQuestions.push(
                                    "What do my latest results mean?",
                                    "Are there any hidden risks?",
                                    "How can I improve my health score?",
                                    "What should I ask my doctor?"
                                );
                            } else {
                                dynamicQuestions.push("What do my latest results mean?");
                            }

                            return dynamicQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        handleSendMessage(q);
                                    }}
                                    className="whitespace-nowrap px-4 py-2.5 min-h-[44px] bg-white border border-[#E8E6DF] rounded-full text-[13px] text-[#57534E] hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 transition-colors shadow-sm disabled:opacity-60"
                                    disabled={isProcessing}
                                >
                                    {q}
                                </button>
                            ));
                        })()}
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onKeyDown={(e: any) => e.key === "Enter" && !isProcessing && handleSendMessage()}
                        disabled={isProcessing}
                        className="grow shrink basis-0 px-4 py-3 bg-[#F5F4EF] border border-[#E8E6DF] rounded-[12px] text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder={isProcessing ? "AI is thinking..." : "Ask about your results..."}
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={!inputValue.trim() || isProcessing}
                        aria-label="Send message"
                        style={{
                            background: isProcessing || !inputValue.trim() ? '#94A3B8' : '#0EA5E9',
                            cursor: isProcessing || !inputValue.trim() ? 'not-allowed' : 'pointer',
                            opacity: isProcessing || !inputValue.trim() ? 0.7 : 1,
                            transition: 'all 0.15s ease'
                        }}
                        className="px-4 py-3 text-white rounded-[12px] shadow-md shadow-sky-500/20 flex items-center justify-center min-w-[50px] min-h-[44px]"
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
        </>
    );

    return (
        <ErrorBoundary>
            <div className="min-h-[100dvh] bg-[#FAFAF7] font-sans selection:bg-sky-100 flex flex-col">
                <div className="px-3 pt-3 pb-4 md:px-6 md:pt-8 md:pb-8 max-w-5xl mx-auto flex-1 flex flex-col w-full">

                    {/* HEADER - Hidden on mobile because MobileNavbar handles it */}
                    <header className="hidden lg:flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="font-display text-3xl text-[#1C1917]">
                                AI Health Assistant
                            </h1>
                            <p className="text-sm text-[#A8A29E] mt-1 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-sky-500" />
                                Context: {contextData?.title || "General"} · {contextData?.status === "critical" ? "Critical" : "General context"}
                            </p>
                        </div>

                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2.5 bg-[#F5F4EF] hover:bg-[#EFEDE6] text-[#57534E] text-sm font-medium rounded-[10px] border border-[#E8E6DF] transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                    </header>

                    {/* CONTEXT SUMMARY CARD */}
                    {contextData && (
                        <div className="bg-[#E0F2FE] rounded-[18px] border border-[#BAE6FD] p-5 mb-6 hidden lg:block">
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
                    <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 lg:gap-5 items-stretch flex-1 min-h-0">

                        {/* FULL WIDTH CHAT ON MOBILE */}
                        <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] flex flex-col overflow-hidden shadow-sm flex-1">
                            {renderChatPanel()}
                        </div>

                        {/* RIGHT: CONTEXTUAL INTELLIGENCE PANEL - Modal on mobile */}
                        <div className="hidden lg:block space-y-5 overflow-y-auto">
                            <AssistantSidebar biomarkers={biomarkers} />
                            <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] overflow-hidden h-[300px]">
                                <AnalysisPanel
                                    biomarkers={biomarkers}
                                    symptoms={symptoms}
                                    doctorQuestions={doctorQuestions}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mobile Context Toggle Button */}
                    <button
                        onClick={() => setShowContextModal(true)}
                        className="lg:hidden fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 z-40 w-12 h-12 bg-sky-500 rounded-full shadow-lg shadow-sky-500/30 flex items-center justify-center text-white"
                    >
                        <Activity className="w-5 h-5" />
                    </button>

                    {/* Mobile Context Modal */}
                    {showContextModal && (
                        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end">
                            <div className="bg-[#FAFAF7] w-full rounded-t-[24px] max-h-[80vh] overflow-y-auto pb-[calc(3rem+env(safe-area-inset-bottom))]">
                                <div className="sticky top-0 bg-[#FAFAF7] p-4 border-b border-[#E8E6DF] flex justify-between items-center">
                                    <h2 className="font-display text-xl text-[#1C1917]">Health Data</h2>
                                    <button
                                        onClick={() => setShowContextModal(false)}
                                        className="w-8 h-8 rounded-full bg-[#F5F4EF] flex items-center justify-center text-[#57534E]"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="p-4 space-y-4">
                                    <AssistantSidebar biomarkers={biomarkers} />
                                    <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] overflow-hidden">
                                        <AnalysisPanel
                                            biomarkers={biomarkers}
                                            symptoms={symptoms}
                                            doctorQuestions={doctorQuestions}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </ErrorBoundary>
    );
}

export default function AssistantPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[100dvh] bg-[#FAFAF7] flex items-center justify-center">
                <div className="animate-pulse rounded-xl bg-[#E8E6DF] h-8 w-48" />
            </div>
        }>
            <AssistantPageInner />
        </Suspense>
    );
}
