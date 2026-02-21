"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Info, ChevronRight, ClipboardCopy, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Question {
    question: string;
    context: string;
}

interface DoctorQuestionsProps {
    biomarkers: any[];
    className?: string;
}

export function DoctorQuestions({ biomarkers, className }: DoctorQuestionsProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

    useEffect(() => {
        if (biomarkers.length > 0) {
            const fetchQuestions = async () => {
                setLoading(true);
                try {
                    const response = await fetch('/api/generate-questions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ biomarkers })
                    });
                    const data = await response.json();
                    if (data.questions && Array.isArray(data.questions)) {
                        setQuestions(data.questions);
                    }
                } catch (error) {
                    console.error("Failed to fetch doctor questions", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchQuestions();
        }
    }, [biomarkers]);

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIdx(index);
        toast.success("Question copied to clipboard");
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    if (biomarkers.length === 0) return null;

    return (
        <div className={cn("bg-white border border-[#E8E6DF] rounded-[18px] p-6 shadow-sm", className)}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-[18px] font-bold text-[#1C1917]">Ask Your Doctor</h3>
                        <p className="text-[12px] text-[#A8A29E]">Personalized questions for your next visit</p>
                    </div>
                </div>
                {loading && (
                    <div className="flex items-center gap-2 text-[11px] text-[#A8A29E]">
                        <div className="w-3 h-3 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                        Generating...
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {loading && questions.length === 0 ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-xl border border-slate-100" />
                    ))
                ) : questions.length > 0 ? (
                    questions.map((item, idx) => (
                        <div 
                            key={idx} 
                            className="group bg-[#FAFAF7] border border-[#E8E6DF] rounded-xl p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/30"
                        >
                            <div className="flex justify-between items-start gap-4 mb-2">
                                <p className="text-[15px] font-bold text-[#1C1917] leading-tight">
                                    {item.question}
                                </p>
                                <button 
                                    onClick={() => copyToClipboard(item.question, idx)}
                                    className="p-1.5 rounded-md hover:bg-white transition-colors text-[#A8A29E] hover:text-indigo-600"
                                    title="Copy to clipboard"
                                >
                                    {copiedIdx === idx ? <CheckCircle2 size={14} /> : <ClipboardCopy size={14} />}
                                </button>
                            </div>
                            <div className="flex items-start gap-2 text-[13px] text-[#57534E] leading-relaxed">
                                <Info size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                                <p className="italic opacity-80">{item.context}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-[#E8E6DF]">
                        <p className="text-sm text-[#A8A29E]">No specific questions generated. Your results look stable.</p>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-[#E8E6DF]">
                <p className="text-[11px] text-[#A8A29E] leading-relaxed">
                    <strong>Note:</strong> These questions are generated by AI based on your latest lab results. They are intended to help facilitate a more productive conversation with your healthcare provider.
                </p>
            </div>
        </div>
    );
}
