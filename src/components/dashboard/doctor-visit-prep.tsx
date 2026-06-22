"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Copy, Printer, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Biomarker } from "@/types/medical";
import { cn } from "@/lib/utils";
import { getPatientStatus, needsClinicianDiscussion, sortByPatientPriority } from "@/lib/patient-status";

type PrepResponse = {
    summary: string;
    checklist: string[];
    questions: string[];
    flagged: Biomarker[];
    changes: Array<{
        name: string;
        current: string;
        previous: string;
        percent: number;
        direction: "up" | "down";
    }>;
    generatedAt: string;
    reportCount: number;
    latestSummary?: string;
};

function fallbackPrep(biomarkers: Biomarker[]): PrepResponse {
    const flagged = sortByPatientPriority(biomarkers.filter(needsClinicianDiscussion))
        .slice(0, 5);

    return {
        summary: flagged.length > 0
            ? `Your visit brief should focus on ${flagged.map(b => b.name).slice(0, 3).join(", ")} and what your clinician wants to monitor or recheck.`
            : "Your latest markers look mostly stable. Use the visit to confirm what should be monitored next.",
        checklist: [
            "Bring your latest lab report and any older reports for comparison.",
            "List current medications, supplements, doses, and start dates.",
            "Write down symptoms, energy changes, sleep changes, and diet changes from the last 30 days.",
        ],
        questions: flagged.slice(0, 3).map(b => `My ${b.name} is ${b.value} ${b.unit || ""}. What context could explain it, and should we re-test it?`),
        flagged,
        changes: [],
        generatedAt: new Date().toISOString(),
        reportCount: 0,
    };
}

export function DoctorVisitPrep({
    biomarkers,
    demoMode,
    className,
}: {
    biomarkers: Biomarker[];
    demoMode: boolean;
    className?: string;
}) {
    const fallback = useMemo(() => fallbackPrep(biomarkers), [biomarkers]);
    const [prep, setPrep] = useState<PrepResponse>(fallback);
    const [loading, setLoading] = useState(false);

    const flaggedKey = biomarkers
        .filter(needsClinicianDiscussion)
        .map(b => `${b.id}:${b.status}:${b.value}`)
        .join("|");

    useEffect(() => {
        if (biomarkers.length === 0) return;

        let cancelled = false;
        const fetchPrep = async () => {
            setLoading(true);
            try {
                const response = await fetch("/api/doctor-prep", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ demo: demoMode }),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Could not generate prep sheet.");
                if (!cancelled) setPrep(data);
            } catch (_error) {
                if (!cancelled) setPrep(fallback);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchPrep();
        return () => {
            cancelled = true;
        };
    }, [biomarkers.length, demoMode, flaggedKey, fallback]);

    if (biomarkers.length === 0) return null;

    const copyPrep = () => {
        const text = [
            "MedAssist Doctor Visit Prep",
            "",
            prep.summary,
            "",
            "Key results:",
            ...(prep.flagged.length > 0
                ? prep.flagged.map(b => `- ${b.name}: ${b.value} ${b.unit || ""} (${getPatientStatus(b.status).label})`)
                : ["- No flagged biomarkers in the latest report."]),
            "",
            "Notable changes:",
            ...(prep.changes.length > 0
                ? prep.changes.map(c => `- ${c.name}: ${c.previous} to ${c.current} (${c.percent > 0 ? "+" : ""}${c.percent}%)`)
                : ["- Not enough history for trend comparison."]),
            "",
            "Questions to ask:",
            ...prep.questions.map((q, i) => `${i + 1}. ${q}`),
            "",
            "Bring:",
            ...prep.checklist.map(item => `- ${item}`),
        ].join("\n");

        navigator.clipboard.writeText(text);
        toast.success("Appointment prep copied");
    };

    return (
        <section id="doctor-prep-sheet" className={cn("bg-white border border-sky-100 rounded-[18px] p-5 md:p-6 shadow-sm transition-all duration-300 hover:border-sky-200 hover:shadow-md stagger-fade", className)}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-5">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-[12px] bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                        <ClipboardList className="w-5 h-5 text-sky-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600 mb-1 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" />
                            Doctor Visit Prep
                        </p>
                        <h2 className="text-[21px] font-bold text-[#1C1917] leading-tight text-wrap-safe">
                            Your appointment one-pager
                        </h2>
                        <p className="text-[12px] text-[#78716C] mt-1">
                            Generated from your latest results{prep.reportCount > 1 ? ` and ${prep.reportCount - 1} prior report${prep.reportCount > 2 ? "s" : ""}` : ""}.
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 print:hidden">
                    <button
                        onClick={copyPrep}
                        className="inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-[#E8E6DF] bg-white px-3 py-2 text-[12px] font-semibold text-[#57534E] hover:border-sky-300 hover:text-sky-600 hover:shadow-sm active:scale-95 transition-all duration-200 min-h-[40px]"
                    >
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-sky-500 px-3 py-2 text-[12px] font-semibold text-white hover:bg-sky-600 hover:shadow-md active:scale-95 transition-all duration-200 min-h-[40px]"
                    >
                        {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
                        Print
                    </button>
                </div>
            </div>

            <p className="text-[14px] leading-relaxed text-[#57534E] mb-5 text-wrap-safe">
                {prep.summary}
            </p>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="rounded-[14px] border border-[#E8E6DF] bg-[#FAFAF7] p-4 transition-colors duration-300 hover:border-[#D9D6CD]">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-3">Top things to discuss</h3>
                    <div className="space-y-2">
                        {prep.flagged.length > 0 ? prep.flagged.map((b, idx) => (
                            <div
                                key={b.id}
                                className="flex flex-col items-start gap-2 rounded-[10px] bg-white border border-[#E8E6DF] px-3 py-2 min-w-0 sm:flex-row sm:justify-between transition-all duration-200 hover:border-sky-200 hover:-translate-y-0.5 hover:shadow-sm stagger-fade-sm"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <span className="min-w-0 text-[13px] font-semibold text-[#1C1917] break-words">{b.name}</span>
                                <span className={cn(
                                    "max-w-full rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-wrap-safe sm:shrink-0 border",
                                    getPatientStatus(b.status).badgeClass
                                )}>
                                    {b.value} {b.unit} · {getPatientStatus(b.status).label}
                                </span>
                            </div>
                        )) : (
                            <p className="text-[13px] text-[#78716C]">No flagged biomarkers in the latest report.</p>
                        )}
                    </div>
                </div>

                <div className="rounded-[14px] border border-[#E8E6DF] bg-[#FAFAF7] p-4 transition-colors duration-300 hover:border-[#D9D6CD]">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-3">What changed</h3>
                    <div className="space-y-2">
                        {prep.changes.length > 0 ? prep.changes.map((change, idx) => (
                            <div
                                key={change.name}
                                className="rounded-[10px] bg-white border border-[#E8E6DF] px-3 py-2 transition-all duration-200 hover:border-sky-200 hover:-translate-y-0.5 hover:shadow-sm stagger-fade-sm"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="flex flex-col gap-1 min-w-0 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="min-w-0 text-[13px] font-semibold text-[#1C1917] break-words">{change.name}</span>
                                    <span className={cn("text-[12px] font-bold sm:shrink-0", change.percent > 0 ? "text-amber-600" : "text-emerald-600")}>
                                        {change.percent > 0 ? "+" : ""}{change.percent}%
                                    </span>
                                </div>
                                <p className="text-[11px] text-[#78716C] mt-0.5 break-words">{change.previous} to {change.current}</p>
                            </div>
                        )) : (
                            <p className="text-[13px] text-[#78716C]">Upload another report to turn this into a trend review.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4 xl:grid-cols-2">
                <div className="rounded-[14px] border border-[#E8E6DF] bg-[#FAFAF7] p-4 transition-colors duration-300 hover:border-[#D9D6CD]">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-3">Ask your doctor</h3>
                    <ol className="space-y-2">
                        {prep.questions.map((question, index) => (
                            <li key={question} className="flex gap-2 text-[13px] text-[#57534E] leading-relaxed">
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[10px] font-bold text-sky-600">{index + 1}</span>
                                <span className="text-wrap-safe">{question}</span>
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="rounded-[14px] border border-[#E8E6DF] bg-[#FAFAF7] p-4 transition-colors duration-300 hover:border-[#D9D6CD]">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-3">Bring with you</h3>
                    <ul className="space-y-2">
                        {prep.checklist.map(item => (
                            <li key={item} className="flex gap-2 text-[13px] text-[#57534E] leading-relaxed">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                                <span className="text-wrap-safe">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
