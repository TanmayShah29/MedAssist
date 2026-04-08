'use client'

import { useState, useEffect, useMemo } from 'react'
import { logger } from '@/lib/logger'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

import {
    ClipboardList,
    AlertCircle,
    Activity,
    FileText,
    Upload,
    PlayCircle,
    Printer,
    WifiOff,

    Sparkles,
    ArrowRight,
    TrendingUp,
    TrendingDown
} from 'lucide-react'




import { UploadModal } from '@/components/upload-modal'
import { BiomarkerDetailSheet } from '@/components/dashboard/BiomarkerDetailSheet'

import { AIInsightsFeed } from '@/components/dashboard/ai-insights-feed'
import { ActionItems } from '@/components/dashboard/action-items'
import { PriorityAlertCard } from '@/components/dashboard/priority-alert-card'
import { TrendSnapshot } from '@/components/dashboard/trend-snapshot'
import { HealthScoreOverview } from '@/components/dashboard/health-score-overview'
import { DoctorQuestions } from '@/components/dashboard/doctor-questions'
import { MedicineCabinet } from '@/components/dashboard/medicine-cabinet'

import { DEMO_HISTORY, DEMO_LAB_RESULT } from '@/lib/demo-data'
import { Biomarker, Profile, LabResult } from '@/types/medical'

// ── Plain English Definitions ──
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
    'Ferritin': 'A protein that stores iron; indicates your body\'s total iron reserves.',
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

function getDelta(current: number | string, previous: number | string | null | undefined) {
    if (previous === null || previous === undefined) return null;
    const curr = parseFloat(String(current));
    const prev = parseFloat(String(previous));
    if (isNaN(curr) || isNaN(prev) || prev === 0) return null;
    const diff = curr - prev;
    const percent = Math.round((diff / prev) * 100);
    return { diff, percent };
}

function _PriorityActionBanner({ criticalCount }: { criticalCount: number }) {
    if (criticalCount === 0) return null;

    return (
        <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderLeft: '4px solid #DC2626',
            borderRadius: 14,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: '#DC2626', color: 'white', padding: 8, borderRadius: 10 }}>
                    <AlertCircle size={20} />
                </div>
                <div>
                    <h4 style={{ color: '#991B1B', fontWeight: 700, fontSize: 16, margin: 0 }}>Action Needed</h4>
                    <p style={{ color: '#B91C1C', fontSize: 13, margin: '2px 0 0 0' }}>
                        We identified {criticalCount} {criticalCount === 1 ? 'critical finding' : 'critical findings'} in your latest report.
                    </p>
                </div>
            </div>
            <button
                onClick={() => {
                    const el = document.getElementById('personalized-care-plan');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                    background: '#DC2626',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                Review Clinical Insights
            </button>
        </div>
    );
}

function LongitudinalComparisonCard({
    latestBiomarkers,
    previousBiomarkers,
    reportDate,
    previousReportDate
}: {
    latestBiomarkers: Biomarker[],
    previousBiomarkers: Biomarker[],
    reportDate: string,
    previousReportDate: string
}) {
    type Change = { name: string; currentValue: string; previousValue: string; unit: string; percent: number; status: string };
    const changes = latestBiomarkers.map(curr => {
        const prev = previousBiomarkers.find(p => p.name === curr.name);
        if (!prev) return null;
        const delta = getDelta(curr.value, prev.value);
        if (!delta || Math.abs(delta.percent) < 5) return null;
        return {
            name: curr.name,
            currentValue: curr.value,
            previousValue: prev.value,
            unit: curr.unit,
            percent: delta.percent,
            status: curr.status
        } as Change;
    }).filter((c): c is Change => c !== null);

    if (changes.length === 0) return null;

    // Show 3 biggest changes
    const topChanges = changes.sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent)).slice(0, 3);

    return (
        <div style={{
            background: 'white',
            border: '1px solid #E8E6DF',
            borderRadius: 18,
            padding: 24,
            marginBottom: 24
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1C1917', margin: 0 }}>Progress Report</h3>
                    <p style={{ fontSize: 12, color: '#A8A29E', margin: '4px 0 0 0' }}>
                        Changes from {new Date(previousReportDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} to {new Date(reportDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                </div>
                <div style={{ background: '#F0F9FF', color: '#0EA5E9', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {changes.length} significant changes
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {topChanges.map((change, idx) => (
                    <div key={idx} style={{
                        padding: 16,
                        background: '#FAF9F6',
                        borderRadius: 12,
                        border: '1px solid #E8E6DF'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#44403C' }}>{change.name}</span>
                            <span style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: change.percent > 0 ? (change.status === 'optimal' ? '#059669' : '#DC2626') : (change.status === 'optimal' ? '#059669' : '#DC2626'),
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                            }}>
                                {change.percent > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {Math.abs(change.percent)}%
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                            <span style={{ fontSize: 20, fontWeight: 800, color: '#1C1917' }}>{change.currentValue}</span>
                            <span style={{ fontSize: 12, color: '#A8A29E' }}>{change.unit}</span>
                        </div>
                        <p style={{ fontSize: 11, color: '#78716C', margin: '4px 0 0 0' }}>
                            Was {change.previousValue} {change.unit}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Chart Components ──

// ── Chart Components ──

export default function DashboardClient({
    initialProfile,
    initialBiomarkers,
    initialSymptoms,
    initialLabResults
}: {
    initialProfile: Profile | null,
    initialBiomarkers: Biomarker[],
    initialSymptoms: string[],
    initialLabResults: LabResult[]
}) {
    const router = useRouter()

    const [mounted, setMounted] = useState(false)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const profile = initialProfile;
    const biomarkers = initialBiomarkers;
    const _symptoms = initialSymptoms || [];
    const labResults = initialLabResults;

    const [selectedBiomarkerData, setSelectedBiomarkerData] = useState<Biomarker | null>(null);
    const [showDetailSheet, setShowDetailSheet] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const [demoMode, setDemoMode] = useState(false);
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [_supplements, setSupplements] = useState<Record<string, unknown>[]>([]);

    useEffect(() => {
        setMounted(true)
        const fetchSupps = async () => {
            try {
                const res = await fetch('/api/supplements');
                const data = await res.json();
                if (data.supplements) setSupplements(data.supplements);
            } catch (err) {
                logger.error("Failed to fetch supplements", err);
            }
        };
        fetchSupps();
    }, []);

    // Open upload modal when arriving with ?openUpload=1 (e.g. from Results "Upload New Report")
    useEffect(() => {
        if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('openUpload') === '1') {
            setShowUploadModal(true);
            router.replace('/dashboard', { scroll: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Derived Data taking Demo Mode into account
    const displayLabResults = useMemo(() => demoMode
        ? [DEMO_LAB_RESULT, ...initialLabResults]
        : initialLabResults, [demoMode, initialLabResults]);

    const displayBiomarkers = useMemo(() => demoMode
        ? [...DEMO_HISTORY, ...initialBiomarkers]
        : initialBiomarkers, [demoMode, initialBiomarkers]);

    // Deduplicate to get the latest entry for each biomarker name
    const latestBiomarkers = Array.from(
        displayBiomarkers.reduce((acc, current) => {
            const existing = acc.get(current.name);
            if (!existing || new Date(current.created_at || 0) > new Date(existing.created_at || 0)) {
                acc.set(current.name, current);
            }
            return acc;
        }, new Map<string, Biomarker>()).values()
    );

    const latestLabResult = displayLabResults[0];
    const longitudinalInsights: string[] = (latestLabResult?.raw_ai_json as { longitudinalInsights?: string[] })?.longitudinalInsights || [];
    const symptomConnections: { symptom: string; biomarker: string; relevance: string; relatedBiomarkers?: string[]; explanation?: string }[] = (latestLabResult as { symptom_connections?: { symptom: string; biomarker: string; relevance: string; relatedBiomarkers?: string[]; explanation?: string }[] })?.symptom_connections || [];

    // Offline Resilience: Save to LocalStorage (never mix demo with real data)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (displayLabResults.length > 0) {
                if (demoMode) {
                    localStorage.setItem('medassist_cached_demo_lab_results', JSON.stringify(displayLabResults));
                    localStorage.setItem('medassist_cached_demo_biomarkers', JSON.stringify(displayBiomarkers));
                } else {
                    localStorage.setItem('medassist_cached_lab_results', JSON.stringify(displayLabResults));
                    localStorage.setItem('medassist_cached_biomarkers', JSON.stringify(displayBiomarkers));
                }
            }

            const handleOnline = () => setIsOffline(false);
            const handleOffline = () => setIsOffline(true);

            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);
            setIsOffline(!navigator.onLine);

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }
    }, [displayLabResults, displayBiomarkers, demoMode]);

    const handleBiomarkerClick = (b: Biomarker) => {
        setSelectedBiomarkerData(b);
        setShowDetailSheet(true);
    };

    const handlePrint = () => {
        window.print();
    };


    // Derived values - use latestBiomarkers for current state summary
    const optimalCount = latestBiomarkers.filter(b => b.status === 'optimal').length
    const warningCount = latestBiomarkers.filter(b => b.status === 'warning').length
    const criticalCount = latestBiomarkers.filter(b => b.status === 'critical').length
    const totalCount = latestBiomarkers.length

    // Extract real Health Score from AI DB records
    let healthScore = 0;
    if (displayLabResults && displayLabResults.length > 0) {
        const latestResult = displayLabResults[0];
        const rawJson = latestResult?.raw_ai_json as { healthScore?: number } | undefined;
        if (rawJson && typeof rawJson.healthScore === 'number') {
            healthScore = rawJson.healthScore;
        }
    }

    // Fallback recalculation if no score exists but markers do
    if (healthScore === 0 && totalCount > 0) {
        const rawScore = ((optimalCount * 100) + (warningCount * 75) + (criticalCount * 40)) / totalCount
        // Apply a floor — no one with any optimal values scores below 50
        const floor = optimalCount > 0 ? 50 : 30
        healthScore = Math.round(Math.max(floor, rawScore))
    }


    // Removed loading skeleton since data is passed directly from server

    // 3b: Show last report date on dashboard
    const lastUpdated = displayLabResults?.[0]?.uploaded_at
        ? new Date(displayLabResults[0].uploaded_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
        : null

    return (
        <div className="min-h-[100dvh] bg-[#FAFAF7] px-4 py-6 md:p-6 text-[#1C1917] font-sans" id="dashboard-content">

            {/* ── Print-only Header ── */}
            <div className="hidden print:flex items-center justify-between border-b-2 border-black pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-tight">MedAssist Health Overview</h1>
                    <p className="text-sm font-medium mt-1">Summary of Clinical Biomarkers & Wellness Trends</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold">DATE: {mounted ? new Date().toLocaleDateString('en-US') : ''}</p>
                    <p className="text-xs">Patient: {profile?.first_name} {profile?.last_name}</p>
                </div>
            </div>

            {/* ── Header row ── */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="font-display text-[28px] md:text-[32px] text-[#1C1917] m-0">
                            Clinical Overview
                        </h1>
                        {isOffline && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[10px] font-bold animate-pulse">
                                <WifiOff size={12} />
                                OFFLINE MODE
                            </div>
                        )}
                    </div>
                    {lastUpdated ? (
                        <p className="text-[13px] text-[#A8A29E] mt-1">
                            Last report: {lastUpdated}
                        </p>
                    ) : (
                        <p className="text-[14px] text-[#57534E] mt-1">
                            {initialLabResults.length > 0 ? 'Welcome back, ' : 'Welcome, '}
                            {profile?.first_name || 'Patient'}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="p-2.5 bg-white border border-[#E8E6DF] rounded-[12px] text-[#57534E] hover:bg-gray-50 transition-all shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Print Report"
                        style={{ WebkitAppearance: 'none' }}
                    >
                        <Printer className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="bg-sky-500 hover:bg-sky-600 text-white rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2 min-h-[44px]"
                        style={{ WebkitAppearance: 'none' }}
                    >
                        <Upload size={16} />
                        Upload Report
                    </button>
                </div>
            </div>

            {/* ── Informational Banners: Risk Summary & Upload Nudge ── */}
            {
                totalCount > 0 && (
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        {/* Risk Summary Banner - Only show if there are flags */}
                        {(criticalCount > 0 || warningCount > 0) && (
                            <div className="grow shrink basis-0 bg-white border border-[#E8E6DF] rounded-[18px] p-5 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${criticalCount > 0 ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                                        <Activity size={24} />
                                    </div>
                                    <div style={{ marginLeft: 16 }}>
                                        <h3 className="text-sm font-bold text-[#1C1917]">Risk Level Summary</h3>
                                        <p className="text-xs text-[#57534E]">
                                            {criticalCount > 0
                                                ? `${criticalCount} urgent markers need attention`
                                                : `${warningCount} markers to monitor closely`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2" style={{ marginLeft: 'auto' }}>
                                    <div className="text-center px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                                        <span className="block text-xs font-bold text-emerald-700">{optimalCount}</span>
                                        <span className="text-[10px] text-emerald-600 uppercase font-semibold">Opt</span>
                                    </div>
                                    <div className="text-center px-3 py-1 bg-amber-50 rounded-lg border border-amber-100" style={{ marginLeft: 8 }}>
                                        <span className="block text-xs font-bold text-amber-700">{warningCount}</span>
                                        <span className="text-[10px] text-amber-600 uppercase font-semibold">Mon</span>
                                    </div>
                                    <div className="text-center px-3 py-1 bg-red-50 rounded-lg border border-red-100" style={{ marginLeft: 8 }}>
                                        <span className="block text-xs font-bold text-red-700">{criticalCount}</span>
                                        <span className="text-[10px] text-red-600 uppercase font-semibold">Act</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Upload Reminder Nudge - Only if they have a history (not first time) */}
                        {latestLabResult && initialLabResults.length > 0 && (
                            <div className="grow shrink basis-0 bg-white border border-[#E8E6DF] rounded-[18px] p-5 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center">
                                        <ClipboardList size={24} />
                                    </div>
                                    <div style={{ marginLeft: 16 }}>
                                        <h3 className="text-sm font-bold text-[#1C1917]">Recency Tracking</h3>
                                        <p className="text-xs text-[#57534E]">
                                            Last test was {Math.floor((new Date().getTime() - new Date(latestLabResult.uploaded_at ?? latestLabResult.created_at ?? 0).getTime()) / (1000 * 3600 * 24))} days ago
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right" style={{ marginLeft: 'auto' }}>
                                    {Math.floor((new Date().getTime() - new Date(latestLabResult.uploaded_at ?? latestLabResult.created_at ?? 0).getTime()) / (1000 * 3600 * 24)) > 90 ? (
                                        <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-[10px] font-bold">DUE FOR NEW TEST</span>
                                    ) : (
                                        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-bold">UP TO DATE</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )
            }

            {/* ── Demo mode banner: avoid mistaking sample data for real data ── */}
            {
                demoMode && (
                    <div className="mb-6 flex items-center justify-between gap-4 rounded-[12px] border-2 border-amber-300 bg-amber-50 px-4 py-3 print:hidden">
                        <p className="text-sm font-semibold text-amber-900">
                            You&apos;re viewing <strong>sample data</strong> — not your personal results. Health score and biomarkers below are for demo only.
                        </p>
                        <button
                            onClick={() => setDemoMode(false)}
                            className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
                            style={{ WebkitAppearance: 'none' }}
                        >
                            Show my data
                        </button>
                    </div>
                )
            }


            {/* ── Dashboard Content ── */}
            {
                totalCount === 0 ? (
                    <div style={{
                        background: '#F5F4EF',
                        border: '1px solid #E8E6DF',
                        borderRadius: 18,
                        padding: '48px 32px',
                        textAlign: 'center',
                        marginBottom: 24
                    }}>
                        <div style={{
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            background: '#E0F2FE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px auto'
                        }}>
                            <FileText size={24} color="#0EA5E9" />
                        </div>
                        <h2 style={{
                            fontFamily: 'Instrument Serif',
                            fontSize: 28,
                            fontWeight: 700,
                            color: '#1C1917',
                            margin: '0 0 12px 0'
                        }}>
                            Ready when you are
                        </h2>
                        <p style={{ fontSize: 15, color: '#57534E', maxWidth: 400, margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                            Upload your first lab report and MedAssist will extract every biomarker, explain each value in plain English, and show you what needs attention.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                            <button
                                onClick={() => setShowUploadModal(true)}
                                style={{
                                    background: '#0EA5E9',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 10,
                                    padding: '12px 24px',
                                    fontSize: 15,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    WebkitAppearance: 'none',
                                    minHeight: '44px'
                                }}
                            >
                                Upload my first report
                            </button>
                            <button
                                onClick={() => setDemoMode(true)}
                                className="flex items-center gap-2 px-4 py-3 rounded-[10px] border-2 border-sky-500 text-sky-600 font-semibold text-[15px] hover:bg-sky-50 transition-colors min-h-[44px]"
                                style={{ WebkitAppearance: 'none' }}
                            >
                                <PlayCircle size={18} />
                                Try with sample lab report
                            </button>
                        </div>
                        <p style={{ fontSize: 12, color: '#A8A29E', marginTop: 12 }}>
                            Supports digital PDF lab reports · Takes 20–40 seconds
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 mb-6">
                        <PriorityAlertCard biomarkers={latestBiomarkers} />

                        {symptomConnections.length > 0 && (
                            <div style={{
                                background: '#FFF7ED',
                                border: '1px solid #FED7AA',
                                borderLeft: '4px solid #F59E0B',
                                borderRadius: 14,
                                padding: 24,
                                marginBottom: 16
                            }}>
                                <p style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: '#92400E',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    margin: '0 0 16px 0'
                                }}>
                                    YOUR SYMPTOMS MAY BE CONNECTED TO THESE RESULTS
                                </p>
                                {symptomConnections.map((conn) => (
                                    <div key={conn.symptom} style={{
                                        marginBottom: 16,
                                        paddingBottom: 16,
                                        borderBottom: '1px solid #FED7AA'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                                            <div style={{
                                                background: '#F59E0B',
                                                color: 'white',
                                                borderRadius: 6,
                                                padding: '2px 10px',
                                                fontSize: 12,
                                                fontWeight: 600
                                            }}>
                                                {conn.symptom}
                                            </div>
                                            <span style={{ fontSize: 12, color: '#A8A29E' }}>
                                                may be related to
                                            </span>
                                            {conn.relatedBiomarkers?.map((b: string) => (
                                                <div key={b} style={{
                                                    background: '#F5F4EF',
                                                    border: '1px solid #E8E6DF',
                                                    borderRadius: 6,
                                                    padding: '2px 8px',
                                                    fontSize: 12,
                                                    color: '#57534E'
                                                }}>
                                                    {b}
                                                </div>
                                            ))}
                                        </div>
                                        <p style={{ fontSize: 13, color: '#57534E', margin: 0, lineHeight: 1.6 }}>
                                            {conn.explanation}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Section 6a — Symptom empty state notice */}
                        {initialSymptoms.length === 0 && totalCount > 0 && (
                            <div style={{
                                background: '#FFFBEB',
                                border: '1px solid #FDE68A',
                                borderLeft: '4px solid #F59E0B',
                                borderRadius: 10,
                                padding: '12px 16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 12
                            }}>
                                <p style={{ fontSize: 14, color: '#57534E', margin: 0 }}>
                                    Add your symptoms to get more personalised insights from your lab results.
                                </p>
                                <a href="/profile" style={{
                                    fontSize: 13,
                                    color: '#0EA5E9',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                }}>
                                    Add symptoms →
                                </a>
                            </div>
                        )}

                        {/* Feature 3: Longitudinal Comparison */}
                        {displayLabResults.length >= 2 && (
                            <LongitudinalComparisonCard
                                latestBiomarkers={latestBiomarkers}
                                previousBiomarkers={displayBiomarkers.filter(b => b.lab_result_id === displayLabResults[1].id)}
                                reportDate={displayLabResults[0].uploaded_at || displayLabResults[0].created_at || ''}
                                previousReportDate={displayLabResults[1].uploaded_at || displayLabResults[1].created_at || ''}
                            />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <HealthScoreOverview
                                score={healthScore}
                                optimalCount={optimalCount}
                                warningCount={warningCount}
                                criticalCount={criticalCount}
                                biomarkers={latestBiomarkers}
                                onClick={() => setShowScoreModal(true)}
                            />
                            <TrendSnapshot
                                latestBiomarkers={latestBiomarkers}
                                history={displayBiomarkers}
                                latestLabResult={latestLabResult}
                            />
                        </div>
                    </div>
                )
            }

            {/* ── Personalized "What to do next" Card ── */}
            {
                totalCount > 0 && (
                    <>
                        <div id="personalized-care-plan" className="bg-[#0F172A] rounded-[24px] p-8 mb-6 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Sparkles size={120} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center border border-sky-500/30">
                                        <ArrowRight className="w-5 h-5 text-sky-400" />
                                    </div>
                                    <h3 className="text-xl font-bold font-display" style={{ marginLeft: 12 }}>Personalized Care Plan</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[...latestBiomarkers]
                                        .filter(b => b.status !== 'optimal')
                                        .sort((a, _b) => (a.status === 'critical' ? -1 : 1))
                                        .slice(0, 3)
                                        .map((b, idx) => {
                                            const recommendations: Record<string, string> = {
                                                'Vitamin D': 'Consider 15m daily sunlight or discuss D3 supplementation with your doctor.',
                                                'Glucose': 'Monitor carbohydrate intake and consider a 10-minute walk after meals.',
                                                'Hemoglobin A1c': 'Focus on high-fiber foods and regular cardiovascular exercise.',
                                                'LDL Cholesterol': 'Increase intake of Omega-3 rich foods and soluble fiber (oats, beans).',
                                                'CRP': 'Focus on anti-inflammatory foods and prioritize 7-8 hours of quality sleep.',
                                                'Iron': 'Incorporate more iron-rich foods (spinach, red meat) with Vitamin C for absorption.',
                                            };
                                            const fallback = `Your ${b.name} is ${b.status} — consult your doctor about targeted ${b.category} improvements.`;

                                            return (
                                                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors group">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${b.status === 'critical' ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-amber-500/20 border-amber-500/30 text-amber-400'}`}>
                                                            {b.status.toUpperCase()}
                                                        </span>
                                                        <span className="text-[10px] text-white/40 font-mono">PRIORITY {idx + 1}</span>
                                                    </div>
                                                    <h4 className="text-[15px] font-bold mb-2 group-hover:text-sky-400 transition-colors">{b.name}</h4>
                                                    <p className="text-sm text-slate-400 leading-relaxed">
                                                        {recommendations[b.name] || fallback}
                                                    </p>
                                                </div>
                                            )
                                        })}
                                </div>
                            </div>
                        </div>

                        <DoctorQuestions biomarkers={latestBiomarkers} className="mb-8" />
                    </>
                )
            }
            {
                longitudinalInsights.length > 0 && (
                    <div className="bg-[#FBFCFE] border border-[#E0E7FF] rounded-[18px] p-6 mb-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-[18px] font-bold text-[#1C1917]">Longitudinal Insights</h3>
                            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest ml-auto">Beta</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {longitudinalInsights.map((insight, idx) => (
                                <div key={idx} className="flex gap-3 items-start bg-white p-4 rounded-lg border border-[#EEF2FF]">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                                    <p className="text-[14px] text-[#475569] leading-relaxed">
                                        {insight}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-[11px] text-[#94A3B8] italic">
                            * Insights are generated by comparing your latest results with up to 10 previous reports.
                        </p>
                    </div>
                )
            }

            {/* ── Engagement Nudge (Only if 1 report) ── */}
            {
                labResults.length === 1 && (
                    <div style={{
                        background: '#E0F2FE',
                        border: '1px solid #BAE6FD',
                        borderLeft: '4px solid #0EA5E9',
                        borderRadius: 14,
                        padding: '16px 20px',
                        marginBottom: 24,
                    }}>
                        <div>
                            <p style={{ color: '#0369A1', fontWeight: 600, fontSize: 15, margin: 0 }}>
                                Your AI gets smarter with every report
                            </p>
                            <p style={{ color: '#0284C7', fontSize: 13, margin: '4px 0 0 0' }}>
                                You have 1 report uploaded. Upload your next report after your upcoming blood test
                                and MedAssist will start showing you trends — like whether your hemoglobin is improving
                                or your vitamin D is responding to supplements.
                            </p>
                        </div>
                    </div>
                )
            }

            {/* ── Real Insights Feed ── */}
            {
                totalCount > 0 && (
                    <div className="mb-6">
                        <h3 className="text-[10px] font-semibold uppercase text-[#A8A29E] mb-4 tracking-wider text-center lg:text-left">PERSONALIZED INSIGHTS</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6">
                            <AIInsightsFeed analysis={{ summary: latestLabResult?.summary || "" }} />
                            <ActionItems biomarkers={biomarkers} />
                        </div>
                    </div>
                )
            }



            {/* ── Grouped Biomarkers (Core Data) ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h3 className="text-[10px] font-semibold uppercase text-[#A8A29E] tracking-wider">LATEST CLINICAL BIOMARKERS</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-[#A8A29E] uppercase tracking-tighter">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Optimal: {optimalCount}</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" />Monitor: {warningCount}</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500" />Action: {criticalCount}</span>
                </div>
            </div>

            {biomarkers.length === 0 ? (
                <div className="bg-[#F5F4EF] border border-[#E8E6DF] rounded-[14px] py-12 px-8 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-[#E8E6DF] rounded-full flex items-center justify-center mb-6">
                        <ClipboardList className="w-8 h-8 text-[#A8A29E]" />
                    </div>
                    <h3 className="text-[20px] font-semibold text-[#1C1917] mb-3 font-display">No lab results yet</h3>
                    <p className="text-[15px] text-[#57534E] max-w-md mx-auto mb-6 leading-relaxed">
                        Upload your first lab report to see your health overview.
                    </p>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="text-white rounded-[10px] px-6 py-3 font-medium bg-sky-500 hover:bg-sky-600 transition-colors"
                        style={{ WebkitAppearance: 'none' }}
                    >
                        Upload your first report
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {['hematology', 'metabolic', 'inflammation', 'vitamins', 'other'].map(cat => {
                        // Category fallback logic: anything not in the first 4 goes to 'other'
                        const catBiomarkers = latestBiomarkers.filter(b => {
                            const bCat = b.category?.toLowerCase() || 'other';
                            if (cat === 'other') {
                                return !['hematology', 'metabolic', 'inflammation', 'vitamins'].includes(bCat);
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
                                    {catBiomarkers.map((b) => {
                                        const prev = displayBiomarkers.find(pb =>
                                            pb.name === b.name &&
                                            pb.lab_result_id !== latestLabResult?.id
                                        );
                                        const delta = getDelta(parseFloat(String(b.value)), prev?.value !== undefined ? parseFloat(String(prev.value)) : undefined);

                                        return (
                                            <div
                                                key={b.id}
                                                className="bg-white border border-[#E8E6DF] rounded-[14px] p-4 flex flex-col gap-3 transition-all hover:border-sky-200 cursor-pointer group shadow-sm relative overflow-hidden min-h-[120px]"
                                                onClick={() => handleBiomarkerClick(b)}
                                                onTouchStart={(e) => {
                                                    const el = e.currentTarget;
                                                    // Prevent double-activation if hover is also active
                                                    if (el.classList.contains('active-tooltip')) return;
                                                    el.classList.add('active-tooltip');
                                                    setTimeout(() => el.classList.remove('active-tooltip'), 3000);
                                                }}
                                            >
                                                {/* Plain English Tooltip - Safari prefix added via utility class for safety */}
                                                <div
                                                    className="absolute inset-0 bg-sky-500/95 opacity-0 group-hover:opacity-100 group-[.active-tooltip]:opacity-100 transition-all duration-200 flex items-center justify-center p-4 text-center z-20 pointer-events-none backdrop-blur-sm transform-gpu gpu-accelerate"
                                                    style={{
                                                        WebkitTransition: "all 0.2s ease-out"
                                                    }}
                                                >
                                                    <p className="text-white text-[11px] font-medium leading-relaxed">
                                                        {BIOMARKER_DEFINITIONS[b.name] || 'Clinical biomarker used to assess specific metabolic or systemic health functions.'}
                                                    </p>
                                                </div>

                                                <div className="flex justify-between items-start">
                                                    <div className={`flex items-center gap-2 px-2 py-0.5 rounded-full text-[10px] font-bold border ${b.status === 'optimal' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        b.status === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                            'bg-red-50 text-red-700 border-red-100'
                                                        }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${b.status === 'optimal' ? 'bg-emerald-500' :
                                                            b.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                                                            }`} />
                                                        {b.status.toUpperCase()}
                                                    </div>
                                                    <div className="text-right" style={{ marginLeft: 'auto' }}>
                                                        <div className="text-[15px] font-bold text-[#1C1917]">{b.value} <span className="text-[10px] font-normal text-gray-500">{b.unit}</span></div>
                                                        {delta ? (
                                                            <div className={`text-[10px] font-bold flex items-center justify-end gap-1 ${delta.diff > 0 ? (b.status === 'optimal' ? 'text-emerald-600' : 'text-red-600') : (b.status === 'optimal' ? 'text-red-600' : 'text-emerald-600')}`}>
                                                                {delta.diff > 0 ? (
                                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 2 }}><path d="m18 15-6-6-6 6" /></svg>
                                                                ) : (
                                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 2 }}><path d="m6 9 6 6 6-6" /></svg>
                                                                )}
                                                                {Math.abs(delta.percent)}% from last
                                                            </div>
                                                        ) : (
                                                            <div className="text-[9px] font-bold text-[#A8A29E] uppercase tracking-tighter">No previous data</div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grow shrink basis-0 flex flex-col">
                                                    <span className="text-[15px] font-bold text-[#1C1917] block mb-1">{b.name}</span>
                                                    <p className="text-[11px] text-[#A8A29E] line-clamp-2 leading-relaxed italic mb-auto">
                                                        {b.ai_interpretation || 'Clinical data point extracted from report.'}
                                                    </p>

                                                    {b.reference_range_min !== undefined && b.reference_range_min !== null &&
                                                        b.reference_range_max !== undefined && b.reference_range_max !== null &&
                                                        b.reference_range_max > b.reference_range_min && (
                                                            <div className="mt-3">
                                                                <div className="flex justify-between text-[10px] text-[#A8A29E] font-medium mb-1">
                                                                    <span>{b.reference_range_min}</span>
                                                                    <span>{b.reference_range_max} {b.unit}</span>
                                                                </div>
                                                                <div className="h-1.5 w-full bg-[#E8E6DF] rounded-full relative overflow-hidden">
                                                                    <div
                                                                        className={`absolute top-0 bottom-0 left-0 rounded-full ${b.status === 'optimal' ? 'bg-emerald-500' :
                                                                            b.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                                                                            }`}
                                                                        style={{
                                                                            width: `${Math.max(0, Math.min(100, ((Number(b.value) - b.reference_range_min) / (b.reference_range_max - b.reference_range_min)) * 100))}%`,
                                                                            minWidth: '4px'
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Medicine Cabinet (Supplementary Care) ── */}
            {
                totalCount > 0 && (
                    <div className="mb-12">
                        <h3 className="text-[10px] font-semibold uppercase text-[#A8A29E] mb-4 tracking-wider">SUPPLEMENTARY CARE</h3>
                        <div className="max-w-xl">
                            <MedicineCabinet />
                        </div>
                    </div>
                )
            }

            <UploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onSuccess={() => router.refresh()}
            />

            <BiomarkerDetailSheet
                isOpen={showDetailSheet}
                onClose={() => setShowDetailSheet(false)}
                biomarker={selectedBiomarkerData}
                history={displayBiomarkers}
            />

            {/* ── Score Methodology Modal ── */}
            <AnimatePresence>
                {showScoreModal && (
                    <motion.div
                        initial={{ opacity: 0.01 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0.01 }}
                        onClick={() => setShowScoreModal(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transform-gpu z-[100] flex items-center justify-center p-4 gpu-accelerate"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full -mr-16 -mt-16 opacity-50" />

                            <h3 className="text-2xl font-bold text-[#1C1917] mb-4 relative">Score Breakdown</h3>
                            <p className="text-sm text-[#57534E] mb-6 relative">
                                Your health score is calculated based on these clinical categories and their respective importance to overall wellness.
                            </p>

                            <div className="space-y-3 mb-8 relative">
                                {[
                                    { name: 'Hematology', weight: 10 },
                                    { name: 'Metabolic', weight: 15 },
                                    { name: 'Inflammation', weight: 10 },
                                    { name: 'Vitamins', weight: 5 }
                                ].map(cat => {
                                    const catMarkers = latestBiomarkers.filter(b => b.category?.toLowerCase() === cat.name.toLowerCase());
                                    const optimalInCat = catMarkers.filter(b => b.status === 'optimal').length;
                                    const totalInCat = catMarkers.length;

                                    return (
                                        <div key={cat.name} className="flex flex-col gap-2 p-3 bg-white border border-[#E8E6DF] rounded-xl">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-[#44403C] uppercase">{cat.name}</span>
                                                <span className="text-[10px] font-bold text-sky-600">WEIGHT: {cat.weight}</span>
                                            </div>
                                            {totalInCat > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="grow h-1.5 bg-[#F5F4EF] rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-500 rounded-full"
                                                            style={{ width: `${(optimalInCat / totalInCat) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-emerald-600">{optimalInCat}/{totalInCat} OPT</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-[#A8A29E] italic">Data not present in latest report</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-4 bg-[#F5F4EF] rounded-xl border border-[#E8E6DF] mb-6">
                                <p className="text-[11px] leading-relaxed text-[#57534E]">
                                    <strong>The Optimism Rule:</strong> If your report contains at least one Optimal biomarker, your score cannot fall below 50. This prevents minor deviations from being demoralizing.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowScoreModal(false)}
                                className="w-full py-3 bg-[#1C1917] text-white rounded-xl font-bold hover:bg-black transition-all"
                                style={{ WebkitAppearance: 'none' }}
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Mandatory Medical Disclaimer Footer ── */}
            <div className="mt-12 py-8 border-t border-[#E8E6DF] text-center">
                <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-full">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-[13px] text-[#78716C] leading-relaxed">
                        <strong className="text-[#44403C]">Medical Disclaimer:</strong> MedAssist is an educational tool and does not provide medical diagnoses, treatment advice, or prescriptions. All information provided by the AI is for informational purposes only. Always consult with a qualified healthcare professional before making any health decisions or changes to your medical regimen.
                    </p>
                    <p className="text-[11px] text-[#A8A29E]">
                        &copy; {new Date().getFullYear()} MedAssist. All rights reserved.
                    </p>
                </div>
            </div>
        </div >
    )
}
