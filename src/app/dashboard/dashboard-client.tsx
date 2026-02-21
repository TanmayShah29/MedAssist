'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
    ClipboardList,
    AlertCircle,
    CheckCircle,
    Activity,
    FileText,
    Upload,
    PlayCircle,
    Printer,
    ChevronRight,
    Info,
    WifiOff,
    Brain,
    Pill
} from 'lucide-react'
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
import { deleteLabResult } from '@/app/actions/user-data'
import { AIInsightsFeed } from '@/components/dashboard/ai-insights-feed'
import { ActionItems } from '@/components/dashboard/action-items'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { StatusDistributionChart } from '@/components/dashboard/status-distribution-chart'
import { DoctorQuestions } from '@/components/dashboard/doctor-questions'
import { MedicineCabinet } from '@/components/dashboard/medicine-cabinet'
import { TrustLayer } from '@/components/trust-layer'
import { toast } from 'sonner'
import { DEMO_HISTORY, DEMO_LAB_RESULT } from '@/lib/demo-data'
import { Biomarker, Profile } from '@/types/medical'

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
function TrendChart({ labResults, biomarkers, supplements = [] }: { labResults: any[], biomarkers: Biomarker[], supplements?: any[] }) {
    const [selectedBiomarker, setSelectedBiomarker] = useState<string>('Health Score');

    if (labResults.length < 1) return null;

    // Get unique biomarker names that appear in at least 2 reports for trending
    const biomarkerNames = Array.from(new Set(biomarkers.map(b => b.name)));
    const trendableBiomarkers = biomarkerNames.filter(name =>
        biomarkers.filter(b => b.name === name).length >= 2
    );

    const chartData = labResults.map(report => {
        const reportDate = new Date(report.uploaded_at || report.created_at);
        const date = reportDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });

        const dataPoint: any = { date, originalDate: reportDate };

        if (selectedBiomarker === 'Health Score') {
            dataPoint.value = report.health_score || 0;
        } else {
            const b = biomarkers.find(bm => bm.lab_result_id === report.id && bm.name === selectedBiomarker);
            dataPoint.value = b ? b.value : null;
            dataPoint.unit = b?.unit;
        }

        // Add supplement info if started on this date
        const supp = supplements.find(s => {
            const sDate = new Date(s.start_date);
            return sDate.toLocaleDateString() === reportDate.toLocaleDateString();
        });
        if (supp) dataPoint.supplement = supp.name;

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
                                    const supp = payload[0].payload.supplement;
                                    return (
                                        <div style={{
                                            background: '#FAFAF7',
                                            border: '1px solid #E8E6DF',
                                            borderRadius: 8,
                                            padding: '8px 12px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}>
                                            <p style={{ fontSize: 10, color: '#A8A29E', margin: '0 0 4px 0' }}>{payload[0].payload.date}</p>
                                            <div className="flex flex-col gap-1">
                                                <p style={{ fontSize: 14, fontWeight: 700, color: '#1C1917', margin: 0 }}>
                                                    {payload[0].value} <span style={{ fontSize: 11, fontWeight: 400, color: '#57534E' }}>{displayUnit}</span>
                                                </p>
                                                {supp && (
                                                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                                                        <Pill size={10} className="text-rose-500" />
                                                        <span className="text-[10px] font-bold text-rose-600 uppercase">Started: {supp}</span>
                                                    </div>
                                                )}
                                            </div>
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
                            dot={(props: any) => {
                                const { cx, cy, payload } = props;
                                if (payload.supplement) {
                                    return (
                                        <g key={props.key}>
                                            <circle cx={cx} cy={cy} r={6} fill="#F43F5E" stroke="white" strokeWidth={2} />
                                            <path d={`M${cx} ${cy - 15} L${cx} ${cy}`} stroke="#F43F5E" strokeWidth={1} strokeDasharray="2 2" />
                                        </g>
                                    );
                                }
                                return <circle key={props.key} cx={cx} cy={cy} r={4} fill="#0EA5E9" stroke="white" strokeWidth={2} />;
                            }}
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
    const searchParams = useSearchParams()
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
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [supplements, setSupplements] = useState<any[]>([]);

    useEffect(() => {
        const fetchSupps = async () => {
            try {
                const res = await fetch('/api/supplements');
                const data = await res.json();
                if (data.supplements) setSupplements(data.supplements);
            } catch (err) {
                console.error("Failed to fetch supplements", err);
            }
        };
        fetchSupps();
    }, []);

    // Open upload modal when arriving with ?openUpload=1 (e.g. from Results "Upload New Report")
    useEffect(() => {
        if (searchParams.get('openUpload') === '1') {
            setShowUploadModal(true);
            router.replace('/dashboard', { scroll: false });
        }
    }, [searchParams, router]);

    // Derived Data taking Demo Mode into account
    const displayLabResults = demoMode
        ? [DEMO_LAB_RESULT, ...initialLabResults]
        : initialLabResults;

    const displayBiomarkers = demoMode
        ? [...DEMO_HISTORY, ...initialBiomarkers]
        : initialBiomarkers;

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

    // Derived values - use latestBiomarkers for current state summary
    const optimalCount = latestBiomarkers.filter(b => b.status === 'optimal').length
    const warningCount = latestBiomarkers.filter(b => b.status === 'warning').length
    const criticalCount = latestBiomarkers.filter(b => b.status === 'critical').length
    const totalCount = latestBiomarkers.length

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

    const priorities = [...latestBiomarkers]
        .sort((a, b) => {
            const order = { critical: 0, warning: 1, optimal: 2 }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (order[a.status as keyof typeof order] ?? 1) - (order[b.status as keyof typeof order] ?? 1)
        })
        .slice(0, 3)

    // Removed loading skeleton since data is passed directly from server

    return (
        <div className="min-h-screen bg-[#FAFAF7] p-6 text-[#1C1917] font-sans" id="dashboard-content">

            {/* ── Print-only Header ── */}
            <div className="hidden print:flex items-center justify-between border-b-2 border-black pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-tight">MedAssist Health Overview</h1>
                    <p className="text-sm font-medium mt-1">Summary of Clinical Biomarkers & Wellness Trends</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold" suppressHydrationWarning>DATE: {new Date().toLocaleDateString('en-US')}</p>
                    <p className="text-xs">Patient: {profile?.first_name} {profile?.last_name}</p>
                </div>
            </div>

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
                    <p className="text-[15px] text-[#57534E]">
                        {initialLabResults.length > 0 ? 'Welcome back, ' : 'Welcome, '}
                        {profile?.first_name || 'Patient'}
                    </p>
                    <TrustLayer variant="compact" className="mt-2" />
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrint}
                        className="p-2.5 bg-white border border-[#E8E6DF] rounded-[12px] text-[#57534E] hover:bg-gray-50 transition-all shadow-sm print:hidden"
                        title="Print Report"
                    >
                        <Printer className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#0EA5E9] text-white rounded-[12px] text-[14px] font-bold hover:bg-[#0284C7] transition-all shadow-md shadow-sky-500/20"
                    >
                        <Upload className="w-4 h-4" />
                        Upload
                    </button>
                </div>
            </div>

            {/* ── Demo mode banner: avoid mistaking sample data for real data ── */}
            {demoMode && (
                <div className="mb-6 flex items-center justify-between gap-4 rounded-[12px] border-2 border-amber-300 bg-amber-50 px-4 py-3 print:hidden">
                    <p className="text-sm font-semibold text-amber-900">
                        You&apos;re viewing <strong>sample data</strong> — not your personal results. Health score and biomarkers below are for demo only.
                    </p>
                    <button
                        onClick={() => setDemoMode(false)}
                        className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
                    >
                        Show my data
                    </button>
                </div>
            )}

            {/* ── Developer Tools Overlay (Subtle) ── */}
            <div className="fixed bottom-24 right-6 z-[45] flex flex-col gap-2 print:hidden">
                <button
                    onClick={() => setDemoMode(!demoMode)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all shadow-lg ${demoMode
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-[#A8A29E] border border-[#E8E6DF] hover:text-[#57534E]'
                        }`}
                    title="Toggle Demo Mode"
                >
                    <PlayCircle size={20} />
                </button>
                <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#E8E6DF] transition-all shadow-lg ${debugMode ? 'text-sky-500 border-sky-200' : 'text-[#A8A29E]'}`}
                    title="Toggle Debug Info"
                >
                    <input
                        type="checkbox"
                        checked={debugMode}
                        onChange={(e) => setDebugMode(e.target.checked)}
                        className="w-4 h-4 accent-sky-500 cursor-pointer"
                    />
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
                                cursor: 'pointer'
                            }}
                        >
                            Upload my first report
                        </button>
                        <button
                            onClick={() => setDemoMode(true)}
                            className="flex items-center gap-2 px-4 py-3 rounded-[10px] border-2 border-sky-500 text-sky-600 font-semibold text-[15px] hover:bg-sky-50 transition-colors"
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
                <div className="bg-sky-500 rounded-[18px] p-8 mb-6 text-white relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                        {/* Left: Score Box */}
                        <div className="flex flex-col">
                            <button
                                onClick={() => setShowScoreModal(true)}
                                className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-white/70 tracking-wider mb-2 hover:text-white transition-colors w-fit"
                            >
                                HEALTH SCORE
                                <Info size={12} />
                            </button>
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
                    <TrendChart labResults={labResults} biomarkers={biomarkers} supplements={supplements} />
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

            {/* ── Doctor Questions ── */}
            {totalCount > 0 && (
                <div className="mb-6">
                    <h3 className="text-[10px] font-semibold uppercase text-[#A8A29E] mb-4 tracking-wider">PREPARATION & CARE</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DoctorQuestions biomarkers={displayBiomarkers} />
                        <MedicineCabinet />
                    </div>
                </div>
            )}

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
                        {latestBiomarkers.length > 0 ? (
                            latestBiomarkers.map((b, i) => (
                                <div
                                    key={b.id || i}
                                    className={`flex items-center py-3 cursor-pointer hover:bg-slate-50 px-2 -mx-2 rounded-lg transition-colors group ${i !== latestBiomarkers.length - 1 ? 'border-b border-[#E8E6DF]/50' : ''}`}
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

            {/* ── Score Methodology Modal ── */}
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
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full -mr-16 -mt-16 opacity-50" />

                            <h3 className="text-2xl font-bold text-[#1C1917] mb-4 relative">Scoring Methodology</h3>
                            <p className="text-sm text-[#57534E] mb-6 relative">
                                Your health score is an optimistic calculation designed to provide clinical clarity while rewarding healthy biomarkers.
                            </p>

                            <div className="space-y-4 relative mb-8">
                                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <span className="text-xs font-bold text-emerald-700 uppercase">Optimal Value</span>
                                    <span className="text-sm font-bold text-emerald-700">+100 pts</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                                    <span className="text-xs font-bold text-amber-700 uppercase">Monitor (Warning)</span>
                                    <span className="text-sm font-bold text-amber-700">+75 pts</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                                    <span className="text-xs font-bold text-red-700 uppercase">Action Needed</span>
                                    <span className="text-sm font-bold text-red-700">+40 pts</span>
                                </div>
                            </div>

                            <div className="p-4 bg-[#F5F4EF] rounded-xl border border-[#E8E6DF] mb-6">
                                <p className="text-[11px] leading-relaxed text-[#57534E]">
                                    <strong>The Optimism Rule:</strong> If your report contains at least one Optimal biomarker, your score cannot fall below 50. This prevents minor deviations from being demoralizing while still highlighting areas for focus.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowScoreModal(false)}
                                className="w-full py-3 bg-[#1C1917] text-white rounded-xl font-bold hover:bg-black transition-all"
                            >
                                Understood
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
        </div>
    )
}
