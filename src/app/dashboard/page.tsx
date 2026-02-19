'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList, AlertCircle, CheckCircle, Activity } from 'lucide-react'
import {
    RadialBarChart, RadialBar, PolarAngleAxis,
    RadarChart, Radar, PolarGrid,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts'

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

// ── Chart Components ──

function HealthScoreGauge({ score }: { score: number }) {
    const color = score >= 70 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'

    return (
        <div style={{ position: 'relative', width: 180, height: 180 }}>
            <RadialBarChart
                width={180}
                height={180}
                cx={90}
                cy={90}
                innerRadius={60}
                outerRadius={85}
                barSize={14}
                data={[{ value: score, fill: color }]}
                startAngle={90}
                endAngle={-270}
            >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar
                    background={{ fill: '#E8E6DF' }}
                    dataKey="value"
                    angleAxisId={0}
                    cornerRadius={8}
                />
            </RadialBarChart>
            {/* Center text overlay */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
            }}>
                <div style={{
                    fontFamily: 'Instrument Serif',
                    fontSize: 36,
                    fontWeight: 700,
                    color: 'white',
                    lineHeight: 1
                }}>
                    {score}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                    out of 100
                </div>
            </div>
        </div>
    )
}

function CategoryRadar({ biomarkers }: { biomarkers: Biomarker[] }) {
    const categories = ['hematology', 'inflammation', 'metabolic', 'vitamins', 'other']

    const data = categories.map(cat => {
        const catBiomarkers = biomarkers.filter(b => b.category === cat)
        if (catBiomarkers.length === 0) return { category: cat, score: 0, fullMark: 100 }

        const optimal = catBiomarkers.filter(b => b.status === 'optimal').length
        const warning = catBiomarkers.filter(b => b.status === 'warning').length
        const critical = catBiomarkers.filter(b => b.status === 'critical').length
        const total = catBiomarkers.length

        const score = Math.round(((optimal * 100) + (warning * 75) + (critical * 40)) / total)

        return {
            category: cat.charAt(0).toUpperCase() + cat.slice(1),
            score,
            fullMark: 100
        }
    }).filter(d => d.score > 0) // Only show categories with data

    if (data.length < 3) return null // Need at least 3 points for radar

    return (
        <div style={{
            background: '#F5F4EF',
            border: '1px solid #E8E6DF',
            borderRadius: 14,
            padding: 24,
            height: '100%'
        }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px 0' }}>
                SYSTEM BALANCE
            </p>
            <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={data}>
                    <PolarGrid stroke="#E8E6DF" />
                    <PolarAngleAxis
                        dataKey="category"
                        tick={{ fontSize: 12, fill: '#57534E' }}
                    />
                    <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#0EA5E9"
                        fill="#0EA5E9"
                        fillOpacity={0.15}
                        strokeWidth={2}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TrendChart({ labResults }: { labResults: any[] }) {
    if (labResults.length < 2) {
        return (
            <div style={{
                background: '#F5F4EF',
                border: '1px solid #E8E6DF',
                borderRadius: 14,
                padding: 24,
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase', margin: '0 0 16px 0' }}>
                    WELLNESS TREND
                </p>
                <p style={{ fontSize: 13, color: '#A8A29E', margin: 0 }}>
                    Upload a second report to see your health score trend over time
                </p>
            </div>
        )
    }

    const data = labResults.map(r => ({
        date: new Date(r.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: r.health_score || 0
    }))

    return (
        <div style={{
            background: '#F5F4EF',
            border: '1px solid #E8E6DF',
            borderRadius: 14,
            padding: 24,
            height: '100%'
        }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px 0' }}>
                WELLNESS TREND
            </p>
            <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E6DF" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#A8A29E' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#A8A29E' }} axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={{
                            background: '#FAFAF7',
                            border: '1px solid #E8E6DF',
                            borderRadius: 8,
                            fontSize: 13
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#0EA5E9"
                        strokeWidth={2}
                        dot={{ fill: '#0EA5E9', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default function DashboardPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [biomarkers, setBiomarkers] = useState<Biomarker[]>([])
    const [symptoms, setSymptoms] = useState<string[]>([])
    const [labResults, setLabResults] = useState<any[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            const [profileResponse, biomarkerResponse, symptomResponse, labResponse] = await Promise.all([
                supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single(),
                supabase.from('biomarkers').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
                supabase.from('symptoms').select('symptom').eq('user_id', user.id),
                supabase.from('lab_results')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('uploaded_at', { ascending: true })
            ])

            setProfile(profileResponse.data)
            setBiomarkers((biomarkerResponse.data as Biomarker[]) || [])
            setSymptoms((symptomResponse.data || []).map((s: { symptom: string }) => s.symptom))
            setLabResults(labResponse.data || [])
            setLoading(false)
        }
        fetchData()
    }, [router])

    // Derived values
    const optimalCount = biomarkers.filter(b => b.status === 'optimal').length
    const warningCount = biomarkers.filter(b => b.status === 'warning').length
    const criticalCount = biomarkers.filter(b => b.status === 'critical').length
    const totalCount = biomarkers.length

    // Optimistic scoring calculation
    let healthScore = 0
    if (totalCount > 0) {
        const rawScore = ((optimalCount * 100) + (warningCount * 75) + (criticalCount * 40)) / totalCount
        // Apply a floor — no one with any optimal values scores below 50
        const floor = optimalCount > 0 ? 50 : 30
        healthScore = Math.round(Math.max(floor, rawScore))
    }

    const getScoreLabel = (score: number) => {
        if (score >= 85) return { label: 'Excellent', color: '#10B981' }
        if (score >= 70) return { label: 'Good', color: '#10B981' }
        if (score >= 55) return { label: 'Fair', color: '#F59E0B' }
        return { label: 'Needs Attention', color: '#EF4444' }
    }

    const scoreLabel = getScoreLabel(healthScore)

    const priorities = [...biomarkers]
        .sort((a, b) => {
            const order = { critical: 0, warning: 1, optimal: 2 }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (order[a.status as keyof typeof order] ?? 1) - (order[b.status as keyof typeof order] ?? 1)
        })
        .slice(0, 3)

    if (loading) {
        return (
            <div className="min-h-screen animate-pulse p-6 bg-[#FAFAF7]">
                <div className="h-8 w-48 rounded-lg mb-2 bg-[#E8E6DF]" />
                <div className="h-4 w-64 rounded-lg mb-8 bg-[#E8E6DF]" />
                {/* Skeleton matching the hero card height */}
                <div className="h-[216px] rounded-[18px] mb-6 bg-[#E8E6DF]" />
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
                    className="text-white rounded-[10px] px-4 py-2 text-[15px] font-medium"
                >
                    {loading ? 'Processing...' : 'Upload Report'}
                </button>
            </div>

            {/* ── Health Score Hero Card OR Empty State ── */}
            {totalCount === 0 ? (
                <div style={{
                    background: '#F5F4EF',
                    border: '1px solid #E8E6DF',
                    borderRadius: 18,
                    padding: '48px 32px',
                    textAlign: 'center',
                    marginBottom: 24
                }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔬</div>
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
                    <button
                        onClick={() => {
                            setLoading(true);
                            router.push('/onboarding?step=upload');
                        }}
                        style={{
                            background: '#0EA5E9',
                            color: 'white',
                            border: 'none',
                            borderRadius: 10,
                            padding: '12px 24px',
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Upload my first report
                    </button>
                    <p style={{ fontSize: 12, color: '#A8A29E', marginTop: 12 }}>
                        Supports digital PDF lab reports · Takes 20–40 seconds
                    </p>
                </div>
            ) : (
                <div className="bg-sky-500 rounded-[18px] p-8 mb-6 text-white relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                        {/* Left: Gauge */}
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-semibold uppercase text-white/70 tracking-wider mb-2">HEALTH SCORE</span>
                            <HealthScoreGauge score={healthScore} />
                        </div>

                        {/* Right: Stats */}
                        <div className="flex-1 w-full max-w-md">
                            <div className="flex justify-between items-baseline mb-6 border-b border-white/20 pb-4">
                                <div>
                                    <h3 className="text-xl font-bold font-display">{scoreLabel.label}</h3>
                                    <p className="text-sm text-white/80">Overall Status</p>
                                </div>
                                <span className="text-3xl font-bold">{healthScore}</span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-[10px] px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                        <span className="text-[15px] font-medium">Optimal</span>
                                    </div>
                                    <span className="text-[16px] font-bold">{optimalCount}</span>
                                </div>
                                <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-[10px] px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                        <span className="text-[15px] font-medium">Monitor</span>
                                    </div>
                                    <span className="text-[16px] font-bold">{warningCount}</span>
                                </div>
                                <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-[10px] px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <span className="text-[15px] font-medium">Action Needed</span>
                                    </div>
                                    <span className="text-[16px] font-bold">{criticalCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/20 relative z-10 text-center md:text-left">
                        <p className="text-[15px] text-white/90">
                            Based on {totalCount} biomarkers from your latest report
                        </p>
                    </div>
                </div>
            )}

            {/* ── Engagement Nudge (Only if 1 report) ── */}
            {labResults.length === 1 && (
                <div style={{
                    background: '#E0F2FE',
                    border: '1px solid #BAE6FD',
                    borderRadius: 14,
                    padding: '16px 20px',
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12
                }}>
                    <span style={{ fontSize: 20 }}>📈</span>
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
            )}

            {/* ── "Today's Priorities" section ── */}
            <div className="mb-6">
                <h3 className="text-[10px] font-semibold uppercase text-[#A8A29E] mb-4 tracking-wider">TODAY&apos;S PRIORITIES</h3>

                {biomarkers.length === 0 ? (
                    <div className="bg-[#F5F4EF] border border-[#E8E6DF] rounded-[14px] py-12 px-8 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-[#E8E6DF] rounded-full flex items-center justify-center mb-6">
                            <ClipboardList className="w-8 h-8 text-[#A8A29E]" />
                        </div>
                        <h3 className="text-[20px] font-semibold text-[#1C1917] mb-3 font-display">No lab results yet</h3>
                        <p className="text-[15px] text-[#57534E] max-w-md mx-auto mb-6 leading-relaxed">
                            Upload your first lab report to see your health overview and priorities.
                        </p>
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
                            className="text-white rounded-[10px] px-6 py-3 font-medium flex items-center gap-2"
                        >
                            {loading ? 'Processing...' : 'Upload your first report'}
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

            {/* ── Charts Grid (Trend & Radar) ── */}
            {totalCount > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <TrendChart labResults={labResults} />
                    <CategoryRadar biomarkers={biomarkers} />
                </div>
            )}

            {/* ── Engagement Nudge (Only if 1 report) ── */}
            {labResults.length === 1 && (
                <div style={{
                    background: '#E0F2FE',
                    border: '1px solid #BAE6FD',
                    borderRadius: 14,
                    padding: '16px 20px',
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12
                }}>
                    <span style={{ fontSize: 20 }}>📈</span>
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
            )}

            {/* ── "Today's Priorities" section ── */}
            <div className="mb-6">
                <h3 className="text-[10px] font-semibold uppercase text-[#A8A29E] mb-4 tracking-wider">TODAY&apos;S PRIORITIES</h3>

                {biomarkers.length === 0 ? (
                    <div className="bg-[#F5F4EF] border border-[#E8E6DF] rounded-[14px] py-12 px-8 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-[#E8E6DF] rounded-full flex items-center justify-center mb-6">
                            <ClipboardList className="w-8 h-8 text-[#A8A29E]" />
                        </div>
                        <h3 className="text-[20px] font-semibold text-[#1C1917] mb-3 font-display">No lab results yet</h3>
                        <p className="text-[15px] text-[#57534E] max-w-md mx-auto mb-6 leading-relaxed">
                            Upload your first lab report to see your health overview and priorities.
                        </p>
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
                            className="text-white rounded-[10px] px-6 py-3 font-medium flex items-center gap-2"
                        >
                            {loading ? 'Processing...' : 'Upload your first report'}
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
