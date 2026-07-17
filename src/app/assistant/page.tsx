"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Sparkles, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BouncingDots } from "@/components/ui/bouncing-dots";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import { AssistantSidebar } from "@/components/assistant/sidebar";
import { AnalysisPanel } from "@/components/assistant/analysis-panel";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Biomarker } from "@/types/medical";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { latestUniqueBiomarkers, mergeBiomarkerSources } from "@/lib/medical-data";
import { useStore } from "@/store/useStore";
import { getPatientStatus } from "@/lib/patient-status";
import { MedicalDisclaimer } from "@/components/medical-disclaimer";
import { TrustLayer } from "@/components/trust-layer";
import { logAccessAction } from "@/app/actions/user-data";

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
    status: "optimal" | "warning" | "critical" | "unranged";
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
            content: "Hi there — I'm your visit prep assistant. Ask me anything about your lab results, or tap a suggestion below to get started.",
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
        logAccessAction({ resource: 'assistant_page', action: 'VIEW_ASSISTANT' });
        const fetchData = async () => {
            if (demoMode) {
                const demoBiomarkers = latestUniqueBiomarkers(await getDemoBiomarkers());
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
                        content: `Hi! I can see your ${critical.name} is flagged as ${getPatientStatus(critical.status).label.toLowerCase()}. Want me to help you prepare clear questions for your doctor about it?`,
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
            const assistantId = (Date.now() + 1).toString();
            const response = await fetch(demoMode ? '/api/demo-ask-ai' : '/api/ask-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/plain',
                },
                body: JSON.stringify({
                    question: messageToSend,
                    symptoms: symptoms
                    // biomarkers intentionally omitted — the server fetches them
                    // directly from the DB to ensure data integrity
                })
            });

            if (!response.ok) {
                let errorText = 'Failed to get answer. Please try again.';
                try {
                    const data = await response.json();
                    errorText = data.error || errorText;
                } catch {
                    errorText = await response.text();
                }
                throw new Error(errorText);
            }

            if (!response.body) throw new Error("Streaming is not available in this browser.");

            setMessages(prev => [...prev, {
                id: assistantId,
                role: "assistant",
                content: "",
                timestamp: new Date()
            }]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                fullText += chunk;
                setMessages(prev => prev.map(msg =>
                    msg.id === assistantId ? { ...msg, content: fullText } : msg
                ));
            }

            const finalChunk = decoder.decode();
            if (finalChunk) {
                fullText += finalChunk;
                setMessages(prev => prev.map(msg =>
                    msg.id === assistantId ? { ...msg, content: fullText } : msg
                ));
            }

            if (!fullText.trim()) {
                setMessages(prev => prev.map(msg =>
                    msg.id === assistantId
                        ? { ...msg, content: "I'm sorry, I couldn't process that.", isError: true }
                        : msg
                ));
            }
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
            setMessages(prev => prev.filter(msg => msg.content.trim() || msg.role !== "assistant").concat(errorMsg));
        } finally {
            setIsProcessing(false);
        }
    };

    const renderChatPanel = () => (
        <>
            {/* Welcome Banner (No Results) */}
            {biomarkers.length === 0 && (
                <div className="border-b border-[#EBEAE4] bg-white px-5 py-6">
                    <p className="mb-2 text-[15px] font-semibold text-[#0F172A]">
                        Welcome to your AI health assistant
                    </p>
                    <p className="m-0 text-sm leading-relaxed text-[#475569]">
                        I can answer general health questions right now, but I&apos;ll give you much more personalized insights once you upload your first lab report. Head to the dashboard to upload one.
                    </p>
                </div>
            )}

            <MedicalDisclaimer variant="compact" className="mx-5 mb-2" />

            {/* Messages Area */}
            <div
                role="log"
                aria-live="polite"
                aria-label="Chat messages from AI assistant"
                className="grow shrink basis-0 overflow-y-auto p-5 space-y-6 min-w-0"
            >
                {messages.map((msg, idx) => (
                    <motion.div
                        key={msg.id}
                        role="article"
                        aria-label={`${msg.role} message`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: idx === messages.length - 1 && idx > 0 ? 0.05 : 0 }}
                        className={cn(
                        "flex w-full",
                        msg.role === "user" ? "justify-end" : "justify-start"
                    )}>
                        {/* MESSAGE BUBBLES */}
                        {msg.role === "user" ? (
                            <div className="bg-sky-500 text-white text-sm px-5 py-3.5 rounded-[14px] rounded-tr-sm max-w-[80%] shadow-md shadow-sky-500/10 break-words min-w-0">
                                {msg.content}
                            </div>
                        ) : msg.role === "system_reasoning" ? (
                            <div className="bg-[#0F172A] rounded-[12px] p-4 max-w-[90%] border border-slate-800 shadow-xl min-w-0">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400 mb-2 flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" />
                                    Clinical Pattern Analysis
                                </p>
                                <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap break-words font-mono">
                                    {msg.content}
                                </p>
                            </div>
                        ) : msg.role === "typing" ? (
                            <div className="bg-[#FDFDFB] border border-[#EBEAE4] text-sm text-[#475569] px-5 py-3.5 rounded-[14px] rounded-tl-sm max-w-[85%] shadow-sm">
                                <BouncingDots message="Thinking…" messagePlacement="right" />
                            </div>
                        ) : msg.isError ? (
                            <div role="alert" className="bg-red-50 border border-red-200 text-sm text-red-700 px-5 py-3.5 rounded-[14px] rounded-tl-sm max-w-[85%] shadow-sm break-words min-w-0">
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
                                    className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors duration-200 flex items-center gap-1"
                                >
                                    ↻ Retry
                                </button>
                            </div>
                        ) : (
                            <div className="bg-[#FDFDFB] border border-[#EBEAE4] text-sm text-[#475569] px-5 py-3.5 rounded-[14px] rounded-tl-sm max-w-[85%] shadow-sm break-words min-w-0 [&_*]:break-words">
                                                <ReactMarkdown
                                                    rehypePlugins={[rehypeSanitize]}
                                                    components={{
                                                        a: ({ href, children }) => (
                                                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-amber-700 underline">
                                                                {children}
                                                            </a>
                                                        ),
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                        )}
                    </motion.div>
                ))}
                {isProcessing && messages[messages.length - 1]?.role !== 'typing' && (
                    <div className="flex w-full justify-start">
                        <div className="bg-[#FDFDFB] border border-[#EBEAE4] text-sm text-[#475569] px-5 py-3.5 rounded-[14px] rounded-tl-sm max-w-[85%] shadow-sm">
                            <BouncingDots message="Thinking…" messagePlacement="right" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-[#EBEAE4] p-4 bg-[#FDFDFB] sticky bottom-0 z-10"
                 style={{ paddingBottom: 'max(1rem, calc(1rem + env(safe-area-inset-bottom, 0px)))' }}>
                {/* Suggested Questions */}
                {messages.filter(m => m.role === 'user').length === 0 && (
                    <div className="flex flex-wrap gap-2 pb-3 mb-1 max-h-28 overflow-y-auto lg:max-h-none lg:overflow-visible">
                        {(() => {
                            const soonMarkers = biomarkers.filter(b => b.status === 'critical').map(b => b.name);
                            const discussMarkers = biomarkers.filter(b => b.status === 'warning').map(b => b.name);
                            const dynamicQuestions = [];
                            
                            if (soonMarkers.length > 0) {
                                dynamicQuestions.push(`Why is ${soonMarkers[0]} marked discuss soon?`);
                                dynamicQuestions.push(`What should I ask my doctor about ${soonMarkers[0]}?`);
                            }
                            if (discussMarkers.length > 0) {
                                dynamicQuestions.push(`What context should I discuss for ${discussMarkers[0]}?`);
                            }
                            if (dynamicQuestions.length === 0) {
                                dynamicQuestions.push(
                                    "What do my latest results mean?",
                                    "What should I monitor over time?",
                                    "What changed since my last report?",
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
                                    className="px-3.5 py-2.5 min-h-[44px] max-w-full bg-white border border-[#EBEAE4] rounded-full text-[13px] text-[#475569] hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 hover:-translate-y-0.5 hover:shadow-sm active:scale-95 transition-all duration-200 disabled:opacity-60 text-left text-wrap-safe shrink-0 stagger-fade-sm"
                                    style={{ animationDelay: `${i * 50}ms` }}
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
                        className="input-base grow shrink basis-0"
                        placeholder={isProcessing ? "AI is thinking..." : "Ask about your results..."}
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={!inputValue.trim() || isProcessing}
                        aria-label="Send message"
                        className={cn(
                            "px-4 py-3 text-white rounded-[12px] shadow-md flex items-center justify-center min-w-[50px] min-h-[44px] transition-all duration-200 active:scale-95",
                            isProcessing || !inputValue.trim() 
                                ? "bg-slate-400 cursor-not-allowed opacity-70 shadow-none" 
                                : "bg-sky-500 hover:bg-sky-600 hover:shadow-lg shadow-sky-500/20"
                        )}
                    >
                        {isProcessing ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send className="w-4 h-4 transition-transform duration-200" />
                        )}
                    </button>
                </div>
                <p className="text-[11px] text-[#64748B] text-center mt-3">
                    Educational only. AI can make mistakes; discuss results with a qualified clinician.
                </p>
            </div>
        </>
    );

    return (
        <ErrorBoundary>
            <div className="app-page selection:bg-sky-100 flex flex-col">
                <div className="app-container flex-1 flex flex-col w-full">

                    {/* HEADER - Hidden on mobile because MobileNavbar handles it */}
                    <header className="app-header hidden lg:flex">
                        <div>
                            <h1 className="app-title text-wrap-safe">
                                Prep Assistant
                            </h1>
                            <p className="app-subtitle flex items-center gap-2 text-wrap-safe">
                                <Sparkles className="w-4 h-4 text-sky-500" />
                                Context: {contextData?.title || "Latest labs"} · remembers recent chat history
                            </p>
                        </div>

                        <button
                            onClick={() => router.back()}
                            className="btn btn-secondary btn-sm shrink-0 transition-transform duration-150 active:scale-95"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                    </header>

                    {/* CONTEXT SUMMARY CARD */}
                    {contextData && (
                        <div className="bg-[#F0F9FF] rounded-[18px] border border-[#BAE6FD] p-5 mb-6 hidden lg:block transition-all duration-300 hover:border-sky-300 hover:shadow-sm stagger-fade">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-600 mb-2 flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                Current Context
                            </p>

                            <div className="flex items-start justify-between gap-4 min-w-0">
                                <div className="min-w-0">
                                    <p className="font-display text-xl text-sky-800 break-words">
                                        {contextData.title} {contextData.value && `— ${contextData.value}`}
                                    </p>
                                    <p className="text-sm text-sky-700 mt-1 break-words">
                                        {contextData.trend} {contextData.status === "critical" && "· Outside report range"}
                                    </p>
                                </div>

                                {contextData.status === "critical" && (
                                    <span className="px-3 py-1 bg-red-100/80 text-red-700 text-xs font-bold rounded-full border border-red-200 shrink-0">
                                        {getPatientStatus(contextData.status).label}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* MAIN GRID Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,0.85fr)] xl:grid-cols-[minmax(0,1.7fr)_minmax(0,0.9fr)] gap-5 lg:gap-6 items-stretch flex-1 min-h-0">

                        {/* FULL WIDTH CHAT ON MOBILE */}
                        <div className="app-panel flex flex-col overflow-hidden flex-1 min-w-0">
                            {renderChatPanel()}
                        </div>

                        {/* RIGHT: CONTEXTUAL INTELLIGENCE PANEL - Modal on mobile */}
                        <div className="hidden min-w-0 lg:block space-y-5 overflow-y-auto">
                            <AssistantSidebar biomarkers={biomarkers} />
                            <div className="app-panel overflow-hidden h-[300px]">
                                <AnalysisPanel
                                    biomarkers={biomarkers}
                                    symptoms={symptoms}
                                    doctorQuestions={doctorQuestions}
                                />
                            </div>
                            <TrustLayer variant="compact" />
                        </div>
                    </div>

                    {/* Mobile Context Toggle Button */}
                    <button
                        onClick={() => setShowContextModal(true)}
                        className="lg:hidden fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 z-40 w-12 h-12 bg-sky-500 rounded-full shadow-lg shadow-sky-500/30 flex items-center justify-center text-white hover:shadow-xl active:scale-90 transition-all duration-200"
                    >
                        <Activity className="w-5 h-5" />
                    </button>

                    {/* Mobile Context Modal */}
                    {showContextModal && (
                        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end">
                            <div className="bg-[#FDFDFB] w-full rounded-t-[24px] max-h-[80vh] overflow-y-auto pb-[calc(3rem+env(safe-area-inset-bottom))] stagger-fade">
                                <div className="sticky top-0 bg-[#FDFDFB] p-4 border-b border-[#EBEAE4] flex justify-between items-center">
                                    <h2 className="font-display text-xl text-[#0F172A]">Health Data</h2>
                                    <button
                                        onClick={() => setShowContextModal(false)}
                                        className="w-8 h-8 rounded-full bg-[#FFFFFF] hover:bg-[#FAFAFA] active:scale-90 flex items-center justify-center text-[#475569] transition-all duration-200"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="p-4 space-y-4">
                                    <AssistantSidebar biomarkers={biomarkers} />
                                    <div className="bg-[#FFFFFF] rounded-[14px] border border-[#EBEAE4] overflow-hidden">
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
            <div className="min-h-[100dvh] bg-[#FDFDFB] flex items-center justify-center">
                <div className="animate-pulse rounded-xl bg-[#EBEAE4] h-8 w-48" />
            </div>
        }>
            <AssistantPageInner />
        </Suspense>
    );
}
