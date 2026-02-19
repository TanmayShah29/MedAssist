'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

// Define types
interface Biomarker {
    id: number
    name: string
    value: number
    unit: string
    status: 'optimal' | 'warning' | 'critical'
    category: string
    reference_min?: number
    reference_max?: number
    ai_interpretation?: string
    confidence?: number
    created_at: string
}

const CATEGORIES = ['all', 'hematology', 'inflammation', 'metabolic', 'vitamins', 'other']

export default function ResultsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [biomarkers, setBiomarkers] = useState<Biomarker[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedBiomarker, setSelectedBiomarker] = useState<Biomarker | null>(null)

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
                .select('*')
                .eq('user_id', user.id)
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
    const optimalCount = biomarkers.filter(b => b.status === 'optimal').length
    const warningCount = biomarkers.filter(b => b.status === 'warning').length
    const criticalCount = biomarkers.filter(b => b.status === 'critical').length

    return (
        <div className="min-h-screen bg-[#FAFAF7] p-6 text-[#1C1917] font-sans">

            {/* ── Header ── */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-[32px] font-bold font-display text-[#1C1917]">Lab Results</h1>
                    <p className="text-[15px] text-[#57534E]">{biomarkers.length} biomarkers found</p>
                    <p className="text-[13px] text-[#A8A29E] mt-1">Reference ranges vary by lab and individual. Discuss all results with your doctor.</p>
                </div>
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
                    className="text-white rounded-[10px] px-4 py-2 font-medium"
                >
                    {loading ? 'Processing...' : 'Upload New Report'}
                </button>
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

            {/* ── Category tabs ── */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
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
                            <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
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
                    ) : biomarkers.length === 0 ? (
                        <div className="py-12 px-8 text-center flex flex-col items-center justify-center">
                            <div className="w-12 h-12 bg-[#E8E6DF] rounded-full flex items-center justify-center mb-4">
                                <span className="text-xl">🔍</span>
                            </div>
                            <p className="text-[15px] text-[#57534E] font-medium">No results in this category.</p>
                            <p className="text-[13px] text-[#A8A29E] mt-1">Try selecting a different filter.</p>
                        </div>
                    ) : (
                        <div>
                            {biomarkers.map((b, i) => (
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
                                            {(b.reference_min !== undefined || b.reference_max !== undefined) && (
                                                <span className="text-[12px] text-[#A8A29E] ml-2">
                                                    (ref: {b.reference_min}–{b.reference_max})
                                                </span>
                                            )}
                                        </div>
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
                                    {(selectedBiomarker.reference_min !== undefined || selectedBiomarker.reference_max !== undefined) && (
                                        <p className="text-[12px] text-[#A8A29E]">
                                            Reference: {selectedBiomarker.reference_min} – {selectedBiomarker.reference_max}
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
                                <p className="text-[15px] text-[#57534E] leading-relaxed mb-4">
                                    {selectedBiomarker.ai_interpretation || "No interpretation available for this result."}
                                </p>

                                <div className="flex justify-between items-center pt-4 border-t border-[#E8E6DF] mt-4">
                                    <span className="text-[12px] text-[#A8A29E]">Confidence</span>
                                    <span className="text-[12px] font-semibold text-[#1C1917]">
                                        {selectedBiomarker.confidence ? Math.round(selectedBiomarker.confidence * 100) : 0}%
                                    </span>
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
                >
                    Upload report →
                </button>
            </div>
        </div>
    )
}
