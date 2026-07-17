'use client'

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Biomarker } from '@/types/medical'
import { getPatientStatus, PATIENT_STATUS } from '@/lib/patient-status';

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

const CATEGORIES = ['hematology', 'metabolic', 'lipids', 'thyroid', 'inflammation', 'vitamins', 'vitals', 'other'] as const;

function getDelta(current: number | string, previous: number | string | null | undefined) {
    if (previous === null || previous === undefined) return null;
    const curr = parseFloat(String(current));
    const prev = parseFloat(String(previous));
    if (isNaN(curr) || isNaN(prev) || prev === 0) return null;
    const diff = curr - prev;
    
    if (Math.abs(prev) < 1 && Math.abs(diff) < 1) {
        return { diff, percent: 0 };
    }
    
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
    const [showOptimal, setShowOptimal] = useState(false);

    // Process all biomarkers first to compute deltas
    const processedBiomarkers = latestBiomarkers.map(b => {
        const prev = displayBiomarkers.find(pb => pb.name === b.name && pb.lab_result_id !== latestLabResultId);
        const delta = getDelta(parseFloat(String(b.value)), prev?.value !== undefined ? parseFloat(String(prev.value)) : undefined);
        return { b, delta };
    });

    // Determine which need attention vs which are stable
    const attentionNeeded = processedBiomarkers.filter(({ b, delta }) => 
        b.status !== 'optimal' || (delta && Math.abs(delta.percent) >= 5)
    );
    const optimalStable = processedBiomarkers.filter(({ b, delta }) => 
        b.status === 'optimal' && (!delta || Math.abs(delta.percent) < 5)
    );

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h3 className="text-[10px] font-semibold uppercase text-[#64748B] tracking-wider">LATEST CLINICAL BIOMARKERS</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-[#64748B] uppercase tracking-tighter">
                    <span className="flex items-center gap-1.5"><div className={`w-1.5 h-1.5 rounded-full ${PATIENT_STATUS.optimal.dotClass}`} />{PATIENT_STATUS.optimal.label}: {optimalCount}</span>
                    <span className="flex items-center gap-1.5"><div className={`w-1.5 h-1.5 rounded-full ${PATIENT_STATUS.warning.dotClass}`} />{PATIENT_STATUS.warning.label}: {warningCount}</span>
                    <span className="flex items-center gap-1.5"><div className={`w-1.5 h-1.5 rounded-full ${PATIENT_STATUS.critical.dotClass}`} />{PATIENT_STATUS.critical.label}: {criticalCount}</span>
                </div>
            </div>

            {latestBiomarkers.length === 0 ? (
                <EmptyState onUploadClick={onUploadClick} />
            ) : latestBiomarkers.every(b => !b.value || b.value === null || b.value === '') ? (
                <div className="bg-amber-50 border border-amber-200 rounded-[14px] py-8 px-6 text-center">
                    <p className="text-[15px] text-amber-800 mb-4">
                        Your latest report was uploaded but no biomarkers were detected.
                    </p>
                    <p className="text-[13px] text-amber-700">
                        Try uploading a different file or enter values manually.
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Requires Attention Section */}
                    {attentionNeeded.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <h4 className="text-[14px] font-bold text-[#0F172A]">Requires Attention</h4>
                                <div className="h-[1px] grow shrink basis-0 bg-[#EBEAE4] ml-3" />
                            </div>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 md:gap-4">
                                {attentionNeeded.map(({ b, delta }, idx) => (
                                    <BiomarkerCard
                                        key={b.id}
                                        biomarker={b}
                                        delta={delta}
                                        onClick={() => onBiomarkerClick(b)}
                                        index={idx}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Optimal & Stable Section (Collapsible) */}
                    {optimalStable.length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-[#EBEAE4]/60">
                            <button 
                                onClick={() => setShowOptimal(!showOptimal)}
                                className="w-full flex items-center justify-between group py-2"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                    <h4 className="text-[14px] font-bold text-[#475569] group-hover:text-[#0F172A] transition-colors">
                                        Optimal & Stable ({optimalStable.length})
                                    </h4>
                                </div>
                                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#64748B] group-hover:text-[#0F172A] transition-colors">
                                    {showOptimal ? 'Hide details' : 'Show details'}
                                    {showOptimal ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </button>
                            
                            {showOptimal && (
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 md:gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {optimalStable.map(({ b, delta }, idx) => (
                                        <BiomarkerCard
                                            key={b.id}
                                            biomarker={b}
                                            delta={delta}
                                            onClick={() => onBiomarkerClick(b)}
                                            index={idx}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────

function EmptyState({ onUploadClick }: { onUploadClick: () => void }) {
    return (
        <div className="bg-[#FFFFFF] border border-[#EBEAE4] rounded-[14px] py-12 px-8 text-center flex flex-col items-center justify-center stagger-fade">
            <div className="w-16 h-16 bg-[#EBEAE4] rounded-full flex items-center justify-center mb-6 transition-transform duration-500 hover:scale-105">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                    <line x1="9" y1="12" x2="15" y2="12" />
                    <line x1="9" y1="16" x2="15" y2="16" />
                </svg>
            </div>
            <h3 className="text-[20px] font-semibold text-[#0F172A] mb-3 font-display">No lab results yet</h3>
            <p className="text-[15px] text-[#475569] max-w-md mx-auto mb-6 leading-relaxed">
                Upload your first lab report to build a doctor-ready visit brief.
            </p>
            <button
                onClick={onUploadClick}
                className="text-white rounded-[10px] px-6 py-3 font-medium bg-sky-500 hover:bg-sky-600 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
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
    index = 0,
}: {
    biomarker: Biomarker;
    delta: { diff: number; percent: number } | null;
    onClick: () => void;
    index?: number;
}) {
    const style = getPatientStatus(b.status);

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
            className="bg-white border border-[#EBEAE4] rounded-[14px] p-4 flex flex-col gap-3 transition-all duration-300 ease-out hover:border-sky-200 hover:shadow-md hover:-translate-y-0.5 focus-within:border-sky-300 focus-within:shadow-md cursor-pointer group shadow-sm relative overflow-hidden min-h-[120px] min-w-0 stagger-fade-sm"
            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            onClick={onClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }}}
            onTouchStart={(e) => {
                const el = e.currentTarget;
                if (el.classList.contains('active-tooltip')) return;
                el.classList.add('active-tooltip');
                setTimeout(() => el.classList.remove('active-tooltip'), 3000);
            }}
            tabIndex={0}
            role="button"
            aria-label={`${b.name}: ${b.value} ${b.unit}, ${style.label}. ${delta ? `${delta.percent} change from last result` : 'No previous data'}`}
        >
            {/* Plain-English hover overlay */}
            <div
                className="absolute inset-0 bg-sky-500/95 opacity-0 group-hover:opacity-100 group-[.active-tooltip]:opacity-100 transition-all duration-300 ease-out flex items-center justify-center p-4 text-center z-20 pointer-events-none backdrop-blur-sm transform-gpu gpu-accelerate"
                style={{ WebkitTransition: 'all 0.3s ease-out' }}
            >
                <p className="text-white text-[11px] font-medium leading-relaxed">
                    {BIOMARKER_DEFINITIONS[b.name] ?? 'Clinical biomarker used to assess specific metabolic or systemic health functions.'}
                </p>
            </div>

            {/* Top row: badge + value */}
            <div className="flex flex-col items-start gap-2 min-w-0">
                <div className={`inline-flex max-w-full items-center gap-2 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-transform duration-200 group-hover:scale-105 ${style.badgeClass}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${style.dotClass}`} />
                    <span className="truncate">{style.label.toUpperCase()}</span>
                    <span className="sr-only">({style.description})</span>
                </div>
                <div className="min-w-0 max-w-full">
                    <div className="text-[15px] font-bold text-[#0F172A] break-words leading-tight">
                        {b.value} <span className="text-[10px] font-normal text-[#64748B] break-words">{b.unit}</span>
                    </div>
                    {delta ? (
                        <div className={`text-[10px] font-bold flex items-center gap-1 text-wrap-safe ${deltaColor}`}>
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
                        <div className="text-[9px] font-bold text-[#64748B] uppercase tracking-tighter">No previous data</div>
                    )}
                </div>
            </div>

            {/* Name + interpretation */}
            <div className="grow shrink basis-0 flex flex-col min-w-0">
                <span className="text-[15px] font-bold text-[#0F172A] block mb-1 break-words">{b.name}</span>
                <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed italic mb-auto break-words min-h-[34px]">
                    {b.ai_interpretation || 'Clinical data point extracted from report.'}
                </p>

                {/* Range bar */}
                {showBar && (
                    <div className="mt-3">
                        <div className="flex justify-between gap-2 text-[10px] text-[#64748B] font-medium mb-1 min-w-0">
                            <span className="min-w-0 break-words">{rangeMin}</span>
                            <span className="min-w-0 break-words text-right">{rangeMax} {b.unit}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#EBEAE4] rounded-full relative overflow-hidden">
                            <div
                                className={`absolute top-0 bottom-0 left-0 rounded-full transition-[width] duration-700 ease-out ${style.barClass}`}
                                style={{ width: `${barPct}%`, minWidth: '4px' }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
