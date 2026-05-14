'use client'

import { useEffect, useState } from 'react'
import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X, ClipboardList, Search, TrendingUp, Info, Printer, ArrowRight, RefreshCw, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import { DoctorQuestions } from '@/components/dashboard/doctor-questions'
import { DoctorVisitPrep } from '@/components/dashboard/doctor-visit-prep'
import { TrustLayer } from '@/components/trust-layer'
import { Biomarker } from '@/types/medical'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { RangeBar } from '@/components/ui/range-bar'
import { BiomarkerDetailSheet } from '@/components/dashboard/BiomarkerDetailSheet'
import { useStore } from '@/store/useStore'
import { labResultSummary, latestUniqueBiomarkers, mergeBiomarkerSources } from '@/lib/medical-data'

const WellnessTrendChart = dynamic(
    () => import('@/components/charts/wellness-trend-chart').then(mod => mod.WellnessTrendChart),
    { ssr: false, loading: () => <div className="h-full w-full bg-slate-50 animate-pulse rounded-xl" /> }
)

const CATEGORIES = ['all', 'hematology', 'metabolic', 'lipids', 'thyroid', 'inflammation', 'vitamins', 'vitals', 'other']

function getBiomarkerReportDate(b: Biomarker) {
    const report = Array.isArray(b.lab_results) ? b.lab_results[0] : b.lab_results;
    return report?.uploaded_at || report?.created_at || b.created_at;
}

// ── Main UI Component ──────────────────────────────────────────────────────

export default function ResultsPage() {
    const router = useRouter()
    const demoMode = useStore(s => s.demoMode)
    const setDemoMode = useStore(s => s.setDemoMode)
    const getDemoLabResults = useStore(s => s.getDemoLabResults)
    const getDemoBiomarkers = useStore(s => s.getDemoBiomarkers)
    const [loading, setLoading] = useState(true)
    const [biomarkers, setBiomarkers] = useState<Biomarker[]>([])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [labResults, setLabResults] = useState<any[]>([])
    const [selectedReportId, setSelectedReportId] = useState<string>('all')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedBiomarker, setSelectedBiomarker] = useState<Biomarker | null>(null)
    const [searchQuery, setSearchValue] = useState('')
    const [biomarkerTrends, setBiomarkerTrends] = useState<{ date: string; score: number }[]>([])
    const [loadingTrends, setLoadingTrends] = useState(false)
    const [isDebugMode, setIsDebugMode] = useState(false)
    const [supplements, setSupplements] = useState<{ id: number, name: string, start_date: string }[]>([])
    const [mounted, setMounted] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)
    const [showDetailSheet, setShowDetailSheet] = useState(false)

    useEffect(() => {
        setMounted(true)
        try { setIsDebugMode(localStorage.getItem("medassist_debug_mode") === "true") } catch (_e) { }

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
    }, [])

    const handlePrint = () => {
        window.print();
    };

    useEffect(() => {
        if (selectedBiomarker) {
            const fetchTrends = async () => {
                setLoadingTrends(true)
                try {
                    const res = await fetch(`/api/biomarker-trends?name=${encodeURIComponent(selectedBiomarker.name)}`)
                    const data = await res.json()
                    if (data.trends) {
                        setBiomarkerTrends(data.trends.map((t: { date: string, value: number }) => ({
                            date: t.date,
                            score: t.value
                        })))
                    }
                } catch (err) {
                    logger.error("Failed to fetch trends", err)
                    toast.error("Failed to load trend data", {
                        description: "Could not retrieve historical data. Please try again.",
                        duration: 4000
                    })
                } finally {
                    setLoadingTrends(false)
                }
            }
            fetchTrends()
        }
    }, [selectedBiomarker])

    useEffect(() => {
        const fetchBiomarkers = async () => {
            setLoading(true)

            if (demoMode) {
                const [demoBiomarkers, demoLabResults] = await Promise.all([
                    getDemoBiomarkers(),
                    getDemoLabResults(),
                ])
                setBiomarkers(demoBiomarkers)
                setLabResults(demoLabResults)
                setLoading(false)
                return
            }

            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setLoading(false)
                router.push('/auth?mode=login')
                return
            }

            const biomarkerQuery = supabase
                .from('biomarkers')
                .select('*, lab_results!inner(user_id, uploaded_at, created_at)')
                .eq('lab_results.user_id', user.id)
                .order('created_at', { ascending: false })

            const { data: lrData } = await supabase
                .from('lab_results')
                .select('id, file_name, uploaded_at, created_at, raw_ai_json, plain_summary, health_score')
                .eq('user_id', user.id)
                .order('uploaded_at', { ascending: false })

            const { data } = await biomarkerQuery
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const realLabResults = (lrData as any[]) || []
            const realBiomarkers = mergeBiomarkerSources(data as Biomarker[] | null, realLabResults)
            setBiomarkers(realBiomarkers)
            setLabResults(realLabResults)
            setLoading(false)
        }
        fetchBiomarkers()
    }, [router, refreshKey, demoMode, getDemoBiomarkers, getDemoLabResults])

    // Derived counts for status summary
    const filteredBiomarkers = (selectedReportId === 'all'
        ? biomarkers
        : biomarkers.filter(b => b.lab_result_id?.toString() === selectedReportId)
    )
        .filter(b => selectedCategory === 'all' || (b.category || 'other').toLowerCase() === selectedCategory)
        .filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()))

    // Bug 7 fix: Deduplicate for status counts only (show most recent per biomarker name)
    // The full list (filteredBiomarkers) is still shown in the UI for historical context
    const deduplicatedForCounts = Array.from(
        filteredBiomarkers.reduce((acc, biomarker) => {
            const existing = acc.get(biomarker.name);
            if (!existing || new Date(biomarker.created_at || 0) > new Date(existing.created_at || 0)) {
                acc.set(biomarker.name, biomarker);
            }
            return acc;
        }, new Map<string, Biomarker>()).values()
    );
    const optimalCount = deduplicatedForCounts.filter(b => b.status === 'optimal').length
    const warningCount = deduplicatedForCounts.filter(b => b.status === 'warning').length
    const criticalCount = deduplicatedForCounts.filter(b => b.status === 'critical').length
    const questionBiomarkers = (selectedReportId === 'all'
        ? latestUniqueBiomarkers(biomarkers)
        : biomarkers.filter(b => b.lab_result_id?.toString() === selectedReportId)
    ).filter(b => selectedCategory === 'all' || (b.category || 'other').toLowerCase() === selectedCategory)

    const handleBiomarkerClick = (b: Biomarker) => {
        setSelectedBiomarker(b);
        if (window.innerWidth < 1024) {
            setShowDetailSheet(true);
        }
    };

    return (
        <ErrorBoundary>
            <div className="app-page">
                <div className="app-container">

                {/* ── Print-only Header ── */}
                <div className="hidden print:block mb-8">
                    <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold uppercase tracking-tight text-slate-900">MedAssist Analysis Report</h1>
                            <p className="text-sm font-medium mt-1 text-slate-600">Patient Lab Data Interpretation · Clinical Summary</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">DATE: {mounted ? new Date().toLocaleDateString() : ''}</p>
                            <p className="text-xs text-slate-500">Report ID: {selectedReportId}</p>
                        </div>
                    </div>

                    {/* Feature 9: Print-only Patient Info & "Bottom Line" */}
                    <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Clinical Interpretation</span>
                            <h2 className="text-xl font-bold text-slate-900 mt-1">
                                {labResultSummary(selectedReportId === 'all' ? labResults[0] : labResults.find(r => String(r.id) === selectedReportId)) || "No clinical summary available."}
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                            <div>
                                <p className="text-[10px] font-bold uppercase text-slate-500">Critical Findings</p>
                                <p className="text-sm font-medium">{criticalCount} Biomarkers flagged as critical</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase text-slate-500">Action Recommended</p>
                                <p className="text-sm font-medium">Review detailed biomarkers with primary care physician</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Demo Mode Banner */}
                {demoMode && (
                    <div className="mb-6 flex flex-col gap-3 rounded-[12px] border-2 border-amber-300 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-semibold text-amber-900">
                            You&apos;re viewing <strong>sample data</strong> — not your personal results.
                        </p>
                        <button
                            onClick={() => setDemoMode(false)}
                            className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 active:scale-95 transition-colors min-h-[44px]"
                        >
                            Show my data
                        </button>
                    </div>
                )}

                {/* ── Header ── */}
                <div className="app-header">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 w-full">
                        <div className="min-w-0 flex-1">
                            <h1 className="app-title text-wrap-safe">Lab Details</h1>
                            <p className="app-subtitle">{biomarkers.length} biomarkers found. Review the numbers, then bring the one-page prep sheet to your appointment.</p>
                            <TrustLayer variant="compact" className="mt-3" />
                        </div>
                        <div className="app-actions shrink-0 print:hidden sm:justify-end">
                            <button
                                onClick={() => setRefreshKey((k) => k + 1)}
                                disabled={loading}
                                className="btn btn-secondary btn-sm disabled:opacity-50"
                                title="Refresh results"
                                style={{ WebkitAppearance: 'none' }}
                            >
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                            <button
                                onClick={handlePrint}
                                className="btn btn-secondary btn-sm"
                                style={{ WebkitAppearance: 'none' }}
                            >
                                <Printer size={16} />
                                <span className="hidden sm:inline">Export PDF</span>
                                <span className="sm:hidden">PDF</span>
                            </button>
                            <button
                                onClick={() => router.push('/dashboard?openUpload=1')}
                                className="btn btn-primary btn-sm"
                                style={{ WebkitAppearance: 'none' }}
                            >
                                Upload
                                <span className="hidden sm:inline"> New Report</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Feature 6: Plain English Summary */}
                {labResults.length > 0 && (selectedReportId === 'all' || selectedReportId === labResults[0]?.id) && (
                    <div className="mb-8 p-5 lg:p-6 bg-white border border-sky-100 rounded-2xl shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                            <Sparkles size={64} className="text-sky-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-0.5 bg-sky-50 text-sky-600 text-[10px] font-bold uppercase rounded-md border border-sky-100">
                                    The Bottom Line
                                </span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight text-wrap-safe">
                                {labResultSummary(selectedReportId === 'all' ? labResults[0] : labResults.find(r => String(r.id) === selectedReportId)) || "Select a report to see the bottom line interpretation."}
                            </h2>
                            <p className="text-xs text-slate-400 mt-4 italic text-wrap-safe">
                                * This clinical interpretation is generated by AI based on your specific biomarkers and reference ranges.
                            </p>
                        </div>
                    </div>
                )}

                <DoctorVisitPrep biomarkers={questionBiomarkers} demoMode={demoMode} className="mb-8" />

                {/* ── Report Selector ── */}
                <div style={{ marginBottom: 24 }} className="print:hidden">
                    <label className="section-label mb-2 block">
                        VIEWING REPORT
                    </label>
                    <div className="relative max-w-[280px]">
                        <select
                            value={selectedReportId}
                            onChange={e => setSelectedReportId(e.target.value)}
                            className="input-base pr-10"
                        >
                            <option value="all">All reports</option>
                            {labResults?.map(r => {
                                const score = r.health_score ?? (r.raw_ai_json as Record<string, unknown> | null)?.healthScore;
                                return (
                                    <option key={r.id} value={r.id.toString()}>
                                        {new Date(r.uploaded_at || r.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })} — Score: {score || 'N/A'}
                                    </option>
                                );
                            })}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#A8A29E]">
                            <TrendingUp size={16} className="rotate-90" />
                        </div>
                    </div>
                </div>

                {/* ── Status summary row ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 mb-6">
                    <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-[14px] p-4 flex flex-col items-center justify-center min-h-[90px]">
                        <span className="text-[32px] font-bold font-display text-[#065F46] block leading-none mb-1">{optimalCount}</span>
                        <span className="text-[12px] font-semibold text-[#065F46] uppercase tracking-wide">Optimal</span>
                    </div>
                    <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[14px] p-4 flex flex-col items-center justify-center min-h-[90px]">
                        <span className="text-[32px] font-bold font-display text-[#92400E] block leading-none mb-1">{warningCount}</span>
                        <span className="text-[12px] font-semibold text-[#92400E] uppercase tracking-wide">Monitor</span>
                    </div>
                    <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-[14px] p-4 flex flex-col items-center justify-center min-h-[90px]">
                        <span className="text-[32px] font-bold font-display text-[#991B1B] block leading-none mb-1">{criticalCount}</span>
                        <span className="text-[12px] font-semibold text-[#991B1B] uppercase tracking-wide">Action Needed</span>
                    </div>
                </div>

                {/* ── Category tabs & Search ── */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 mb-6 min-w-0">
                    <div className="flex flex-wrap gap-2 pb-1 min-w-0 xl:flex-1 xl:flex-nowrap xl:overflow-x-auto xl:scrollbar-hide xl:scroll-smooth xl:mask-fade-right">
                        {CATEGORIES.map(category => (
                            <button
                                key={category}
                                onClick={() => {
                                    setSelectedCategory(category)
                                    setSelectedBiomarker(null)
                                }}
                                className={`px-3.5 py-2 rounded-[12px] text-[14px] font-semibold capitalize whitespace-nowrap transition-all active:scale-95 min-h-[44px] ${selectedCategory === category
                                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                                    : 'bg-white text-[#57534E] border border-[#E8E6DF] hover:bg-[#F5F4EF]'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full xl:w-80 xl:shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
                        <input
                            type="text"
                            placeholder="Search biomarkers..."
                            value={searchQuery}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="input-base pl-10 h-11"
                        />
                    </div>
                </div>

                {/* ── Two column layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-5 lg:gap-6">

                    {/* Left column: List - full width on mobile */}
                    <div className="app-panel overflow-hidden">
                        {loading ? (
                            <div className="p-4 space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-16 bg-[#E8E6DF] rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : biomarkers.length === 0 && selectedCategory === 'all' ? (
                            <div className="py-16 px-8 text-center flex flex-col items-center justify-center">
                                <div className="w-14 h-14 rounded-full bg-[#E0F2FE] flex items-center justify-center mb-4">
                                    <ClipboardList size={24} color="#0EA5E9" />
                                </div>
                                <h3 className="text-xl font-bold text-[#1C1917] mb-2">No results yet</h3>
                                <p className="text-[15px] text-[#57534E] mb-6 max-w-xs mx-auto">
                                    Upload a lab report from your dashboard to see your biomarkers here.
                                </p>
                                <button 
                                    onClick={() => router.push('/dashboard')} 
                                    className="bg-sky-500 text-white rounded-[10px] px-6 py-2.5 text-[14px] font-bold active:scale-95 transition-transform min-h-[44px]"
                                >
                                    Go to dashboard
                                </button>
                            </div>
                        ) : filteredBiomarkers.length === 0 ? (
                            <div className="py-12 px-8 text-center flex flex-col items-center justify-center">
                                <div className="w-12 h-12 bg-[#E8E6DF] rounded-full flex items-center justify-center mb-4">
                                    <Search className="w-6 h-6 text-[#A8A29E]" />
                                </div>
                                <p className="text-[15px] text-[#57534E] font-medium">No results found.</p>
                                <p className="text-[13px] text-[#A8A29E] mt-1">Try a different search or filter.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#E8E6DF]">
                                {filteredBiomarkers.map((b) => (
                                    <div
                                        key={b.id}
                                        onClick={() => handleBiomarkerClick(b)}
                                        className={`flex items-start p-4 cursor-pointer hover:bg-[#EFEDE6] transition-colors active:bg-[#E8E6DF]/50 ${selectedBiomarker?.id === b.id ? 'border-l-[4px] border-l-sky-500 bg-[#EFEDE6]' : ''} ${b.status === 'critical' ? 'bg-red-50/30' :
                                                b.status === 'warning' ? 'bg-amber-50/20' : ''
                                            }`}
                                    >
                                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 mr-3 ${b.status === 'optimal' ? 'bg-emerald-500' :
                                            b.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                                            }`} />

                                        <div className="grow shrink basis-0 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="text-[15px] font-bold text-[#1C1917] text-wrap-safe" title={b.name}>{b.name}</span>
                                                <span className="text-[11px] font-bold bg-[#E0F2FE] text-[#0369A1] px-1.5 py-0.5 rounded-[6px] uppercase tracking-wider shrink-0">
                                                    {b.category}
                                                </span>
                                            </div>
                                            <div className="text-[15px] font-medium text-[#57534E] leading-relaxed">
                                                {b.value !== null && b.value !== undefined ? `${b.value} ${b.unit || ''}` : 'Value unavailable'}
                                                {(b.reference_range_min !== undefined || b.reference_range_max !== undefined) ? (
                                                    <span className="text-[12px] text-[#A8A29E] ml-0 block sm:ml-2 sm:inline font-normal">
                                                        (ref: {b.reference_range_min ?? 'N/A'}–{b.reference_range_max ?? 'N/A'})
                                                    </span>
                                                ) : (
                                                    <span className="text-[12px] text-[#A8A29E] ml-0 block sm:ml-2 sm:inline font-normal">(ref: N/A)</span>
                                                )}
                                            </div>
                                            {getBiomarkerReportDate(b) && (
                                                <p className="text-[11px] text-[#A8A29E] mt-0.5 font-medium">
                                                    From report {mounted ? new Date(getBiomarkerReportDate(b)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                                                </p>
                                            )}
                                            <div className="mt-3">
                                                <RangeBar
                                                    value={parseFloat(String(b.value))}
                                                    min={b.reference_range_min || 0}
                                                    max={b.reference_range_max || 100}
                                                    referenceMin={b.reference_range_min || 0}
                                                    referenceMax={b.reference_range_max || 100}
                                                    unit={b.unit}
                                                    status={b.status as 'optimal' | 'warning' | 'critical'}
                                                />
                                            </div>
                                        </div>

                                        <div className={`px-2 py-1 rounded-[6px] text-[11px] font-bold shrink-0 ml-3 text-center uppercase tracking-wider ${b.status === 'optimal' ? 'bg-[#D1FAE5] text-[#065F46]' :
                                            b.status === 'warning' ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-[#FEE2E2] text-[#991B1B]'
                                            }`}>
                                            {b.status === 'optimal' ? 'Optimal' :
                                                b.status === 'warning' ? 'Monitor' : 'Action'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right column: Detail */}
                    <div className="hidden min-w-0 lg:block">
                        <div className="sticky transform-gpu top-6">
                            {!selectedBiomarker ? (
                                <div className="app-panel p-8 text-center h-[200px] flex items-center justify-center">
                                    <p className="text-[15px] text-[#A8A29E] font-medium">Select a result to see AI interpretation</p>
                                </div>
                            ) : (
                                <div className="app-panel p-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="text-[20px] font-bold text-[#1C1917] leading-tight pr-4 text-wrap-safe">{selectedBiomarker.name}</h2>
                                        <button
                                            onClick={() => setSelectedBiomarker(null)}
                                            className="text-[#A8A29E] hover:text-[#1C1917] transition-colors p-1"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className={`bg-white border border-[#E8E6DF] rounded-[12px] p-5 mb-4 text-center shadow-sm min-w-0 ${selectedBiomarker.status === 'optimal' ? 'text-emerald-500' :
                                        selectedBiomarker.status === 'warning' ? 'text-amber-500' : 'text-red-500'
                                        }`}>
                                        <div className="text-[30px] sm:text-[36px] font-bold font-display leading-none mb-1 text-wrap-safe">
                                            {selectedBiomarker.value !== null && selectedBiomarker.value !== undefined ? `${selectedBiomarker.value} ${selectedBiomarker.unit || ''}` : 'N/A'}
                                        </div>
                                        {(selectedBiomarker.reference_range_min !== undefined || selectedBiomarker.reference_range_max !== undefined) ? (
                                            <p className="text-[13px] text-[#A8A29E] font-medium">
                                                Reference: {selectedBiomarker.reference_range_min ?? 'N/A'} – {selectedBiomarker.reference_range_max ?? 'N/A'}
                                            </p>
                                        ) : (
                                            <p className="text-[13px] text-[#A8A29E] font-medium">Reference: N/A</p>
                                        )}
                                    </div>

                                    <div className={`w-full text-center py-2.5 rounded-[8px] text-[14px] font-bold mb-6 uppercase tracking-widest ${selectedBiomarker.status === 'optimal' ? 'bg-[#D1FAE5] text-[#065F46]' :
                                        selectedBiomarker.status === 'warning' ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-[#FEE2E2] text-[#991B1B]'
                                        }`}>
                                        {selectedBiomarker.status === 'optimal' ? 'Optimal Range' :
                                            selectedBiomarker.status === 'warning' ? 'Needs Monitoring' : 'Requires Action'}
                                    </div>

                                    <h3 className="text-[11px] font-bold uppercase text-[#A8A29E] mb-3 tracking-widest">AI INTERPRETATION</h3>
                                    <p className="text-[15px] text-[#57534E] leading-relaxed mb-8 text-wrap-safe">
                                        {selectedBiomarker.ai_interpretation || "No interpretation available for this result."}
                                    </p>

                                    <h3 className="text-[11px] font-bold uppercase text-[#A8A29E] mb-4 tracking-widest flex items-center gap-2">
                                        <TrendingUp size={14} className="text-sky-500" />
                                        HISTORICAL TREND
                                    </h3>

                                    <div className="mb-8 h-[220px]">
                                        {loadingTrends ? (
                                            <div className="h-full w-full bg-white/50 rounded-lg flex items-center justify-center animate-pulse">
                                                <span className="text-xs text-slate-400">Loading history...</span>
                                            </div>
                                        ) : biomarkerTrends.length > 1 ? (
                                            <div className="h-full w-full">
                                                <WellnessTrendChart
                                                    data={biomarkerTrends}
                                                    supplements={supplements}
                                                    className="col-span-1"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-full w-full border-2 border-dashed border-[#E8E6DF] rounded-xl flex flex-col items-center justify-center p-6 text-center bg-white/30">
                                                <Info size={28} className="text-[#A8A29E] mb-3 opacity-30" />
                                                <p className="text-[12px] text-[#A8A29E] font-medium max-w-[200px]">Not enough data to show a trend line yet. Upload more reports to track progress.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center py-4 border-t border-[#E8E6DF] mb-4">
                                        <span className="text-[12px] text-[#A8A29E] font-bold uppercase tracking-wider">AI Confidence</span>
                                        <div className="flex items-center gap-4">
                                            {isDebugMode && (
                                                <button
                                                    onClick={() => alert(JSON.stringify(selectedBiomarker, null, 2))}
                                                    className="text-[10px] font-bold text-sky-500 hover:underline"
                                                >
                                                    RAW DATA
                                                </button>
                                            )}
                                            <span className="text-[13px] font-bold text-[#1C1917]">
                                                {selectedBiomarker.confidence !== null && selectedBiomarker.confidence !== undefined ? `${Math.round(selectedBiomarker.confidence * 100)}%` : '—'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => router.push('/assistant')}
                                        className="w-full bg-sky-500 hover:bg-sky-600 active:scale-95 text-white rounded-[12px] py-3 text-[15px] font-bold transition-all shadow-md shadow-sky-500/20"
                                    >
                                        Prepare doctor talking point
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Mobile Detail Sheet */}
                <BiomarkerDetailSheet
                    isOpen={showDetailSheet}
                    onClose={() => setShowDetailSheet(false)}
                    biomarker={selectedBiomarker}
                    history={biomarkers}
                />

                {/* ── Doctor Questions ── */}
                <DoctorQuestions biomarkers={questionBiomarkers} className="mt-8" />

                {/* ── Sticky Nudge Bar ── */}
                <div className="app-panel-white p-6 mt-10 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="min-w-0 flex-1 text-center sm:text-left">
                        <p className="font-bold text-lg text-[#1C1917] mb-1">
                            Had a recent blood test?
                        </p>
                        <p className="text-[14px] text-[#57534E] leading-relaxed">
                            Upload it now so MedAssist can compare changes and sharpen your next appointment prep sheet.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard?openUpload=1')}
                        className="bg-sky-500 text-white rounded-[12px] px-8 py-3 text-[15px] font-bold active:scale-95 transition-all shadow-md shadow-sky-500/10 flex items-center gap-2 w-full sm:w-auto justify-center min-h-[48px]"
                    >
                        Upload report
                        <ArrowRight size={18} />
                    </button>
                </div>
                </div>
            </div >
        </ErrorBoundary >
    )
}
