'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList, AlertCircle, CheckCircle, Activity, FileText, ChevronRight } from 'lucide-react'
import dynamic from 'next/dynamic'

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const RadarChart = dynamic(() => import('recharts').then(mod => mod.RadarChart), { ssr: false });
const Radar = dynamic(() => import('recharts').then(mod => mod.Radar), { ssr: false });
const PolarGrid = dynamic(() => import('recharts').then(mod => mod.PolarGrid), { ssr: false });
const PolarAngleAxis = dynamic(() => import('recharts').then(mod => mod.PolarAngleAxis), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });

import { UploadModal } from '@/components/upload-modal'
import { BiomarkerDetailSheet } from '@/components/dashboard/BiomarkerDetailSheet'
import { DebugTraceView } from '@/components/dashboard/DebugTraceView'
import { Download, Share2, Upload, Beaker, PlayCircle, PlusCircle, WifiOff, Shield, Printer, Trash2, ChevronRight } from 'lucide-react'
import { deleteLabResult } from '@/app/actions/user-data'
import { AIInsightsFeed } from '@/components/dashboard/ai-insights-feed'
import { ActionItems } from '@/components/dashboard/action-items'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { StatusDistributionChart } from '@/components/dashboard/status-distribution-chart'
import { toast } from 'sonner'
import { DEMO_HISTORY, DEMO_LAB_RESULT } from '@/lib/demo-data'

// ── Chart Components ──


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
function TrendChart({ labResults, biomarkers }: { labResults: any[], biomarkers: Biomarker[] }) {
    const [selectedBiomarker, setSelectedBiomarker] = useState<string>('Health Score');

    if (labResults.length < 1) return null;

    // Get unique biomarker names that appear in at least 2 reports for trending
    const biomarkerNames = Array.from(new Set(biomarkers.map(b => b.name)));
    const trendableBiomarkers = biomarkerNames.filter(name =>
        biomarkers.filter(b => b.name === name).length >= 2
    );

    const chartData = labResults.map(report => {
        const date = new Date(report.uploaded_at || report.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });

        const dataPoint: any = { date };

        if (selectedBiomarker === 'Health Score') {
            dataPoint.value = report.health_score || 0;
        } else {
            const b = biomarkers.find(bm => bm.lab_result_id === report.id && bm.name === selectedBiomarker);
            dataPoint.value = b ? b.value : null;
            dataPoint.unit = b?.unit;
        }

        return dataPoint;
    });

    const displayUnit = selectedBiomarker === 'Health Score' ? '/ 100' :
        biomarkers.find(b => b.name === selectedBiomarker)?.unit || '';

    return (
        <div style={{
            background: '#F5F4EF',
            border: '1px solid #E8E6DF',
            borderRadius: 14,
            padding: 24,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div className="flex justify-between items-center mb-6">
                <p style={{ fontSize: 10, fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                    WELLNESS TRENDS
                </p>
                <select
                    value={selectedBiomarker}
                    onChange={(e) => setSelectedBiomarker(e.target.value)}
                    style={{
                        background: 'white',
                        border: '1px solid #E8E6DF',
                        borderRadius: 6,
                        fontSize: 11,
                        padding: '2px 8px',
                        color: '#57534E',
                        outline: 'none'
                    }}
                >
                    <option value="Health Score">Overall Health Score</option>
                    {trendableBiomarkers.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
            </div>

            {chartData.length < 2 && selectedBiomarker === 'Health Score' ? (
                <div className="flex-1 flex flex-col justify-center items-center text-center opacity-60">
                    <Activity className="w-8 h-8 text-[#A8A29E] mb-3" />
                    <p style={{ fontSize: 13, color: '#A8A29E' }}>
                        Upload more reports to see your progress over time
                    </p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8E6DF" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: '#A8A29E' }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#A8A29E' }}
                            axisLine={false}
                            tickLine={false}
                            dx={-10}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div style={{
                                            background: '#FAFAF7',
                                            border: '1px solid #E8E6DF',
                                            borderRadius: 8,
                                            padding: '8px 12px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}>
                                            <p style={{ fontSize: 10, color: '#A8A29E', margin: '0 0 4px 0' }}>{payload[0].payload.date}</p>
                                            <p style={{ fontSize: 14, fontWeight: 700, color: '#1C1917', margin: 0 }}>
                                                {payload[0].value} <span style={{ fontSize: 11, fontWeight: 400, color: '#57534E' }}>{displayUnit}</span>
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#0EA5E9"
                            strokeWidth={3}
                            dot={{ fill: '#0EA5E9', strokeWidth: 2, r: 4, stroke: 'white' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            connectNulls
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

export default function DashboardClient({
    initialProfile,
    initialBiomarkers,
    initialSymptoms,
    initialLabResults
}: {
    initialProfile: Profile | null,
    initialBiomarkers: Biomarker[],
    initialSymptoms: string[],
    initialLabResults: any[]
}) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const profile = initialProfile;
    const biomarkers = initialBiomarkers;
    const symptoms = initialSymptoms;
    const labResults = initialLabResults;

    const [selectedBiomarkerData, setSelectedBiomarkerData] = useState<Biomarker | null>(null);
    const [showDetailSheet, setShowDetailSheet] = useState(false);
    const [debugMode, setDebugMode] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const [demoMode, setDemoMode] = useState(false);

    // Derived Data taking Demo Mode into account
    const displayLabResults = demoMode
        ? [DEMO_LAB_RESULT, ...initialLabResults]
        : initialLabResults;

    const displayBiomarkers = demoMode
        ? [...DEMO_HISTORY, ...initialBiomarkers]
        : initialBiomarkers;

    const latestLabResult = displayLabResults[0];
    const longitudinalInsights: string[] = latestLabResult?.raw_ai_json?.longitudinalInsights || [];

    // Offline Resilience: Save to LocalStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (displayLabResults.length > 0) {
                localStorage.setItem('medassist_cached_lab_results', JSON.stringify(displayLabResults));
                localStorage.setItem('medassist_cached_biomarkers', JSON.stringify(displayBiomarkers));
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
    }, [displayLabResults, displayBiomarkers]);

    const handleBiomarkerClick = (b: Biomarker) => {
        setSelectedBiomarkerData(b);
        setShowDetailSheet(true);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDeleteReport = async (id: number) => {
        if (!confirm("Are you sure you want to delete this report? This will also remove its biomarkers from your trends.")) return;

        setLoading(true);
        try {
            const res = await deleteLabResult(id);
            if (res.success) {
                toast.success("Report deleted successfully");
                router.refresh();
            } else {
                toast.error(res.error || "Failed to delete report");
            }
        } catch (err) {
            toast.error("An error occurred while deleting");
        } finally {
            setLoading(false);
        }
    };

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

    // Removed loading skeleton since data is passed directly from server

    return (
        <div className="min-h-screen bg-[#FAFAF7] p-6 text-[#1C1917] font-sans" id="dashboard-content">

            {/* ── Header row ── */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-[32px] font-bold font-display text-[#1C1917]">Clinical Overview</h1>
                        {isOffline && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[10px] font-bold animate-pulse">
                                <WifiOff size={12} />
                                OFFLINE MODE
                            </div>
                        )}
                    </div>
                    <p className="text-[15px] text-[#57534E]">Welcome back, {profile?.first_name || 'there'}</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setDemoMode(!demoMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-bold transition-all ${demoMode
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm'
                            : 'bg-white text-[#57534E] border border-[#E8E6DF] hover:border-emerald-200'
                            }`}
                        title="Toggle mock data for demonstration"
                    >
                        <PlayCircle size={14} />
                        {demoMode ? 'DEMO ACTIVE' : 'DEMO MODE'}
                    </button>

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8E6DF] rounded-full text-[13px] font-bold text-[#57534E] hover:bg-gray-50 transition-all shadow-sm print:hidden"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>

                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2 px-6 py-2 bg-[#0EA5E9] text-white rounded-full text-[14px] font-bold hover:bg-[#0284C7] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                    >
                        <Upload className="w-4 h-4" />
                        Upload
                    </button>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F4EF] border border-[#E8E6DF] rounded-full">
                        <span className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Debug</span>
                        <input
                            type="checkbox"
                            checked={debugMode}
                            onChange={(e) => setDebugMode(e.target.checked)}
                            className="w-3.5 h-3.5 accent-sky-500 cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* ── Debug Mode: Technical Trace ── */}
            {debugMode && latestLabResult && (
                <DebugTraceView labResult={latestLabResult} />
            )}

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
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                        {/* Left: Score Box */}
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold uppercase text-white/70 tracking-wider mb-2">HEALTH SCORE</span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                                <div style={{
                                    fontFamily: 'Instrument Serif',
                                    fontSize: 64,
                                    fontWeight: 700,
                                    color: 'white',
                                    lineHeight: 1
                                }}>
                                    {healthScore}
                                </div>
                                <div style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    borderRadius: 8,
                                    padding: '4px 10px',
                                    fontSize: 14,
                                    fontWeight: 600
                                }}>
                                    {scoreLabel.label}
                                </div>
                            </div>

                            <div style={{ marginTop: 16 }}>
                                <div style={{
                                    fontSize: 13,
                                    color: 'rgba(255,255,255,0.9)',
                                    marginBottom: 8
                                }}>
                                    Score ranges:
                                </div>
                                <div style={{
                                    display: 'flex',
                                    gap: 12,
                                    flexWrap: 'wrap',
                                    fontSize: 12
                                }}>
                                    {[
                                        { range: '85-100', label: 'Excellent', color: '#10B981' },
                                        { range: '70-84', label: 'Good', color: '#10B981' },
                                        { range: '55-69', label: 'Fair', color: '#F59E0B' },
                                        { range: 'Below 55', label: 'Needs attention', color: '#EF4444' }
                                    ].map(item => (
                                        <div key={item.range} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4
                                        }}>
                                            <div style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                background: item.color
                                            }} />
                                            <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                                                {item.range}: {item.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <p style={{
                                    fontSize: 12,
                                    color: 'rgba(255,255,255,0.6)',
                                    marginTop: 8
                                }}>
                                    Most healthy adults score between 70–85
                                </p>
                            </div>
                        </div>

                        {/* Right: Stats */}
                        <div className="flex-1 w-full max-w-md mt-6 md:mt-0">
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

            {/* ── Longitudinal Insights ── */}
            {longitudinalInsights.length > 0 && (
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
            )}

            {/* ── Engagement Nudge (Only if 1 report) ── */}
            {labResults.length === 1 && (
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
            )}

            {/* ── Real Insights Feed ── */}
            {totalCount > 0 && (
                <div className="mb-6">
                    <h3 className="text-[10px] font-semibold uppercase text-[#A8A29E] mb-4 tracking-wider text-center lg:text-left">PERSONALIZED INSIGHTS</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6">
                        <AIInsightsFeed analysis={{ summary: latestLabResult?.summary || "" }} />
                        <ActionItems biomarkers={biomarkers} />
                    </div>
                </div>
            )}

            {/* ── Charts Grid (Trend & Radar) ── */}
            {totalCount > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <TrendChart labResults={labResults} biomarkers={biomarkers} />
                    <CategoryRadar biomarkers={biomarkers} />
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
                            onClick={() => setShowUploadModal(true)}
                            className="text-white rounded-[10px] px-6 py-3 font-medium bg-sky-500 hover:bg-sky-600 transition-colors"
                        >
                            Upload your first report
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {priorities.map((b) => (
                            <div
                                key={b.id}
                                className="bg-[#F5F4EF] border border-[#E8E6DF] rounded-[14px] p-4 flex flex-col gap-3 transition-colors hover:bg-[#EFEDE6] cursor-pointer group shadow-sm"
                                onClick={() => handleBiomarkerClick(b)}
                            >
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
                                    <span className="text-[13px] font-bold text-[#1C1917]">{b.value} <span className="text-[10px] font-normal text-gray-500">{b.unit}</span></span>
                                </div>

                                <div className="flex-1">
                                    <span className="text-[15px] font-bold text-[#1C1917] group-hover:text-sky-600 transition-colors block mb-1">{b.name}</span>
                                    {b.ai_interpretation && (
                                        <p className="text-[12px] text-[#A8A29E] line-clamp-2 leading-relaxed italic">
                                            {b.ai_interpretation}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Secondary row: Activity & Distribution ── */}
            {totalCount > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <RecentActivity labResults={displayLabResults} />
                    <StatusDistributionChart 
                        optimal={optimalCount} 
                        warning={warningCount} 
                        critical={criticalCount} 
                    />
                </div>
            )}

            {/* ── Quick Actions ── */}
            <div className="mb-6">
                <h3 className="text-[10px] font-semibold uppercase text-[#A8A29E] mb-4 tracking-wider">QUICK ACTIONS</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/results"
                        className="bg-white border border-[#E8E6DF] rounded-[14px] p-4 flex items-center justify-between hover:bg-[#EFEDE6] transition-colors group shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-sky-100 rounded-lg text-sky-600">
                                <Activity size={18} />
                            </div>
                            <span className="text-[15px] font-bold text-[#1C1917]">View Full Results</span>
                        </div>
                        <ChevronRight size={16} className="text-[#A8A29E] group-hover:text-[#1C1917] transition-colors" />
                    </Link>

                    <Link
                        href="/assistant"
                        className="bg-white border border-[#E8E6DF] rounded-[14px] p-4 flex items-center justify-between hover:bg-[#EFEDE6] transition-colors group shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-100 rounded-lg text-violet-600">
                                <Brain size={18} />
                            </div>
                            <span className="text-[15px] font-bold text-[#1C1917]">Consult Assistant</span>
                        </div>
                        <ChevronRight size={16} className="text-[#A8A29E] group-hover:text-[#1C1917] transition-colors" />
                    </Link>

                    <Link
                        href="/profile"
                        className="bg-white border border-[#E8E6DF] rounded-[14px] p-4 flex items-center justify-between hover:bg-[#EFEDE6] transition-colors group shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                <CheckCircle size={18} />
                            </div>
                            <span className="text-[15px] font-bold text-[#1C1917]">Update Health Profile</span>
                        </div>
                        <ChevronRight size={16} className="text-[#A8A29E] group-hover:text-[#1C1917] transition-colors" />
                    </Link>
                </div>
            </div>

            {/* ── Two column grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column: All Biomarkers */}
                <div className="bg-white border border-[#E8E6DF] rounded-[14px] p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-[18px] font-bold text-[#1C1917]">Latest Biomarkers</h2>
                        <span className="bg-sky-100 text-sky-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {totalCount} Total
                        </span>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                        {displayBiomarkers.length > 0 ? (
                            displayBiomarkers.map((b, i) => (
                                <div
                                    key={b.id || i}
                                    className={`flex items-center py-3 cursor-pointer hover:bg-slate-50 px-2 -mx-2 rounded-lg transition-colors group ${i !== displayBiomarkers.length - 1 ? 'border-b border-[#E8E6DF]/50' : ''}`}
                                    onClick={() => handleBiomarkerClick(b)}
                                >
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${b.status === 'optimal' ? 'bg-emerald-500' :
                                        b.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                                        }`} />

                                    <div className="flex-1 ml-3 mr-4 min-w-0">
                                        <p className="text-sm font-bold text-[#1C1917] truncate group-hover:text-sky-600 transition-colors">{b.name}</p>
                                        <p className="text-[10px] text-[#A8A29E] font-bold uppercase tracking-wider mt-0.5">{b.category}</p>
                                    </div>

                                    <div className="text-sm text-[#1C1917] font-bold whitespace-nowrap">
                                        {b.value} <span className="text-xs text-[#A8A29E] font-medium">{b.unit}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="w-8 h-8 text-[#D6D3C9] mx-auto mb-2 opacity-30" />
                                <p className="text-sm text-[#A8A29E]">No biomarkers found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column: Symptoms Reported */}
                <div className="bg-white border border-[#E8E6DF] rounded-[14px] p-6 shadow-sm h-fit">
                    <h2 className="text-[18px] font-bold text-[#1C1917] mb-4">Current Symptoms</h2>

                    {symptoms.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {symptoms.map((s, i) => (
                                <span
                                    key={i}
                                    className="bg-slate-50 text-[#57534E] text-[11px] font-bold px-3 py-1.5 rounded-full border border-[#E8E6DF] uppercase tracking-wider"
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-[#E8E6DF]">
                            <p className="text-xs text-[#A8A29E] font-medium italic">
                                No symptoms reported.
                            </p>
                        </div>
                    )}
                    
                    <Link href="/profile" className="mt-6 block">
                        <button className="w-full py-2.5 text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 rounded-[10px] border border-sky-100 transition-colors">
                            Update Symptoms Context
                        </button>
                    </Link>
                </div>
            </div>

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
        </div>
    )
}
