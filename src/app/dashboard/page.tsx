'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList, AlertCircle, CheckCircle, Activity } from 'lucide-react'

// Define types based on usage
interface Profile {
    first_name: string
    last_name: string
}

interface Biomarker {
    id: number
    name: string
    value: number
    unit: string
    status: 'optimal' | 'warning' | 'critical'
    category: string
    ai_interpretation?: string
    created_at: string
}

interface Symptom {
    symptom: string
}

export default function DashboardPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [biomarkers, setBiomarkers] = useState<Biomarker[]>([])
    const [symptoms, setSymptoms] = useState<string[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/auth')
                return
            }

            const [profileResponse, biomarkerResponse, symptomResponse] = await Promise.all([
                supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single(),
                supabase.from('biomarkers').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
                supabase.from('symptoms').select('symptom').eq('user_id', user.id)
            ])

            setProfile(profileResponse.data)
            setBiomarkers((biomarkerResponse.data as Biomarker[]) || [])
            setSymptoms((symptomResponse.data || []).map((s: { symptom: string }) => s.symptom))
            setLoading(false)
        }
        fetchData()
    }, [router])

    // Derived values
    const optimalCount = biomarkers.filter(b => b.status === 'optimal').length
    const warningCount = biomarkers.filter(b => b.status === 'warning').length
    const criticalCount = biomarkers.filter(b => b.status === 'critical').length
    const totalCount = biomarkers.length

    const healthScore = totalCount === 0 ? 0 : Math.round(((optimalCount * 1) + (warningCount * 0.5)) / totalCount * 100)

    const priorities = [...biomarkers]
        .sort((a, b) => {
            const order = { critical: 0, warning: 1, optimal: 2 }
            return order[a.status] - order[b.status]
        })
        .slice(0, 3)

    if (loading) {
        return (
            <div className="min-h-screen animate-pulse p-6 bg-[#FAFAF7]">
                <div className="h-8 w-48 rounded-lg mb-2 bg-[#E8E6DF]" />
                <div className="h-4 w-64 rounded-lg mb-8 bg-[#E8E6DF]" />
                <div className="h-36 rounded-[18px] mb-6 bg-[#E8E6DF]" />
                <div className="h-6 w-40 rounded mb-4 bg-[#E8E6DF]" />
                <div className="space-y-3">
                    <div className="h-20 rounded-[14px] bg-[#E8E6DF]" />
                    <div className="h-20 rounded-[14px] bg-[#E8E6DF]" />
                    <div className="h-20 rounded-[14px] bg-[#E8E6DF]" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FAFAF7] p-6 text-[#1C1917] font-sans">

            {/* ── Header row ── */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-[32px] font-bold font-display text-[#1C1917]">Clinical Overview</h1>
                    <p className="text-[15px] text-[#57534E]">Welcome back, {profile?.first_name || 'there'}</p>
                </div>
                <button
                    onClick={() => router.push('/upload')}
                    className="bg-sky-500 hover:bg-sky-600 text-white rounded-[10px] px-4 py-2 text-[15px] font-medium transition-colors"
                >
                    Upload Report
                </button>
            </div>

            {/* ── Health Score Hero Card ── */}
            <div className="bg-sky-500 rounded-[18px] p-8 mb-6 text-white relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                    <div>
                        <span className="text-[10px] font-semibold uppercase text-white/70 tracking-wider">HEALTH SCORE</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-[48px] font-bold font-display leading-none">{healthScore}</span>
                            <span className="text-[15px] text-white/70">out of 100</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <div className="bg-white/10 backdrop-blur-sm rounded-[10px] px-4 py-2 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                            <span className="text-[14px] font-medium">{optimalCount} Optimal</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-[10px] px-4 py-2 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                            <span className="text-[14px] font-medium">{warningCount} Monitor</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-[10px] px-4 py-2 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            <span className="text-[14px] font-medium">{criticalCount} Action</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/20 relative z-10">
                    <p className="text-[15px] text-white/90">
                        Based on {totalCount} biomarkers from your latest report
                    </p>
                </div>
            </div>

            {/* ── "Today's Priorities" section ── */}
            <div className="mb-6">
                <h3 className="text-[10px] font-semibold uppercase text-[#A8A29E] mb-4 tracking-wider">TODAY&apos;S PRIORITIES</h3>

                {biomarkers.length === 0 ? (
                    <div className="bg-[#F5F4EF] border border-[#E8E6DF] rounded-[14px] p-8 text-center flex flex-col items-center justify-center">
                        <ClipboardList className="w-12 h-12 text-[#A8A29E] mb-4" />
                        <h3 className="text-[20px] font-semibold text-[#1C1917] mb-2 font-display">No lab results yet</h3>
                        <p className="text-[15px] text-[#57534E] max-w-md mx-auto mb-4">
                            Upload your first lab report to see your health overview and priorities.
                        </p>
                        <button
                            onClick={() => router.push('/upload')}
                            className="bg-sky-500 hover:bg-sky-600 text-white rounded-[10px] px-4 py-2 font-medium transition-colors"
                        >
                            Upload your first report
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {priorities.map((b) => (
                            <div
                                key={b.id}
                                className="bg-[#F5F4EF] border border-[#E8E6DF] rounded-[14px] p-4 flex items-start gap-4 transition-colors hover:bg-[#EFEDE6]"
                            >
                                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${b.status === 'optimal' ? 'bg-emerald-500' :
                                    b.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                                    }`} />

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[15px] font-semibold text-[#1C1917] truncate pr-2">{b.name}</span>
                                        <span className={`text-[12px] px-2 py-1 rounded-[6px] font-semibold shrink-0 ${b.status === 'optimal' ? 'bg-emerald-100 text-emerald-800' :
                                            b.status === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {b.status === 'optimal' ? 'Optimal' :
                                                b.status === 'warning' ? 'Monitor' : 'Action'}
                                        </span>
                                    </div>

                                    <div className="text-[15px] text-[#57534E] mb-1">
                                        {b.value} {b.unit}
                                    </div>

                                    {b.ai_interpretation && (
                                        <p className="text-[12px] text-[#A8A29E] line-clamp-2 leading-relaxed">
                                            {b.ai_interpretation}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Two column grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left column: All Biomarkers */}
                <div className="bg-[#F5F4EF] border border-[#E8E6DF] rounded-[14px] p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-[20px] font-semibold font-display text-[#1C1917]">All Biomarkers</h2>
                        <span className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            {totalCount}
                        </span>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                        {biomarkers.length > 0 ? (
                            biomarkers.map((b, i) => (
                                <div
                                    key={b.id}
                                    className={`flex items-center py-3 ${i !== biomarkers.length - 1 ? 'border-b border-[#E8E6DF]' : ''}`}
                                >
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${b.status === 'optimal' ? 'bg-emerald-500' :
                                        b.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                                        }`} />

                                    <div className="flex-1 ml-3 mr-4 min-w-0">
                                        <p className="text-[15px] font-medium text-[#1C1917] truncate">{b.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[12px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-[6px] truncate max-w-[120px]">
                                                {b.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-[15px] text-[#57534E] font-medium whitespace-nowrap">
                                        {b.value} <span className="text-[13px] text-[#A8A29E]">{b.unit}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-[#A8A29E]">No biomarkers found</div>
                        )}
                    </div>
                </div>

                {/* Right column: Symptoms & Quick Actions */}
                <div className="space-y-6">

                    {/* Symptoms Reported */}
                    <div className="bg-[#F5F4EF] border border-[#E8E6DF] rounded-[14px] p-6">
                        <h2 className="text-[20px] font-semibold font-display text-[#1C1917] mb-4">Symptoms Reported</h2>

                        {symptoms.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {symptoms.map((s, i) => (
                                    <span
                                        key={i}
                                        className="bg-sky-100 text-sky-700 text-[12px] font-semibold px-2.5 py-1 rounded-[6px]"
                                    >
                                        {s}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[15px] text-[#A8A29E] italic">
                                No symptoms reported during onboarding.
                            </p>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-[#F5F4EF] border border-[#E8E6DF] rounded-[14px] p-6">
                        <h2 className="text-[20px] font-semibold font-display text-[#1C1917] mb-4">Quick Actions</h2>

                        <div className="space-y-2">
                            <Link
                                href="/results"
                                className="flex items-center justify-between p-3 rounded-[10px] hover:bg-[#EFEDE6] transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg border border-[#E8E6DF] text-sky-500">
                                        <Activity size={16} />
                                    </div>
                                    <span className="text-[15px] font-medium text-[#1C1917]">View full results</span>
                                </div>
                                <span className="text-[#A8A29E] group-hover:text-[#1C1917] transition-colors">→</span>
                            </Link>

                            <Link
                                href="/assistant"
                                className="flex items-center justify-between p-3 rounded-[10px] hover:bg-[#EFEDE6] transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg border border-[#E8E6DF] text-violet-500">
                                        <AlertCircle size={16} />
                                    </div>
                                    <span className="text-[15px] font-medium text-[#1C1917]">Ask AI assistant</span>
                                </div>
                                <span className="text-[#A8A29E] group-hover:text-[#1C1917] transition-colors">→</span>
                            </Link>

                            <Link
                                href="/profile"
                                className="flex items-center justify-between p-3 rounded-[10px] hover:bg-[#EFEDE6] transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg border border-[#E8E6DF] text-emerald-500">
                                        <CheckCircle size={16} />
                                    </div>
                                    <span className="text-[15px] font-medium text-[#1C1917]">Update profile</span>
                                </div>
                                <span className="text-[#A8A29E] group-hover:text-[#1C1917] transition-colors">→</span>
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
