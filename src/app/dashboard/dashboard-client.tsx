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
import { BiomarkerGrid } from '@/components/dashboard/biomarker-grid'
import { CarePlanSection } from '@/components/dashboard/care-plan-section'
import { LongitudinalInsightsSection } from '@/components/dashboard/longitudinal-insights-section'

import { useStore } from '@/store/useStore'
import { Biomarker, Profile, LabResult } from '@/types/medical'
import { labResultSummary, latestUniqueBiomarkers } from '@/lib/medical-data'

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
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-[18px] font-bold text-[#1C1917]">Progress Report</h3>
                    <p className="text-[12px] text-[#A8A29E] mt-0.5">
                        Changes from{' '}
                        {new Date(previousReportDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        {' '}to{' '}
                        {new Date(reportDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                </div>
                <span className="bg-sky-50 text-sky-600 px-3 py-1 rounded-full text-[12px] font-semibold">
                    {changes.length} significant changes
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {topChanges.map((change, idx) => {
                    const isGood = change.status === 'optimal';
                    const color = isGood ? '#059669' : '#DC2626';
                    return (
                        <div key={idx} className="bg-[#FAF9F6] border border-[#E8E6DF] rounded-[12px] p-4">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[14px] font-bold text-[#44403C]">{change.name}</span>
                                <span className="text-[12px] font-bold flex items-center gap-1" style={{ color }}>
                                    {change.percent > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    {Math.abs(change.percent)}%
                                </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-[20px] font-extrabold text-[#1C1917]">{change.currentValue}</span>
                                <span className="text-[12px] text-[#A8A29E]">{change.unit}</span>
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
                Upload your first lab report and MedAssist will extract every biomarker, explain each value in plain English, and show you what needs attention.
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
            <p className="text-[12px] text-[#A8A29E] mt-3">
                Supports digital PDF lab reports · Takes 20–40 seconds
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
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [_supplements, setSupplements] = useState<Record<string, unknown>[]>([]);

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
        () => (demoMode ? [...getDemoLabResults(), ...initialLabResults] : initialLabResults),
        [demoMode, initialLabResults, getDemoLabResults]
    );

    const displayBiomarkers = useMemo(
        () => (demoMode ? [...getDemoBiomarkers(), ...initialBiomarkers] : initialBiomarkers),
        [demoMode, initialBiomarkers, getDemoBiomarkers]
    );

    // Cache to localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const key = demoMode ? 'demo' : 'real';
        if (displayLabResults.length > 0) {
            try {
                localStorage.setItem(`medassist_cached_${key}_lab_results`, JSON.stringify(displayLabResults));
                localStorage.setItem(`medassist_cached_${key}_biomarkers`, JSON.stringify(displayBiomarkers));
            } catch (_e) { /* storage full — non-critical */ }
        }
    }, [displayLabResults, displayBiomarkers, demoMode]);

    // Latest entry per biomarker name
    const latestBiomarkers = useMemo(
        () => latestUniqueBiomarkers(displayBiomarkers),
        [displayBiomarkers]
    );

    const latestLabResult = displayLabResults[0];
    const latestSummary = labResultSummary(latestLabResult);

    const longitudinalInsights: string[] =
        (latestLabResult?.raw_ai_json as { longitudinalInsights?: string[] })?.longitudinalInsights ?? [];

    const symptomConnections = latestLabResult?.symptom_connections ?? [];

    // Status counts
    const optimalCount = latestBiomarkers.filter(b => b.status === 'optimal').length;
    const warningCount = latestBiomarkers.filter(b => b.status === 'warning').length;
    const criticalCount = latestBiomarkers.filter(b => b.status === 'critical').length;
    const totalCount = latestBiomarkers.length;

    // Health score — from AI JSON or computed fallback
    let healthScore = 0;
    const rawJson = latestLabResult?.raw_ai_json as { healthScore?: number } | undefined;
    if (rawJson && typeof rawJson.healthScore === 'number') {
        healthScore = rawJson.healthScore;
    }
    if (healthScore === 0 && totalCount > 0) {
        const raw = (optimalCount * 100 + warningCount * 75 + criticalCount * 40) / totalCount;
        healthScore = Math.round(Math.max(optimalCount > 0 ? 50 : 30, raw));
    }

    const lastUpdated = displayLabResults[0]?.uploaded_at
        ? new Date(displayLabResults[0].uploaded_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
          })
        : null;

    const handleBiomarkerClick = (b: Biomarker) => {
        setSelectedBiomarkerData(b);
        setShowDetailSheet(true);
    };

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="min-h-[100dvh] bg-[#FAFAF7] px-3 py-4 md:p-6 text-[#1C1917] font-sans" id="dashboard-content">

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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                <div className="hidden lg:block">
                    <div className="flex items-center gap-3">
                        <h1 className="font-display text-[28px] md:text-[32px] text-[#1C1917]">Clinical Overview</h1>
                        {isOffline && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[10px] font-bold animate-pulse">
                                <WifiOff size={12} />
                                OFFLINE MODE
                            </div>
                        )}
                    </div>
                    {lastUpdated ? (
                        <p className="text-[13px] text-[#A8A29E] mt-1">Last report: {lastUpdated}</p>
                    ) : (
                        <p className="text-[14px] text-[#57534E] mt-1">
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
                        <p className="text-[11px] sm:text-[12px] font-bold text-[#A8A29E] uppercase tracking-wider ml-auto text-right leading-tight">Report: {lastUpdated}</p>
                    )}
                    {isOffline && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[10px] font-bold animate-pulse ml-2">
                            <WifiOff size={12} />
                            OFFLINE
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0 print:hidden">
                    <button
                        onClick={() => window.print()}
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

            {/* Informational banners */}
            {totalCount > 0 && (
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {(criticalCount > 0 || warningCount > 0) && (
                        <div className="grow shrink basis-0 bg-white border border-[#E8E6DF] rounded-[18px] p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${criticalCount > 0 ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                                    <Activity size={24} />
                                </div>
                                <div className="ml-3 sm:ml-4">
                                    <h3 className="text-sm font-bold text-[#1C1917]">Risk Level Summary</h3>
                                    <p className="text-xs text-[#57534E]">
                                        {criticalCount > 0
                                            ? `${criticalCount} urgent markers need attention`
                                            : `${warningCount} markers to monitor closely`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 sm:ml-auto">
                                {[
                                    { count: optimalCount, label: 'Opt', bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700' },
                                    { count: warningCount, label: 'Mon', bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700' },
                                    { count: criticalCount, label: 'Act', bg: 'bg-red-50 border-red-100', text: 'text-red-700' },
                                ].map(s => (
                                    <div key={s.label} className={`text-center px-3 py-1 ${s.bg} rounded-lg border`}>
                                        <span className={`block text-xs font-bold ${s.text}`}>{s.count}</span>
                                        <span className={`text-[10px] ${s.text} uppercase font-semibold`}>{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {latestLabResult && initialLabResults.length > 0 && (
                        <div className="grow shrink basis-0 bg-white border border-[#E8E6DF] rounded-[18px] p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center">
                                    <ClipboardList size={24} />
                                </div>
                                <div className="ml-3 sm:ml-4">
                                    <h3 className="text-sm font-bold text-[#1C1917]">Recency Tracking</h3>
                                    <p className="text-xs text-[#57534E]">
                                        Last test was{' '}
                                        {Math.floor(
                                            (Date.now() - new Date(latestLabResult.uploaded_at ?? latestLabResult.created_at ?? 0).getTime()) /
                                                86_400_000
                                        )}{' '}
                                        days ago
                                    </p>
                                </div>
                            </div>
                            <div className="sm:ml-auto">
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
                        className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-colors min-h-[44px]"
                        style={{ WebkitAppearance: 'none' }}
                    >
                        Show my data
                    </button>
                </div>
            )}

            {/* ── Main dashboard content ── */}
            {totalCount === 0 ? (
                <EmptyDashboard
                    onUpload={() => setShowUploadModal(true)}
                    onDemo={() => setDemoMode(true)}
                />
            ) : (
                <div className="flex flex-col xl:flex-row gap-6 mb-6">

                    {/* ── LEFT: Main clinical column ── */}
                    <div className="flex flex-col gap-6 xl:flex-[2]">
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
                                            <span className="text-[12px] text-[#A8A29E]">may be related to</span>
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
                        {initialSymptoms.length === 0 && totalCount > 0 && (
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
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
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

                        {/* AI Insights */}
                        <div>
                            <h3 className="text-[10px] font-semibold uppercase text-[#A8A29E] mb-4 tracking-wider">PERSONALIZED INSIGHTS</h3>
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
                                <p className="font-semibold text-[#0369A1] text-[15px]">Your AI gets smarter with every report</p>
                                <p className="text-[#0284C7] text-[13px] mt-1 leading-relaxed">
                                    Upload your next report after your upcoming blood test and MedAssist
                                    will start showing trends — like whether your hemoglobin is improving.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: Action & care column ── */}
                    <div className="flex flex-col gap-6 xl:flex-[1]">
                        <CarePlanSection latestBiomarkers={latestBiomarkers} />
                        <ActionItems biomarkers={latestBiomarkers} />
                        <DoctorQuestions biomarkers={latestBiomarkers} />
                        <LongitudinalInsightsSection insights={longitudinalInsights} />
                        <div>
                            <h3 className="text-[10px] font-semibold uppercase text-[#A8A29E] mb-4 tracking-wider">SUPPLEMENTARY CARE</h3>
                            <MedicineCabinet />
                        </div>
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
                            <h3 className="font-display text-2xl text-[#1C1917] mb-3 relative">Score Breakdown</h3>
                            <p className="text-sm text-[#57534E] mb-6 relative">
                                Your health score is weighted across clinical categories.
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
                                                <span className="text-[10px] font-bold text-sky-600">WEIGHT: {cat.weight}</span>
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
                                                <span className="text-[10px] text-[#A8A29E] italic">Not in latest report</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="p-4 bg-[#F5F4EF] rounded-xl border border-[#E8E6DF] mb-6">
                                <p className="text-[11px] text-[#57534E] leading-relaxed">
                                    <strong>The Optimism Rule:</strong> If your report has at least one optimal biomarker, your score cannot drop below 50.
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
                    <p className="text-[11px] text-[#A8A29E]">
                        &copy; {new Date().getFullYear()} MedAssist. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
