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
    TrendingUp,
    TrendingDown,
    MessageSquareText,
} from 'lucide-react'

import { MedicalDisclaimer } from '@/components/medical-disclaimer'
import { UploadModal } from '@/components/upload-modal'
import { BiomarkerDetailSheet } from '@/components/dashboard/BiomarkerDetailSheet'
import { AIInsightsFeed } from '@/components/dashboard/ai-insights-feed'
import { ActionItems } from '@/components/dashboard/action-items'
import { PriorityAlertCard } from '@/components/dashboard/priority-alert-card'
import { TrendSnapshot } from '@/components/dashboard/trend-snapshot'
import { HealthScoreOverview } from '@/components/dashboard/health-score-overview'
import { DoctorQuestions } from '@/components/dashboard/doctor-questions'
import { MedicineCabinet } from '@/components/dashboard/medicine-cabinet'
import { BiomarkerGrid } from '@/components/dashboard/biomarker-grid'
import { CarePlanSection } from '@/components/dashboard/care-plan-section'
import { LongitudinalInsightsSection } from '@/components/dashboard/longitudinal-insights-section'
import { DoctorVisitPrep } from '@/components/dashboard/doctor-visit-prep'
import { InsightCard } from '@/components/ui/insight-card'
import { StatusSummary } from '@/components/ui/status-summary'
import { ActionItem as PlanActionItem } from '@/components/ui/action-item'
import { TrustCallout } from '@/components/ui/trust-callout'

import { useStore } from '@/store/useStore'
import { Biomarker, Profile, LabResult } from '@/types/medical'
import { labResultSummary, latestUniqueBiomarkers, decryptRawAiJson } from '@/lib/medical-data'
import { computeBriefCompleteness, PATIENT_STATUS } from '@/lib/patient-status'
import { TrustLayer } from '@/components/trust-layer'
import { generateCarePlanItems, getTopTrendChanges, getVisitFocus } from '@/lib/health-companion'

// ── Helpers ──────────────────────────────────────────────────────────────

function getDelta(current: number | string, previous: number | string | null | undefined) {
    if (previous === null || previous === undefined) return null;
    const curr = parseFloat(String(current));
    const prev = parseFloat(String(previous));
    if (isNaN(curr) || isNaN(prev) || prev === 0) return null;
    const diff = curr - prev;
    const percent = Math.round((diff / prev) * 100);
    return { diff, percent };
}

// ── Longitudinal Comparison Card ─────────────────────────────────────────

function LongitudinalComparisonCard({
    latestBiomarkers,
    previousBiomarkers,
    reportDate,
    previousReportDate,
}: {
    latestBiomarkers: Biomarker[];
    previousBiomarkers: Biomarker[];
    reportDate: string;
    previousReportDate: string;
}) {
    type Change = { name: string; currentValue: string; previousValue: string; unit: string; percent: number; status: string };

    const changes = latestBiomarkers
        .map(curr => {
            const prev = previousBiomarkers.find(p => p.name === curr.name);
            if (!prev) return null;
            const delta = getDelta(curr.value, prev.value);
            if (!delta || Math.abs(delta.percent) < 5) return null;
            return {
                name: curr.name,
                currentValue: String(curr.value),
                previousValue: String(prev.value),
                unit: curr.unit,
                percent: delta.percent,
                status: curr.status,
            } as Change;
        })
        .filter((c): c is Change => c !== null);

    if (changes.length === 0) return null;

    const topChanges = changes
        .sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent))
        .slice(0, 3);

    return (
        <div className="bg-white border border-[#E8E6DF] rounded-[18px] p-6 mb-6">
            <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h3 className="text-[18px] font-bold text-[#1C1917]">Progress Report</h3>
                    <p className="text-[12px] text-[#78716C] mt-0.5 break-words">
                        Changes from{' '}
                        {new Date(previousReportDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        {' '}to{' '}
                        {new Date(reportDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                </div>
                <span className="bg-sky-50 text-sky-600 px-3 py-1 rounded-full text-[12px] font-semibold self-start shrink-0">
                    {changes.length} significant changes
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {topChanges.map((change, idx) => {
                    const isGood = change.status === 'optimal';
                    const color = isGood ? '#059669' : '#DC2626';
                    return (
                        <div key={idx} className="bg-[#FAF9F6] border border-[#E8E6DF] rounded-[12px] p-4 min-w-0">
                            <div className="flex justify-between items-start gap-2 mb-2 min-w-0">
                                <span className="text-[14px] font-bold text-[#44403C] break-words min-w-0">{change.name}</span>
                                <span className="text-[12px] font-bold flex items-center gap-1 shrink-0" style={{ color }}>
                                    {change.percent > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    {Math.abs(change.percent)}%
                                </span>
                            </div>
                            <div className="flex items-baseline gap-1 min-w-0">
                                <span className="text-[20px] font-extrabold text-[#1C1917] break-words min-w-0">{change.currentValue}</span>
                                <span className="text-[12px] text-[#78716C] break-words min-w-0">{change.unit}</span>
                            </div>
                            <p className="text-[11px] text-[#78716C] mt-1">Was {change.previousValue} {change.unit}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Empty State (no reports) ──────────────────────────────────────────────

function EmptyDashboard({ onUpload, onDemo }: { onUpload: () => void; onDemo: () => void }) {
    return (
        <div className="bg-[#F5F4EF] border border-[#E8E6DF] rounded-[18px] px-8 py-12 text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[#E0F2FE] flex items-center justify-center mx-auto mb-4">
                <FileText size={24} color="#0EA5E9" />
            </div>
            <h2 className="font-display text-[28px] text-[#1C1917] mb-3">Ready when you are</h2>
            <p className="text-[15px] text-[#57534E] max-w-sm mx-auto mb-6 leading-relaxed">
                Upload your first lab report and MedAssist will turn it into an appointment-ready brief: key results, trends, and questions to bring to your doctor.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                    onClick={onUpload}
                    className="bg-sky-500 hover:bg-sky-600 text-white rounded-[10px] px-6 py-3 font-semibold text-[15px] transition-colors min-h-[44px]"
                    style={{ WebkitAppearance: 'none' }}
                >
                    Upload my first report
                </button>
                <button
                    onClick={onDemo}
                    className="flex items-center gap-2 justify-center px-5 py-3 rounded-[10px] border-2 border-sky-500 text-sky-600 font-semibold text-[15px] hover:bg-sky-50 transition-colors min-h-[44px]"
                    style={{ WebkitAppearance: 'none' }}
                >
                    <PlayCircle size={18} />
                    Try with sample lab report
                </button>
            </div>
            <p className="text-[12px] text-[#78716C] mt-3">
                Supports digital PDF lab reports · Prep sheet generated in under a minute
            </p>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────

export default function DashboardClient({
    initialProfile,
    initialBiomarkers,
    initialSymptoms,
    initialLabResults,
}: {
    initialProfile: Profile | null;
    initialBiomarkers: Biomarker[];
    initialSymptoms: string[];
    initialLabResults: LabResult[];
}) {
    const router = useRouter();

    const [mounted, setMounted] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedBiomarkerData, setSelectedBiomarkerData] = useState<Biomarker | null>(null);
    const [showDetailSheet, setShowDetailSheet] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const demoMode = useStore(s => s.demoMode);
    const setDemoMode = useStore(s => s.setDemoMode);
    const getDemoLabResults = useStore(s => s.getDemoLabResults);
    const getDemoBiomarkers = useStore(s => s.getDemoBiomarkers);
    const [demoLabResults, setDemoLabResults] = useState<LabResult[]>([]);
    const [demoBiomarkers, setDemoBiomarkers] = useState<Biomarker[]>([]);
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [supplements, setSupplements] = useState<Record<string, unknown>[]>([]);

    const profile = initialProfile;
    const labResults = initialLabResults;

    // ── Effects ────────────────────────────────────────────────────────────

    useEffect(() => {
        setMounted(true);
        const fetchSupps = async () => {
            try {
                const res = await fetch('/api/supplements');
                const data = await res.json();
                if (data.supplements) setSupplements(data.supplements);
            } catch (err) {
                logger.error('Failed to fetch supplements', err);
            }
        };
        fetchSupps();
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('openUpload') === '1') {
            setShowUploadModal(true);
            router.replace('/dashboard', { scroll: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadDemoData = async () => {
            if (!demoMode) return;

            const [nextLabResults, nextBiomarkers] = await Promise.all([
                getDemoLabResults(),
                getDemoBiomarkers(),
            ]);

            if (!cancelled) {
                setDemoLabResults(nextLabResults as LabResult[]);
                setDemoBiomarkers(nextBiomarkers);
            }
        };

        loadDemoData();

        return () => {
            cancelled = true;
        };
    }, [demoMode, getDemoLabResults, getDemoBiomarkers]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        setIsOffline(!navigator.onLine);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // ── Derived Data ───────────────────────────────────────────────────────

    const displayLabResults = useMemo(
        () => (demoMode ? demoLabResults : initialLabResults),
        [demoMode, demoLabResults, initialLabResults]
    );

    const displayBiomarkers = useMemo(
        () => (demoMode ? demoBiomarkers : initialBiomarkers),
        [demoMode, demoBiomarkers, initialBiomarkers]
    );

    // Latest entry per biomarker name
    const latestBiomarkers = useMemo(
        () => latestUniqueBiomarkers(displayBiomarkers),
        [displayBiomarkers]
    );

    const latestLabResult = displayLabResults[0];
    const latestSummary = labResultSummary(latestLabResult);

    const decryptedJson = decryptRawAiJson(latestLabResult?.raw_ai_json);
    const longitudinalInsights: string[] =
        (decryptedJson as { longitudinalInsights?: string[] })?.longitudinalInsights ?? [];

    const symptomConnections = latestLabResult?.symptom_connections ?? [];

    // Status counts
    const optimalCount = latestBiomarkers.filter(b => b.status === 'optimal').length;
    const warningCount = latestBiomarkers.filter(b => b.status === 'warning').length;
    const criticalCount = latestBiomarkers.filter(b => b.status === 'critical').length;
    const totalCount = latestBiomarkers.length;

    const briefCompleteness = computeBriefCompleteness({
        biomarkerCount: totalCount,
        reportCount: displayLabResults.length,
        symptomCount: initialSymptoms.length,
        medicationContextCount: supplements.length,
    });

    const lastUpdated = displayLabResults[0]?.uploaded_at
        ? new Date(displayLabResults[0].uploaded_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
          })
        : null;

    const visitFocus = getVisitFocus(latestBiomarkers);
    const topTrendChanges = getTopTrendChanges(latestBiomarkers, displayBiomarkers, latestLabResult?.id);
    const generatedPlanItems = generateCarePlanItems({
        biomarkers: latestBiomarkers,
        reportCount: displayLabResults.length,
        symptomCount: initialSymptoms.length,
    }).slice(0, 3);

    const handleBiomarkerClick = (b: Biomarker) => {
        setSelectedBiomarkerData(b);
        setShowDetailSheet(true);
    };

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="app-page" id="dashboard-content">
            <div className="app-container">

            {/* Print header */}
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

            {/* Header row */}
            <div className="app-header min-w-0">
                <div className="hidden lg:block">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="app-title text-wrap-safe">Visit Prep Dashboard</h1>
                        {isOffline && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[10px] font-bold animate-pulse">
                                <WifiOff size={12} />
                                OFFLINE MODE
                            </div>
                        )}
                    </div>
                    {lastUpdated ? (
                        <p className="app-subtitle">Last report: {lastUpdated}</p>
                    ) : (
                        <p className="app-subtitle">
                            {initialLabResults.length > 0 ? 'Welcome back, ' : 'Welcome, '}
                            {profile?.first_name || 'Patient'}
                        </p>
                    )}
                </div>
                <div className="lg:hidden flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 min-w-0">
                        {profile?.first_name && (
                            <h1 className="text-[16px] font-bold text-[#1C1917] truncate">
                                Welcome, {profile.first_name}
                            </h1>
                        )}
                    </div>
                    {lastUpdated && (
                        <p className="text-[11px] sm:text-[12px] font-bold text-[#78716C] uppercase tracking-wider ml-auto text-right leading-tight">Report: {lastUpdated}</p>
                    )}
                    {isOffline && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[10px] font-bold animate-pulse ml-2">
                            <WifiOff size={12} />
                            OFFLINE
                        </div>
                    )}
                </div>
                <div className="app-actions shrink-0 print:hidden sm:justify-end">
                    <button
                        onClick={() => window.print()}
                        className="btn btn-secondary btn-icon"
                        title="Print Report"
                        style={{ WebkitAppearance: 'none' }}
                    >
                        <Printer className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="btn btn-primary"
                        style={{ WebkitAppearance: 'none' }}
                    >
                        <Upload size={16} />
                        <span className="hidden sm:inline">Upload Report</span>
                        <span className="sm:hidden">Upload</span>
                    </button>
                </div>
            </div>

            {/* Informational banners */}
            {totalCount > 0 && (
                <div className="flex flex-col xl:flex-row gap-4 mb-8">
                    {(criticalCount > 0 || warningCount > 0) && (
                        <div className="grow shrink basis-0 bg-white border border-[#E8E6DF] rounded-[18px] p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-sm min-w-0">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${criticalCount > 0 ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                                    <Activity size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-[#1C1917] text-wrap-safe">Appointment Focus</h3>
                                    <p className="text-xs text-[#57534E] text-wrap-safe">
                                        {criticalCount > 0
                                            ? `${criticalCount} ${PATIENT_STATUS.critical.label.toLowerCase()} marker${criticalCount === 1 ? '' : 's'} to review with your clinician`
                                            : `${warningCount} marker${warningCount === 1 ? '' : 's'} to discuss or monitor`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 sm:ml-auto flex-wrap">
                                {[
                                    { count: optimalCount, label: 'In range', bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700' },
                                    { count: warningCount, label: 'Discuss', bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700' },
                                    { count: criticalCount, label: 'Soon', bg: 'bg-red-50 border-red-100', text: 'text-red-700' },
                                ].map(s => (
                                    <div key={s.label} className={`text-center px-3 py-1 ${s.bg} rounded-lg border min-w-[58px]`}>
                                        <span className={`block text-xs font-bold ${s.text}`}>{s.count}</span>
                                        <span className={`text-[10px] ${s.text} uppercase font-semibold`}>{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {latestLabResult && !demoMode && initialLabResults.length > 0 && (
                        <div className="grow shrink basis-0 bg-white border border-[#E8E6DF] rounded-[18px] p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-sm min-w-0">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center">
                                    <ClipboardList size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-[#1C1917] font-sans text-wrap-safe">Visit Context</h3>
                                    <p className="text-xs text-[#57534E] text-wrap-safe">
                                        Last test was{' '}
                                        {Math.floor(
                                            (Date.now() - new Date(latestLabResult.uploaded_at ?? latestLabResult.created_at ?? 0).getTime()) /
                                                86_400_000
                                        )}{' '}
                                        days ago
                                    </p>
                                </div>
                            </div>
                            <div className="sm:ml-auto shrink-0 flex items-center">
                                {Math.floor(
                                    (Date.now() - new Date(latestLabResult.uploaded_at ?? latestLabResult.created_at ?? 0).getTime()) /
                                        86_400_000
                                ) > 90 ? (
                                    <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-[10px] font-bold">DUE FOR NEW TEST</span>
                                ) : (
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-bold">UP TO DATE</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Demo mode banner */}
            {demoMode && (
                <div className="mb-6 flex flex-col gap-3 rounded-[12px] border-2 border-amber-300 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
                    <p className="text-sm font-semibold text-amber-900">
                        You&apos;re viewing <strong>sample data</strong> — not your personal results.
                    </p>
                    <button
                        onClick={() => setDemoMode(false)}
                        className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 active:scale-95 transition-colors min-h-[44px]"
                        style={{ WebkitAppearance: 'none' }}
                    >
                        Show my data
                    </button>
                </div>
            )}

            {totalCount > 0 && (
                <section className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.8fr)] print:hidden">
                    <div className="app-panel p-5 sm:p-6">
                        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-600">Today</p>
                                <h2 className="mt-1 font-display text-[30px] leading-tight text-[#1C1917] sm:text-[34px]">
                                    {visitFocus.title}
                                </h2>
                                <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[#57534E] text-wrap-safe">
                                    {visitFocus.detail}
                                </p>
                            </div>
                            <div className="w-full lg:w-[18rem]">
                                <StatusSummary optimal={optimalCount} warning={warningCount} critical={criticalCount} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <InsightCard
                                tone={criticalCount > 0 ? 'critical' : warningCount > 0 ? 'warning' : 'success'}
                                eyebrow="Visit focus"
                                title={criticalCount > 0 ? 'Review soon' : warningCount > 0 ? 'Discuss at visit' : 'Routine review'}
                                description={criticalCount > 0
                                    ? `${criticalCount} result${criticalCount === 1 ? '' : 's'} should be reviewed with a qualified clinician.`
                                    : warningCount > 0
                                        ? `${warningCount} result${warningCount === 1 ? '' : 's'} may be worth discussing.`
                                        : 'No current values are marked for discussion.'}
                                action="Open plan"
                                onClick={() => router.push('/plan')}
                            />
                            <InsightCard
                                tone="info"
                                eyebrow="Doctor prep"
                                title="One-page prep pack"
                                description="Keep your top discussion points, questions, actions, and key labs in one place."
                                action="Build pack"
                                onClick={() => router.push('/plan')}
                            />
                            <InsightCard
                                tone="neutral"
                                eyebrow="Health record"
                                title={displayLabResults.length > 1 ? `${displayLabResults.length} reports tracked` : 'Build your baseline'}
                                description={displayLabResults.length > 1
                                    ? 'Trend-aware context is available for your latest report.'
                                    : 'Upload your next report to unlock clearer trend comparisons.'}
                                action="View labs"
                                onClick={() => router.push('/results')}
                            />
                        </div>
                    </div>

                    <div className="flex min-w-0 flex-col gap-5">
                        <div className="app-panel p-5">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#78716C]">What changed</p>
                                    <h2 className="text-lg font-bold text-[#1C1917]">Top trends</h2>
                                </div>
                                <button
                                    onClick={() => router.push('/results')}
                                    className="text-xs font-bold text-sky-600 hover:text-sky-700"
                                >
                                    Labs
                                </button>
                            </div>
                            {topTrendChanges.length ? (
                                <div className="space-y-3">
                                    {topTrendChanges.map((change) => (
                                        <InsightCard
                                            key={change.biomarker.id}
                                            title={change.title}
                                            description={change.detail}
                                            tone={change.biomarker.status === 'critical' ? 'critical' : change.biomarker.status === 'warning' ? 'warning' : 'success'}
                                            onClick={() => handleBiomarkerClick(change.biomarker)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm leading-relaxed text-[#57534E]">
                                    Upload another report to compare changes over time.
                                </p>
                            )}
                        </div>

                        <div className="app-panel p-5">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#78716C]">Next actions</p>
                                    <h2 className="text-lg font-bold text-[#1C1917]">Plan preview</h2>
                                </div>
                                <button
                                    onClick={() => router.push('/plan')}
                                    className="text-xs font-bold text-sky-600 hover:text-sky-700"
                                >
                                    Open plan
                                </button>
                            </div>
                            <div className="space-y-3">
                                {generatedPlanItems.map((item) => (
                                    <PlanActionItem
                                        key={item.id}
                                        title={item.title}
                                        reason={item.reason}
                                        kind={item.kind}
                                        status={item.status}
                                        timeframe={item.timeframe}
                                        related={item.related_biomarkers}
                                    />
                                ))}
                            </div>
                        </div>
                        <TrustCallout />
                    </div>
                </section>
            )}

            {/* ── Main dashboard content ── */}
            {totalCount === 0 ? (
                <EmptyDashboard
                    onUpload={() => setShowUploadModal(true)}
                    onDemo={() => setDemoMode(true)}
                />
            ) : (
                <div className="app-section-grid mb-6">

                    {/* ── LEFT: Main clinical column ── */}
                    <div className="flex flex-col gap-6 min-w-0">
                        <MedicalDisclaimer variant="compact" className="mb-2" />
                        <DoctorVisitPrep biomarkers={displayBiomarkers} demoMode={demoMode} />
                        <PriorityAlertCard biomarkers={latestBiomarkers} />

                        {/* Symptom connections */}
                        {symptomConnections.length > 0 && (
                            <div className="bg-[#FFF7ED] border border-[#FED7AA] border-l-4 border-l-amber-400 rounded-[14px] p-6">
                                <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider mb-4">
                                    Your symptoms may be connected to these results
                                </p>
                                {symptomConnections.map(conn => (
                                    <div key={conn.symptom} className="mb-4 pb-4 border-b border-amber-200 last:border-0 last:mb-0 last:pb-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className="bg-amber-400 text-white rounded-md px-2.5 py-0.5 text-[12px] font-semibold">{conn.symptom}</span>
                                            <span className="text-[12px] text-[#78716C]">may be related to</span>
                                            {conn.relatedBiomarkers?.map(b => (
                                                <span key={b} className="bg-[#F5F4EF] border border-[#E8E6DF] rounded-md px-2 py-0.5 text-[12px] text-[#57534E]">{b}</span>
                                            ))}
                                        </div>
                                        <p className="text-[13px] text-[#57534E] leading-relaxed">{conn.explanation}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Symptom empty state nudge */}
                        {!demoMode && initialSymptoms.length === 0 && totalCount > 0 && (
                            <div className="bg-[#FFFBEB] border border-[#FDE68A] border-l-4 border-l-amber-400 rounded-[10px] px-4 py-3 flex justify-between items-center gap-3">
                                <p className="text-[14px] text-[#57534E]">
                                    Add your symptoms to get more personalised insights.
                                </p>
                                <a href="/profile" className="text-[13px] text-sky-500 font-semibold whitespace-nowrap shrink-0">
                                    Add symptoms →
                                </a>
                            </div>
                        )}

                        {/* Longitudinal comparison (2+ reports) */}
                        {displayLabResults.length >= 2 && (
                            <LongitudinalComparisonCard
                                latestBiomarkers={latestBiomarkers}
                                previousBiomarkers={displayBiomarkers.filter(b => b.lab_result_id === displayLabResults[1].id)}
                                reportDate={displayLabResults[0].uploaded_at || displayLabResults[0].created_at || ''}
                                previousReportDate={displayLabResults[1].uploaded_at || displayLabResults[1].created_at || ''}
                            />
                        )}

                        {/* Score + Trends */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 md:gap-6">
                            <HealthScoreOverview
                                score={briefCompleteness}
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

                        {/* AI Insights */}
                        <div>
                            <h3 className="text-[10px] font-semibold uppercase text-[#78716C] mb-4 tracking-wider">APPOINTMENT CONTEXT</h3>
                            <AIInsightsFeed analysis={{ summary: latestSummary }} />
                        </div>

                        {/* Biomarker Grid */}
                        <BiomarkerGrid
                            latestBiomarkers={latestBiomarkers}
                            displayBiomarkers={displayBiomarkers}
                            latestLabResultId={latestLabResult?.id}
                            optimalCount={optimalCount}
                            warningCount={warningCount}
                            criticalCount={criticalCount}
                            onBiomarkerClick={handleBiomarkerClick}
                            onUploadClick={() => setShowUploadModal(true)}
                        />

                        {/* Single-report nudge */}
                        {!demoMode && labResults.length === 1 && (
                            <div className="bg-[#E0F2FE] border border-[#BAE6FD] border-l-4 border-l-sky-400 rounded-[14px] px-5 py-4">
                                <p className="font-semibold text-[#0369A1] text-[15px]">Your prep sheet gets sharper with every report</p>
                                <p className="text-[#0284C7] text-[13px] mt-1 leading-relaxed">
                                    Upload your next report after your upcoming blood test and MedAssist
                                    will turn it into trend-aware questions — like whether your hemoglobin is improving.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: Action & care column ── */}
                    <div className="flex flex-col gap-6 min-w-0">
                        <CarePlanSection latestBiomarkers={latestBiomarkers} />
                        <ActionItems biomarkers={latestBiomarkers} />
                        <DoctorQuestions biomarkers={latestBiomarkers} />
                        <LongitudinalInsightsSection insights={longitudinalInsights} />
                        <div className="bg-white border border-[#E8E6DF] rounded-[18px] p-5 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-[12px] bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                                    <MessageSquareText className="w-5 h-5 text-sky-500" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-[16px] font-bold text-[#1C1917] leading-tight">Need to rehearse the visit?</h3>
                                    <p className="text-[13px] text-[#57534E] mt-1 leading-relaxed">
                                        Ask the prep assistant to turn your results into a 30-second doctor summary.
                                    </p>
                                    <button
                                        onClick={() => router.push('/assistant')}
                                        className="mt-3 min-h-[40px] rounded-[10px] bg-sky-500 px-4 py-2 text-[13px] font-semibold text-white hover:bg-sky-600 active:scale-95 transition-all"
                                    >
                                        Open prep assistant
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-semibold uppercase text-[#78716C] mb-4 tracking-wider">MEDICATION CONTEXT</h3>
                            <MedicineCabinet />
                        </div>
                        <TrustLayer variant="full" />
                    </div>

                </div>
            )}

            {/* ── Modals ── */}
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

            {/* Score Breakdown Modal */}
            <AnimatePresence>
                {showScoreModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowScoreModal(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 16 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 16 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full -mr-16 -mt-16 opacity-50" />
                            <h3 className="font-display text-2xl text-[#1C1917] mb-3 relative">Brief Completeness</h3>
                            <p className="text-sm text-[#57534E] mb-6 relative">
                                This score estimates how complete your appointment brief is, not how healthy you are.
                            </p>
                            <div className="space-y-3 mb-6 relative">
                                {[
                                    { name: 'Hematology', weight: 10 },
                                    { name: 'Metabolic', weight: 15 },
                                    { name: 'Inflammation', weight: 10 },
                                    { name: 'Vitamins', weight: 5 },
                                ].map(cat => {
                                    const catMarkers = latestBiomarkers.filter(b => b.category?.toLowerCase() === cat.name.toLowerCase());
                                    const optimalInCat = catMarkers.filter(b => b.status === 'optimal').length;
                                    const totalInCat = catMarkers.length;
                                    return (
                                        <div key={cat.name} className="flex flex-col gap-2 p-3 bg-[#F5F4EF] border border-[#E8E6DF] rounded-xl">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-[#44403C] uppercase">{cat.name}</span>
                
                                            </div>
                                            {totalInCat > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="grow h-1.5 bg-[#E8E6DF] rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-500 rounded-full"
                                                            style={{ width: `${(optimalInCat / totalInCat) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-emerald-600">{optimalInCat}/{totalInCat}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-[#78716C] italic">Not in latest report</span>
                                            )}
                                        </div>
                                    );
                                })}
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

            {/* Medical Disclaimer */}
            <div className="mt-12 py-8 border-t border-[#E8E6DF] text-center">
                <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-full">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-[13px] text-[#78716C] leading-relaxed">
                        <strong className="text-[#44403C]">Medical Disclaimer:</strong> MedAssist is an educational tool
                        and does not provide medical diagnoses, treatment advice, or prescriptions. Always consult with a
                        qualified healthcare professional before making any health decisions.
                    </p>
                    <p className="text-[11px] text-[#78716C]">
                        &copy; {new Date().getFullYear()} MedAssist. All rights reserved.
                    </p>
                </div>
            </div>
            </div>
        </div>
    );
}
