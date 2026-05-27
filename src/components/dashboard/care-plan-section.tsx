'use client'

import { Sparkles, ArrowRight } from 'lucide-react'
import { Biomarker } from '@/types/medical'
import { getPatientStatus, needsClinicianDiscussion, sortByPatientPriority } from '@/lib/patient-status'

const RECOMMENDATIONS: Record<string, string> = {
    'Vitamin D': 'Ask what maintenance level and retest timeline make sense for you.',
    'Glucose': 'Ask whether this trend changes your follow-up testing or meal-timing recommendations.',
    'Hemoglobin A1c': 'Ask what target range and re-test timeline make sense for you.',
    'LDL Cholesterol': 'Ask whether lifestyle context, repeat testing, or medication discussion is appropriate.',
    'CRP': 'Ask whether this needs repeat testing or symptom context.',
    'Iron': 'Ask whether ferritin, B12, or dietary intake should be reviewed together.',
    'Hemoglobin': 'Ask whether iron, ferritin, B12, or bleeding risk should be checked.',
    'TSH': 'Consult your endocrinologist if TSH remains outside range on repeat testing.',
    'Triglycerides': 'Reduce added sugar intake and increase aerobic activity to 150 min/week.',
};

interface CarePlanSectionProps {
    latestBiomarkers: Biomarker[];
}

export function CarePlanSection({ latestBiomarkers }: CarePlanSectionProps) {
    const nonOptimal = sortByPatientPriority(latestBiomarkers.filter(needsClinicianDiscussion))
        .slice(0, 3);

    if (nonOptimal.length === 0) return null;

    return (
        <div
            id="personalized-care-plan"
            className="bg-[#1C1917] rounded-[18px] p-5 lg:p-6 mb-6 text-white shadow-xl relative overflow-hidden min-w-0"
        >
            {/* Background decoration */}
            <div className="absolute -top-3 -right-3 p-6 opacity-10 pointer-events-none select-none">
                <Sparkles size={96} />
            </div>

            <div className="relative z-10">
                <div className="flex items-start gap-3 mb-5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center border border-sky-500/30 shrink-0">
                        <ArrowRight className="w-5 h-5 text-sky-400" />
                    </div>
                    <h3 className="text-[20px] leading-tight font-bold font-display text-wrap-safe">
                        Top Discussion Points
                    </h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {nonOptimal.map((b, idx) => (
                        <PriorityCard key={String(b.id ?? b.name)} biomarker={b} priority={idx + 1} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function PriorityCard({ biomarker: b, priority }: { biomarker: Biomarker; priority: number }) {
    const status = getPatientStatus(b.status);
    const badgeClass = b.status === 'critical'
        ? 'bg-red-500/20 border-red-500/30 text-red-400'
        : 'bg-amber-500/20 border-amber-500/30 text-amber-400';

    const recommendation =
        RECOMMENDATIONS[b.name] ??
        `Your ${b.name} is marked "${status.label}" — ask your clinician what could explain it and when it should be rechecked.`;

    return (
        <div className="bg-white/5 border border-white/10 rounded-[14px] p-4 lg:p-5 hover:bg-white/10 transition-colors group min-w-0">
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                    {status.label.toUpperCase()}
                </span>
                <span className="text-[10px] text-white/40 font-mono shrink-0">PRIORITY {priority}</span>
            </div>
            <h4 className="text-[15px] font-bold mb-2 group-hover:text-sky-400 transition-colors break-words">
                {b.name}
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed break-words">{recommendation}</p>
        </div>
    );
}
