'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X, ClipboardList, Search, TrendingUp, Info, Printer, ArrowRight, MessageSquare, ClipboardCopy, CheckCircle2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { DoctorQuestions } from '@/components/dashboard/doctor-questions'

const WellnessTrendChart = dynamic(
    () => import('@/components/charts/wellness-trend-chart').then(mod => mod.WellnessTrendChart),
    { ssr: false, loading: () => <div className="h-full w-full bg-slate-50 animate-pulse rounded-xl" /> }
)

// Define types
interface Biomarker {
    id: number
    name: string
    value: number
    unit: string
    status: 'optimal' | 'warning' | 'critical'
    category: string
    reference_range_min?: number
    reference_range_max?: number
    ai_interpretation?: string
    confidence?: number
    created_at: string
}

const CATEGORIES = ['all', 'hematology', 'inflammation', 'metabolic', 'vitamins', 'other']

// ── Helper Component ──
function RangeBar({ value, min, max, status }: {
    value: number
    min: number | null
    max: number | null
    status: string
}) {
    if (!min || !max) return null

    // Calculate position as percentage
    const range = max - min
    const buffer = range * 0.2 // 20% buffer on each side
    const displayMin = min - buffer
    const displayMax = max + buffer
    const displayRange = displayMax - displayMin

    // Avoid division by zero
    if (displayRange === 0) return null

    const valuePosition = Math.min(100, Math.max(0, ((value - displayMin) / displayRange) * 100))
    const refMinPosition = Math.max(0, Math.min(100, ((min - displayMin) / displayRange) * 100))
    const refMaxPosition = Math.max(0, Math.min(100, ((max - displayMin) / displayRange) * 100))

    const dotColor = status === 'optimal' ? '#10B981' : status === 'warning' ? '#F59E0B' : '#EF4444'

    return (
        <div style={{ position: 'relative', height: 24, marginTop: 8, width: '100%', maxWidth: '200px' }}>
            {/* Background track */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: 4,
                background: '#E8E6DF',
                borderRadius: 2,
                transform: 'translateY(-50%)'
            }} />

            {/* Reference range highlight */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: `${refMinPosition}%`,
                width: `${Math.max(0, refMaxPosition - refMinPosition)}%`,
                height: 4,
                background: '#D1FAE5',
                borderRadius: 2,
                transform: 'translateY(-50%)'
            }} />

            {/* Value dot */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: `${valuePosition}%`,
                width: 12,
                height: 12,
                background: dotColor,
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                border: '2px solid white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                zIndex: 1
            }} />

            {/* Min/Max labels */}
            <div style={{
                position: 'absolute',
                bottom: -16,
                left: `${refMinPosition}%`,
                fontSize: 10,
                color: '#A8A29E',
                transform: 'translateX(-50%)'
            }}>
                {min}
            </div>
            <div style={{
                position: 'absolute',
                bottom: -16,
                left: `${refMaxPosition}%`,
                fontSize: 10,
                color: '#A8A29E',
                transform: 'translateX(-50%)'
            }}>
                {max}
            </div>
        </div>
    )
}

export default function ResultsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [biomarkers, setBiomarkers] = useState<Biomarker[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedBiomarker, setSelectedBiomarker] = useState<Biomarker | null>(null)
    const [searchQuery, setSearchValue] = useState('')
    const [biomarkerTrends, setBiomarkerTrends] = useState<{ date: string; score: number }[]>([])
    const [loadingTrends, setLoadingTrends] = useState(false)
    const [isDebugMode, setIsDebugMode] = useState(false)

    useEffect(() => {
        setIsDebugMode(localStorage.getItem("medassist_debug_mode") === "true")
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
                        setBiomarkerTrends(data.trends.map((t: any) => ({
                            date: t.date,
                            score: t.value
                        })))
                    }
                } catch (err) {
                    console.error("Failed to fetch trends", err)
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
                router.push('/login')
                return
            }

            let query = supabase
                .from('biomarkers')
                .select('*, lab_results!inner(user_id)')
                .eq('lab_results.user_id', user.id)
                .order('created_at', { ascending: false })

            if (selectedCategory !== 'all') {
                query = query.eq('category', selectedCategory)
            }

            const { data } = await query
            setBiomarkers((data as Biomarker[]) || [])
            setLoading(false)
        }
        fetchBiomarkers()
    }, [selectedCategory, router])

    // Derived counts for status summary
    const filteredBiomarkers = biomarkers.filter(b => 
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const optimalCount = filteredBiomarkers.filter(b => b.status === 'optimal').length
    const warningCount = filteredBiomarkers.filter(b => b.status === 'warning').length
    const criticalCount = filteredBiomarkers.filter(b => b.status === 'critical').length

    return (
        <div className="min-h-screen bg-[#FAFAF7] p-6 text-[#1C1917] font-sans">

            {/* ── Print-only Header ── */}
            <div className="hidden print:flex items-center justify-between border-b-2 border-black pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-tight">MedAssist Analysis Report</h1>
                    <p className="text-sm font-medium mt-1">Patient Lab Data Interpretation · Clinical Context Intelligence</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold">DATE: {new Date().toLocaleDateString()}</p>
                    <p className="text-xs">Generated by Groq AI (Llama 3.3)</p>
                </div>
            </div>

            {/* ── Header ── */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-[32px] font-bold font-display text-[#1C1917]">Lab Results</h1>
                    <p className="text-[15px] text-[#57534E]">{biomarkers.length} biomarkers found</p>
                    <p className="text-[13px] text-[#A8A29E] mt-1">Reference ranges vary by lab and individual. Discuss all results with your doctor.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="bg-white border border-[#E8E6DF] text-[#57534E] rounded-[10px] px-4 py-2 font-medium flex items-center gap-2 hover:bg-[#F5F4EF] transition-colors print:hidden"
                    >
                        <Printer size={18} />
                        Export PDF
                    </button>
                    <button
                        onClick={() => {
                            setLoading(true);
                            router.push('/upload');
                        }}
                        disabled={loading}
                        style={{
                            background: loading ? '#7DD3FC' : '#0EA5E9',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.8 : 1,
                            transition: 'all 0.15s ease'
                        }}
                        className="text-white rounded-[10px] px-4 py-2 font-medium print:hidden"
                    >
                        {loading ? 'Processing...' : 'Upload New Report'}
                    </button>
                </div>
            </div>

            {/* ── Status summary row ── */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-[14px] p-4 text-center">
                    <span className="text-[32px] font-bold font-display text-[#065F46] block leading-none mb-1">{optimalCount}</span>
                    <span className="text-[12px] font-semibold text-[#065F46] uppercase tracking-wide">Optimal</span>
                </div>
                <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[14px] p-4 text-center">
                    <span className="text-[32px] font-bold font-display text-[#92400E] block leading-none mb-1">{warningCount}</span>
                    <span className="text-[12px] font-semibold text-[#92400E] uppercase tracking-wide">Monitor</span>
                </div>
                <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-[14px] p-4 text-center">
                    <span className="text-[32px] font-bold font-display text-[#991B1B] block leading-none mb-1">{criticalCount}</span>
                    <span className="text-[12px] font-semibold text-[#991B1B] uppercase tracking-wide">Action Needed</span>
                </div>
            </div>

            {/* ── Category tabs & Search ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                    {CATEGORIES.map(category => (
                        <button
                            key={category}
                            onClick={() => {
                                setSelectedCategory(category)
                                setSelectedBiomarker(null)
                            }}
                            className={`px-4 py-2 rounded-[10px] text-[15px] font-semibold capitalize whitespace-nowrap transition-colors ${selectedCategory === category
                                ? 'bg-sky-500 text-white'
                                : 'bg-[#F5F4EF] text-[#57534E] border border-[#E8E6DF] hover:bg-[#EFEDE6]'
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
                                        } ${selectedBiomarker?.id === b.id ? 'border-l-[3px] border-l-sky-500 bg-[#EFEDE6]' : ''}`}
                                >
                                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 mr-3 ${b.status === 'optimal' ? 'bg-emerald-500' :
                                        b.status === 'warning' ? 'amber-500' : 'bg-red-500' // Corrected amber-500 to bg-amber-500 implicitly via 'warning' check in next update if needed, but user spec said #F59E0B which is amber-500. 
                                        // Wait, user spec said: "Status dot (10px circle: #10B981 / #F59E0B / #EF4444)"
                                        // I will use explicit classes:
                                        } ${b.status === 'warning' ? 'bg-amber-500' : ''
                                        }`} />

                                    <div className="flex-1 min-w-0">
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
                                        <RangeBar
                                            value={b.value}
                                            min={b.reference_range_min || null}
                                            max={b.reference_range_max || null}
                                            status={b.status}
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
                    <div className="sticky top-6">
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
                                            <WellnessTrendChart data={biomarkerTrends} className="col-span-1" />
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
                    onClick={() => router.push('/dashboard')} // Navigate to dashboard/upload is likely better but dashboard has the button
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
        </div>
    )
}
