'use client'

import { useEffect, useState } from 'react'
import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X, ClipboardList, Search, TrendingUp, Info, Printer, ArrowRight, RefreshCw, Sparkles } from 'lucide-react'
import dynamic from 'next/dynamic'
import { DoctorQuestions } from '@/components/dashboard/doctor-questions'
import { TrustLayer } from '@/components/trust-layer'
import { Biomarker } from '@/types/medical'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { RangeBar } from '@/components/ui/range-bar'

const WellnessTrendChart = dynamic(
    () => import('@/components/charts/wellness-trend-chart').then(mod => mod.WellnessTrendChart),
    { ssr: false, loading: () => <div className="h-full w-full bg-slate-50 animate-pulse rounded-xl" /> }
)

const CATEGORIES = ['all', 'hematology', 'inflammation', 'metabolic', 'vitamins', 'other']

// ── Main UI Component ──────────────────────────────────────────────────────

export default function ResultsPage() {
    const router = useRouter()
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
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setLoading(false)
                router.push('/auth?mode=login')
                return
            }

            let query = supabase
                .from('biomarkers')
                .select('*, lab_results!inner(user_id, uploaded_at)')
                .eq('lab_results.user_id', user.id)
                .order('created_at', { ascending: false })

            if (selectedCategory !== 'all') {
                query = query.eq('category', selectedCategory)
            }

            const { data } = await query
            setBiomarkers((data as Biomarker[]) || [])

            const { data: lrData } = await supabase
                .from('lab_results')
                .select('id, file_name, created_at, raw_ai_json, plain_summary')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
            setLabResults(lrData || [])
            setLoading(false)
        }
        fetchBiomarkers()
    }, [selectedCategory, router, refreshKey])

    // Derived counts for status summary
    const filteredBiomarkers = (selectedReportId === 'all'
        ? biomarkers
        : biomarkers.filter(b => b.lab_result_id?.toString() === selectedReportId)
    ).filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()))

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

    return (
        <ErrorBoundary>
            <div className="min-h-[100dvh] bg-[#FAFAF7] px-4 py-6 md:p-6 text-[#1C1917] font-sans">

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
                                {selectedReportId === 'all' ? labResults[0]?.plain_summary : labResults.find(r => r.id === selectedReportId)?.plain_summary || "No clinical summary available."}
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

                {/* ── Header ── */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-[28px] md:text-[32px] font-bold font-display text-[#1C1917]">Lab Results</h1>
                            <p className="text-[14px] md:text-[15px] text-[#57534E]">{biomarkers.length} biomarkers found</p>
                            <p className="text-[12px] md:text-[13px] text-[#A8A29E] mt-1">Reference ranges vary by lab and individual.</p>
                            <TrustLayer variant="compact" className="mt-3" />
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0 print:hidden">
                            <button
                                onClick={() => setRefreshKey((k) => k + 1)}
                                disabled={loading}
                                className="bg-white border border-[#E8E6DF] text-[#57534E] rounded-[10px] px-3 py-2 text-sm font-medium flex items-center gap-1.5 hover:bg-[#F5F4EF] transition-colors disabled:opacity-50 min-h-[40px]"
                                title="Refresh results"
                                style={{ WebkitAppearance: 'none' }}
                            >
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                            <button
                                onClick={handlePrint}
                                className="bg-white border border-[#E8E6DF] text-[#57534E] rounded-[10px] px-3 py-2 text-sm font-medium flex items-center gap-1.5 hover:bg-[#F5F4EF] transition-colors min-h-[40px]"
                                style={{ WebkitAppearance: 'none' }}
                            >
                                <Printer size={16} />
                                <span className="hidden sm:inline">Export PDF</span>
                                <span className="sm:hidden">PDF</span>
                            </button>
                            <button
                                onClick={() => router.push('/dashboard?openUpload=1')}
                                className="text-white rounded-[10px] px-3 py-2 text-sm font-medium bg-sky-500 hover:bg-sky-600 transition-colors min-h-[40px] flex items-center gap-1.5"
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
                    <div className="mb-8 p-6 bg-white border border-sky-100 rounded-2xl shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                            <Sparkles size={64} className="text-sky-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-0.5 bg-sky-50 text-sky-600 text-[10px] font-bold uppercase rounded-md border border-sky-100">
                                    The Bottom Line
                                </span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">
                                {selectedReportId === 'all' ? labResults[0]?.plain_summary : labResults.find(r => r.id === selectedReportId)?.plain_summary || "Select a report to see the bottom line interpretation."}
                            </h2>
                            <p className="text-xs text-slate-400 mt-4 italic">
                                * This clinical interpretation is generated by AI based on your specific biomarkers and reference ranges.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Report Selector ── */}
                <div style={{ marginBottom: 24 }} className="print:hidden">
                    <label style={{
                        fontSize: 11,
                        color: '#A8A29E',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'block',
                        marginBottom: 6
                    }}>
                        VIEWING REPORT
                    </label>
                    <select
                        value={selectedReportId}
                        onChange={e => setSelectedReportId(e.target.value)}
                        style={{
                            background: '#F5F4EF',
                            border: '1px solid #E8E6DF',
                            borderRadius: 8,
                            padding: '8px 12px',
                            fontSize: 14,
                            color: '#1C1917',
                            cursor: 'pointer',
                            minWidth: 280
                        }}
                    >
                        <option value="all">All reports</option>
                        {labResults?.map(r => {
                            const score = r.raw_ai_json?.healthScore;
                            return (
                                <option key={r.id} value={r.id.toString()}>
                                    {new Date(r.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })} — Score: {score || 'N/A'}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* ── Status summary row ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex gap-2 overflow-x-auto pb-3 md:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth mask-fade-right">
                        {CATEGORIES.map(category => (
                            <button
                                key={category}
                                onClick={() => {
                                    setSelectedCategory(category)
                                    setSelectedBiomarker(null)
                                }}
                                className={`px-4 py-2.5 rounded-[12px] text-[14px] font-semibold capitalize whitespace-nowrap transition-all active:scale-95 ${selectedCategory === category
                                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                                    : 'bg-white text-[#57534E] border border-[#E8E6DF] hover:bg-[#F5F4EF]'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
                        <input
                            type="text"
                            placeholder="Search biomarkers..."
                            value={searchQuery}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-[#F5F4EF] border border-[#E8E6DF] rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 w-full md:w-64 transition-all"
                        />
                    </div>
                </div>

                {/* ── Two column layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Left column: List */}
                    <div className="lg:col-span-3 bg-[#F5F4EF] border border-[#E8E6DF] rounded-[14px] overflow-hidden">
                        {loading ? (
                            <div className="p-4 space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-16 bg-[#E8E6DF] rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : biomarkers.length === 0 && selectedCategory === 'all' ? (
                            <div style={{ textAlign: 'center', padding: '64px 32px' }}>
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
                                    <ClipboardList size={24} color="#0EA5E9" />
                                </div>
                                <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1C1917', margin: '0 0 8px 0' }}>
                                    No results yet
                                </h3>
                                <p style={{ fontSize: 15, color: '#57534E', margin: '0 0 24px 0' }}>
                                    Upload a lab report from your dashboard to see your biomarkers here.
                                </p>
                                <button onClick={() => router.push('/dashboard')} style={{
                                    background: '#0EA5E9', color: 'white', border: 'none',
                                    borderRadius: 10, padding: '10px 20px', fontSize: 14,
                                    fontWeight: 600, cursor: 'pointer'
                                }}>
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
                            <div>
                                {filteredBiomarkers.map((b, i) => (
                                    <div
                                        key={b.id}
                                        onClick={() => setSelectedBiomarker(b)}
                                        className={`flex items-center p-4 cursor-pointer hover:bg-[#EFEDE6] transition-colors ${i !== biomarkers.length - 1 ? 'border-b border-[#E8E6DF]' : ''
                                            } ${selectedBiomarker?.id === b.id ? 'border-l-[3px] border-l-sky-500 bg-[#EFEDE6]' : ''} ${b.status === 'critical' ? 'border-l-[3px] border-l-red-500 bg-red-50/30' :
                                                b.status === 'warning' ? 'border-l-[3px] border-l-amber-500 bg-amber-50/20' : ''
                                            }`}
                                    >
                                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 mr-3 ${b.status === 'optimal' ? 'bg-emerald-500' :
                                            b.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                                            }`} />

                                        <div className="grow shrink basis-0 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[15px] font-semibold text-[#1C1917] truncate">{b.name}</span>
                                                <span className="text-[12px] bg-[#E0F2FE] text-[#0369A1] px-1.5 py-0.5 rounded-[6px] truncate">
                                                    {b.category}
                                                </span>
                                            </div>
                                            <div className="text-[15px] text-[#57534E]">
                                                {b.value} {b.unit}
                                                {(b.reference_range_min !== undefined || b.reference_range_max !== undefined) && (
                                                    <span className="text-[12px] text-[#A8A29E] ml-2">
                                                        (ref: {b.reference_range_min}–{b.reference_range_max})
                                                    </span>
                                                )}
                                            </div>
                                            {b.lab_results?.created_at && (
                                                <p className="text-[11px] text-[#A8A29E] mt-0.5">
                                                    From report {mounted ? new Date(b.lab_results?.uploaded_at || b.lab_results?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                                                </p>
                                            )}
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

                                        <div className={`px-2 py-1 rounded-[6px] text-[12px] font-semibold shrink-0 ml-4 ${b.status === 'optimal' ? 'bg-[#D1FAE5] text-[#065F46]' :
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
                    <div className="lg:col-span-2">
                        <div className="sticky transform-gpu top-6">
                            {!selectedBiomarker ? (
                                <div className="bg-[#F5F4EF] border border-[#E8E6DF] rounded-[14px] p-8 text-center h-[200px] flex items-center justify-center">
                                    <p className="text-[15px] text-[#A8A29E]">Select a result to see AI interpretation</p>
                                </div>
                            ) : (
                                <div className="bg-[#F5F4EF] border border-[#E8E6DF] rounded-[14px] p-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="text-[20px] font-semibold text-[#1C1917] leading-tight pr-4">{selectedBiomarker.name}</h2>
                                        <button
                                            onClick={() => setSelectedBiomarker(null)}
                                            className="text-[#A8A29E] hover:text-[#1C1917] transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className={`bg-white border border-[#E8E6DF] rounded-[10px] p-4 mb-4 text-center ${selectedBiomarker.status === 'optimal' ? 'text-emerald-500' :
                                        selectedBiomarker.status === 'warning' ? 'text-amber-500' : 'text-red-500'
                                        }`}>
                                        <div className="text-[32px] font-bold font-display leading-none mb-1">
                                            {selectedBiomarker.value} {selectedBiomarker.unit}
                                        </div>
                                        {(selectedBiomarker.reference_range_min !== undefined || selectedBiomarker.reference_range_max !== undefined) && (
                                            <p className="text-[12px] text-[#A8A29E]">
                                                Reference: {selectedBiomarker.reference_range_min} – {selectedBiomarker.reference_range_max}
                                            </p>
                                        )}
                                    </div>

                                    <div className={`w-full text-center py-2 rounded-[6px] text-[15px] font-semibold mb-4 ${selectedBiomarker.status === 'optimal' ? 'bg-[#D1FAE5] text-[#065F46]' :
                                        selectedBiomarker.status === 'warning' ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-[#FEE2E2] text-[#991B1B]'
                                        }`}>
                                        {selectedBiomarker.status === 'optimal' ? 'Optimal' :
                                            selectedBiomarker.status === 'warning' ? 'Monitor' : 'Action Needed'}
                                    </div>

                                    <h3 className="text-[10px] font-semibold uppercase text-[#A8A29E] mb-2 tracking-wider">AI INTERPRETATION</h3>
                                    <p className="text-[15px] text-[#57534E] leading-relaxed mb-6">
                                        {selectedBiomarker.ai_interpretation || "No interpretation available for this result."}
                                    </p>

                                    <h3 className="text-[10px] font-semibold uppercase text-[#A8A29E] mb-3 tracking-wider flex items-center gap-2">
                                        <TrendingUp size={12} className="text-sky-500" />
                                        HISTORICAL TREND
                                    </h3>

                                    <div className="mb-6 h-[200px]">
                                        {loadingTrends ? (
                                            <div className="h-full w-full bg-white/50 rounded-lg flex items-center justify-center animate-pulse">
                                                <span className="text-xs text-slate-400">Loading history...</span>
                                            </div>
                                        ) : biomarkerTrends.length > 1 ? (
                                            <div className="h-full w-full scale-95 origin-top">
                                                <WellnessTrendChart
                                                    data={biomarkerTrends}
                                                    supplements={supplements}
                                                    className="col-span-1"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-full w-full border-2 border-dashed border-[#E8E6DF] rounded-lg flex flex-col items-center justify-center p-4 text-center">
                                                <Info size={24} className="text-[#A8A29E] mb-2 opacity-30" />
                                                <p className="text-[11px] text-[#A8A29E]">Not enough data to show a trend line yet. Upload more reports to track progress.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-[#E8E6DF]">
                                        <span className="text-[12px] text-[#A8A29E]">Confidence</span>
                                        <div className="flex items-center gap-4">
                                            {isDebugMode && (
                                                <button
                                                    onClick={() => alert(JSON.stringify(selectedBiomarker, null, 2))}
                                                    className="text-[10px] font-bold text-indigo-500 hover:underline"
                                                >
                                                    RAW JSON
                                                </button>
                                            )}
                                            <span className="text-[12px] font-semibold text-[#1C1917]">
                                                {selectedBiomarker.confidence ? Math.round(selectedBiomarker.confidence * 100) : 0}%
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => router.push('/assistant')}
                                        className="w-full mt-4 bg-sky-500 hover:bg-sky-600 text-white rounded-[10px] py-2.5 text-[15px] font-medium transition-colors"
                                    >
                                        Ask AI about this
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* ── Doctor Questions ── */}
                <DoctorQuestions biomarkers={biomarkers} className="mt-8" />

                {/* ── Sticky Nudge Bar ── */}
                <div style={{
                    background: '#F5F4EF',
                    border: '1px solid #E8E6DF',
                    borderRadius: 14,
                    padding: '16px 20px',
                    marginTop: 32,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <p style={{ fontWeight: 600, fontSize: 15, color: '#1C1917', margin: 0 }}>
                            Had a recent blood test?
                        </p>
                        <p style={{ fontSize: 13, color: '#57534E', margin: '4px 0 0 0' }}>
                            Upload it now so MedAssist can track how your values are changing over time.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard?openUpload=1')}
                        style={{
                            background: '#0EA5E9',
                            color: 'white',
                            border: 'none',
                            borderRadius: 10,
                            padding: '8px 16px',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            marginLeft: 16
                        }}
                        className="flex items-center gap-2"
                    >
                        Upload report
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div >
        </ErrorBoundary >
    )
}
