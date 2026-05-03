'use client'

import { Sparkles, ArrowRight } from 'lucide-react'
import { Biomarker } from '@/types/medical'

const RECOMMENDATIONS: Record<string, string> = {
    'Vitamin D': 'Consider 15 min daily sunlight or discuss D3 supplementation with your doctor.',
    'Glucose': 'Monitor carbohydrate intake and consider a 10-minute walk after meals.',
    'Hemoglobin A1c': 'Focus on high-fiber foods and regular cardiovascular exercise.',
    'LDL Cholesterol': 'Increase intake of Omega-3 rich foods and soluble fiber (oats, beans).',
    'CRP': 'Focus on anti-inflammatory foods and prioritize 7–8 hours of quality sleep.',
    'Iron': 'Incorporate iron-rich foods (spinach, red meat) with Vitamin C for absorption.',
    'Hemoglobin': 'Monitor dietary iron intake. Pair iron-rich foods with Vitamin C to aid absorption.',
    'TSH': 'Consult your endocrinologist if TSH remains outside range on repeat testing.',
    'Triglycerides': 'Reduce added sugar intake and increase aerobic activity to 150 min/week.',
};

interface CarePlanSectionProps {
    latestBiomarkers: Biomarker[];
}

export function CarePlanSection({ latestBiomarkers }: CarePlanSectionProps) {
    const nonOptimal = [...latestBiomarkers]
        .filter(b => b.status !== 'optimal')
        .sort((a, _b) => (a.status === 'critical' ? -1 : 1))
        .slice(0, 3);

    if (nonOptimal.length === 0) return null;

    return (
        <div
            id="personalized-care-plan"
            className="bg-[#1C1917] rounded-[24px] p-8 mb-6 text-white shadow-xl relative overflow-hidden"
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none select-none">
                <Sparkles size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center border border-sky-500/30">
                        <ArrowRight className="w-5 h-5 text-sky-400" />
                    </div>
                    <h3 className="text-xl font-bold font-display" style={{ marginLeft: 12 }}>
                        Personalized Care Plan
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {nonOptimal.map((b, idx) => (
                        <PriorityCard key={String(b.id ?? b.name)} biomarker={b} priority={idx + 1} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function PriorityCard({ biomarker: b, priority }: { biomarker: Biomarker; priority: number }) {
    const isCritical = b.status === 'critical';
    const badgeClass = isCritical
        ? 'bg-red-500/20 border-red-500/30 text-red-400'
        : 'bg-amber-500/20 border-amber-500/30 text-amber-400';

    const recommendation =
        RECOMMENDATIONS[b.name] ??
        `Your ${b.name} is ${b.status} — consult your doctor about targeted ${b.category} improvements.`;

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors group">
            <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                    {b.status.toUpperCase()}
                </span>
                <span className="text-[10px] text-white/40 font-mono">PRIORITY {priority}</span>
            </div>
            <h4 className="text-[15px] font-bold mb-2 group-hover:text-sky-400 transition-colors">
                {b.name}
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">{recommendation}</p>
        </div>
    );
}
