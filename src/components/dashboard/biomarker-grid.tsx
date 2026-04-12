'use client'

import { Biomarker } from '@/types/medical'

const BIOMARKER_DEFINITIONS: Record<string, string> = {
    'Glucose': 'Main sugar found in your blood; primary energy source.',
    'Hemoglobin A1c': 'Your average blood sugar levels over the past 3 months.',
    'LDL Cholesterol': '"Bad" cholesterol that can build up in your arteries.',
    'HDL Cholesterol': '"Good" cholesterol that helps remove other forms of cholesterol.',
    'Triglycerides': 'A type of fat found in your blood; indicates heart health.',
    'Total Cholesterol': 'The total amount of cholesterol circulating in your blood.',
    'Vitamin D': 'Essential for bone health and immune system function.',
    'C-Reactive Protein (CRP)': 'A marker of inflammation in the body.',
    'hs-CRP': 'High-sensitivity CRP; specifically assesses cardiovascular inflammation risk.',
    'Iron': 'Used to make hemoglobin, which carries oxygen in your blood.',
    'Ferritin': "A protein that stores iron; indicates your body's total iron reserves.",
    'TSH': 'Thyroid Stimulating Hormone; regulates your metabolism.',
    'Free T3': 'The active form of the thyroid hormone.',
    'Free T4': 'The main hormone produced by the thyroid gland.',
    'B12': 'Vital for nerve tissue health, brain function, and red blood cells.',
    'Magnesium': 'Involved in over 300 biochemical reactions in the body.',
    'Calcium': 'Vital for bone strength, muscle function, and nerve signaling.',
    'Sodium': 'An electrolyte that regulates fluid balance and blood pressure.',
    'Potassium': 'An electrolyte crucial for heart function and muscle contraction.',
    'ALT': 'Liver enzyme that can indicate liver health.',
    'AST': 'Another liver enzyme used to evaluate liver function.',
    'ALP': 'An enzyme related to bile ducts and bone health.',
    'Bilirubin': 'A yellowish substance made during the normal breakdown of red blood cells.',
    'Albumin': 'A protein made by your liver; prevents fluid from leaking out of blood vessels.',
    'Creatinine': 'Waste product filtered by kidneys; used to measure kidney function.',
    'BUN': 'Blood Urea Nitrogen; evaluates how well your kidneys are working.',
    'eGFR': 'Estimated Glomerular Filtration Rate; indicates overall kidney function.',
    'Hemoglobin': 'Protein in red blood cells that carries oxygen.',
    'Hematocrit': 'The proportion of your blood that consists of red blood cells.',
    'WBC': 'White blood cells; the core of your immune system defense.',
    'RBC': 'Red blood cells; responsible for delivering oxygen to tissues.',
    'Platelets': 'Cell fragments that help your blood clot.',
    'Cortisol': 'The primary stress hormone; affects metabolism and immune response.',
    'Testosterone': 'A hormone important for muscle mass, bone density, and sex drive.',
    'Estradiol': 'The primary female sex hormone, important in multiple metabolic functions.',
    'Insulin': 'A hormone that helps your body use or store glucose for energy.',
    'ApoB': 'The primary protein in LDL cholesterol; a precise marker for heart disease risk.',
};

const CATEGORIES = ['hematology', 'metabolic', 'inflammation', 'vitamins', 'other'] as const;

function getDelta(current: number | string, previous: number | string | null | undefined) {
    if (previous === null || previous === undefined) return null;
    const curr = parseFloat(String(current));
    const prev = parseFloat(String(previous));
    if (isNaN(curr) || isNaN(prev) || prev === 0) return null;
    const diff = curr - prev;
    const percent = Math.round((diff / prev) * 100);
    return { diff, percent };
}

interface BiomarkerGridProps {
    latestBiomarkers: Biomarker[];
    displayBiomarkers: Biomarker[];
    latestLabResultId?: number | string;
    optimalCount: number;
    warningCount: number;
    criticalCount: number;
    onBiomarkerClick: (b: Biomarker) => void;
    onUploadClick: () => void;
}

export function BiomarkerGrid({
    latestBiomarkers,
    displayBiomarkers,
    latestLabResultId,
    optimalCount,
    warningCount,
    criticalCount,
    onBiomarkerClick,
    onUploadClick,
}: BiomarkerGridProps) {
    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h3 className="text-[10px] font-semibold uppercase text-[#A8A29E] tracking-wider">LATEST CLINICAL BIOMARKERS</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-[#A8A29E] uppercase tracking-tighter">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Optimal: {optimalCount}</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" />Monitor: {warningCount}</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500" />Action: {criticalCount}</span>
                </div>
            </div>

            {latestBiomarkers.length === 0 ? (
                <EmptyState onUploadClick={onUploadClick} />
            ) : (
                <div className="space-y-8">
                    {CATEGORIES.map(cat => {
                        const catBiomarkers = latestBiomarkers.filter(b => {
                            const bCat = b.category?.toLowerCase() || 'other';
                            if (cat === 'other') {
                                return !(['hematology', 'metabolic', 'inflammation', 'vitamins'] as string[]).includes(bCat);
                            }
                            return bCat === cat;
                        });
                        if (catBiomarkers.length === 0) return null;

                        return (
                            <div key={cat} className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-[14px] font-bold text-[#1C1917] capitalize">{cat}</h4>
                                    <div className="h-[1px] grow shrink basis-0 bg-[#E8E6DF]" style={{ marginLeft: 12 }} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {catBiomarkers.map(b => {
                                        const prev = displayBiomarkers.find(
                                            pb => pb.name === b.name && pb.lab_result_id !== latestLabResultId
                                        );
                                        const delta = getDelta(
                                            parseFloat(String(b.value)),
                                            prev?.value !== undefined ? parseFloat(String(prev.value)) : undefined
                                        );
                                        return (
                                            <BiomarkerCard
                                                key={b.id}
                                                biomarker={b}
                                                delta={delta}
                                                onClick={() => onBiomarkerClick(b)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────

function EmptyState({ onUploadClick }: { onUploadClick: () => void }) {
    return (
        <div className="bg-[#F5F4EF] border border-[#E8E6DF] rounded-[14px] py-12 px-8 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[#E8E6DF] rounded-full flex items-center justify-center mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                    <line x1="9" y1="12" x2="15" y2="12" />
                    <line x1="9" y1="16" x2="15" y2="16" />
                </svg>
            </div>
            <h3 className="text-[20px] font-semibold text-[#1C1917] mb-3 font-display">No lab results yet</h3>
            <p className="text-[15px] text-[#57534E] max-w-md mx-auto mb-6 leading-relaxed">
                Upload your first lab report to see your health overview.
            </p>
            <button
                onClick={onUploadClick}
                className="text-white rounded-[10px] px-6 py-3 font-medium bg-sky-500 hover:bg-sky-600 transition-colors"
                style={{ WebkitAppearance: 'none' }}
            >
                Upload your first report
            </button>
        </div>
    );
}

function BiomarkerCard({
    biomarker: b,
    delta,
    onClick,
}: {
    biomarker: Biomarker;
    delta: { diff: number; percent: number } | null;
    onClick: () => void;
}) {
    const statusStyles = {
        optimal: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
        warning: { badge: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500', bar: 'bg-amber-500' },
        critical: { badge: 'bg-red-50 text-red-700 border-red-100', dot: 'bg-red-500', bar: 'bg-red-500' },
    };
    const style = statusStyles[b.status] ?? statusStyles.optimal;

    const deltaPositive = delta && delta.diff > 0;
    const deltaGood = deltaPositive ? b.status === 'optimal' : b.status !== 'optimal';
    const deltaColor = delta ? (deltaGood ? 'text-emerald-600' : 'text-red-600') : '';

    const val = parseFloat(String(b.value));
    const rangeMin = b.reference_range_min;
    const rangeMax = b.reference_range_max;
    const showBar =
        rangeMin !== undefined && rangeMin !== null &&
        rangeMax !== undefined && rangeMax !== null &&
        rangeMax > rangeMin;
    const barPct = showBar
        ? Math.max(0, Math.min(100, ((val - rangeMin!) / (rangeMax! - rangeMin!)) * 100))
        : 0;

    return (
        <div
            className="bg-white border border-[#E8E6DF] rounded-[14px] p-4 flex flex-col gap-3 transition-all hover:border-sky-200 cursor-pointer group shadow-sm relative overflow-hidden min-h-[120px]"
            onClick={onClick}
            onTouchStart={(e) => {
                const el = e.currentTarget;
                if (el.classList.contains('active-tooltip')) return;
                el.classList.add('active-tooltip');
                setTimeout(() => el.classList.remove('active-tooltip'), 3000);
            }}
        >
            {/* Plain-English hover overlay */}
            <div
                className="absolute inset-0 bg-sky-500/95 opacity-0 group-hover:opacity-100 group-[.active-tooltip]:opacity-100 transition-all duration-200 flex items-center justify-center p-4 text-center z-20 pointer-events-none backdrop-blur-sm transform-gpu gpu-accelerate"
                style={{ WebkitTransition: 'all 0.2s ease-out' }}
            >
                <p className="text-white text-[11px] font-medium leading-relaxed">
                    {BIOMARKER_DEFINITIONS[b.name] ?? 'Clinical biomarker used to assess specific metabolic or systemic health functions.'}
                </p>
            </div>

            {/* Top row: badge + value */}
            <div className="flex justify-between items-start">
                <div className={`flex items-center gap-2 px-2 py-0.5 rounded-full text-[10px] font-bold border ${style.badge}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    {b.status.toUpperCase()}
                </div>
                <div className="text-right" style={{ marginLeft: 'auto' }}>
                    <div className="text-[15px] font-bold text-[#1C1917]">
                        {b.value} <span className="text-[10px] font-normal text-gray-500">{b.unit}</span>
                    </div>
                    {delta ? (
                        <div className={`text-[10px] font-bold flex items-center justify-end gap-1 ${deltaColor}`}>
                            {deltaPositive ? (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m18 15-6-6-6 6" />
                                </svg>
                            ) : (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            )}
                            {Math.abs(delta.percent)}% from last
                        </div>
                    ) : (
                        <div className="text-[9px] font-bold text-[#A8A29E] uppercase tracking-tighter">No previous data</div>
                    )}
                </div>
            </div>

            {/* Name + interpretation */}
            <div className="grow shrink basis-0 flex flex-col">
                <span className="text-[15px] font-bold text-[#1C1917] block mb-1">{b.name}</span>
                <p className="text-[11px] text-[#A8A29E] line-clamp-2 leading-relaxed italic mb-auto">
                    {b.ai_interpretation || 'Clinical data point extracted from report.'}
                </p>

                {/* Range bar */}
                {showBar && (
                    <div className="mt-3">
                        <div className="flex justify-between text-[10px] text-[#A8A29E] font-medium mb-1">
                            <span>{rangeMin}</span>
                            <span>{rangeMax} {b.unit}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#E8E6DF] rounded-full relative overflow-hidden">
                            <div
                                className={`absolute top-0 bottom-0 left-0 rounded-full ${style.bar}`}
                                style={{ width: `${barPct}%`, minWidth: '4px' }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
