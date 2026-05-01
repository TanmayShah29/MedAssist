"use client";

import { useEffect, useState } from "react";
import { logger } from "@/lib/logger";
import { MessageSquare, Info, ClipboardCopy, CheckCircle2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SkeletonText } from "@/components/ui/skeleton";

interface Question {
  question: string;
  context: string;
}

interface DoctorQuestionsProps {
  biomarkers: import("@/types/medical").Biomarker[];
  className?: string;
}

export function DoctorQuestions({ biomarkers, className }: DoctorQuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const flaggedKey = biomarkers
    .filter(b => b.status === "warning" || b.status === "critical")
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))
    .map(b => `${b.id}:${b.status}`)
    .join("|");

  useEffect(() => {
    if (!flaggedKey) return;

    const cacheKey = `medassist_dq_${flaggedKey}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) { setQuestions(parsed); return; }
      }
    } catch { /* cache read failed */ }

    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ biomarkers }),
        });
        const data = await response.json();
        if (data.questions && Array.isArray(data.questions)) {
          setQuestions(data.questions);
          try { sessionStorage.setItem(cacheKey, JSON.stringify(data.questions)); } catch { /* */ }
        }
      } catch (error) {
        logger.error("Failed to fetch doctor questions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flaggedKey]);

  const copyOne = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(index);
    toast.success("Question copied");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const copyAll = () => {
    const allText = questions
      .map((q, i) => `${i + 1}. ${q.question}`)
      .join("\n");
    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    toast.success("All questions copied to clipboard");
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const hasFlags = biomarkers.some(b => b.status === "warning" || b.status === "critical");
  if (!hasFlags) return null;

  return (
    <div className={cn("bg-[#F5F4EF] border border-[#E8E6DF] rounded-[18px] p-5 md:p-6", className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-[#1C1917] leading-tight">Ask Your Doctor</h3>
            <p className="text-[12px] text-[#A8A29E]">Personalized questions for your next visit</p>
          </div>
        </div>

        {/* Copy all button */}
        {questions.length > 0 && !loading && (
          <button
            onClick={copyAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-[12px] font-semibold text-[#57534E] bg-white border border-[#E8E6DF] hover:border-sky-300 hover:text-sky-600 transition-all flex-shrink-0 min-h-[36px]"
            title="Copy all questions"
            style={{ WebkitAppearance: "none" }}
          >
            {copiedAll
              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              : <Copy className="w-3.5 h-3.5" />
            }
            {copiedAll ? "Copied!" : "Copy all"}
          </button>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center gap-2 text-[11px] text-[#A8A29E]">
            <div className="w-3 h-3 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
            <span>Generating…</span>
          </div>
        )}
      </div>

      {/* Question list */}
      <div className="space-y-3">
        {loading && questions.length === 0 ? (
          // Loading skeleton using named shape
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E8E6DF] rounded-[12px] p-4">
              <SkeletonText lines={2} />
            </div>
          ))
        ) : questions.length > 0 ? (
          questions.map((item, idx) => (
            <div
              key={idx}
              className="group bg-white border border-[#E8E6DF] rounded-[12px] p-4 transition-all hover:border-sky-200 hover:shadow-sm"
            >
              <div className="flex gap-3">
                {/* Number */}
                <span className="w-6 h-6 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center text-[11px] font-bold text-sky-600 flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[14px] font-semibold text-[#1C1917] leading-snug">{item.question}</p>
                    <button
                      onClick={() => copyOne(item.question, idx)}
                      className="p-2 rounded-[8px] text-[#C5C2B8] hover:text-sky-500 hover:bg-sky-50 transition-all flex-shrink-0 opacity-0 group-hover:opacity-100 min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Copy"
                      style={{ WebkitAppearance: "none" }}
                    >
                      {copiedIdx === idx
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        : <ClipboardCopy className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>

                  {item.context && (
                    <div className="flex items-start gap-1.5 mt-2">
                      <Info className="w-3.5 h-3.5 text-sky-300 mt-0.5 flex-shrink-0" />
                      <p className="text-[12px] text-[#A8A29E] leading-relaxed">{item.context}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center border-2 border-dashed border-[#E8E6DF] rounded-[12px]">
            <p className="text-[13px] text-[#A8A29E]">Your results look stable — no specific questions generated.</p>
          </div>
        )}
      </div>

      {/* Footer disclaimer */}
      <div className="mt-5 pt-4 border-t border-[#E8E6DF]">
        <p className="text-[11px] text-[#A8A29E] leading-relaxed">
          <strong>Note:</strong> Questions are AI-generated based on your latest biomarkers to help facilitate a more productive conversation with your healthcare provider. They do not constitute medical advice.
        </p>
      </div>
    </div>
  );
}
