"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, TrendingUp, TrendingDown, Info, Lightbulb, Activity } from "lucide-react"
import { WellnessTrendChart } from "@/components/charts/wellness-trend-chart"
import { tokens } from "@/lib/design-tokens"

interface BiomarkerDrilldownProps {
    isOpen: boolean
    onClose: () => void
    biomarker: {
        name: string
        value: number
        unit: string
        status: "optimal" | "warning" | "critical"
        aiInterpretation: string
        referenceMin: number | null
        referenceMax: number | null
    } | null
}

export function BiomarkerDrilldown({ isOpen, onClose, biomarker }: BiomarkerDrilldownProps) {
    const [trends, setTrends] = useState<{ date: string; score: number }[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (isOpen && biomarker) {
            fetchTrends(biomarker.name)
        }
    }, [isOpen, biomarker])

    async function fetchTrends(name: string) {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/biomarker-trends?name=${encodeURIComponent(name)}`)
            const data = await res.json()
            if (data.trends) {
                // Mapping 'value' to 'score' for the WellnessTrendChart component
                setTrends(data.trends.map((t: any) => ({
                    date: t.date,
                    score: t.value
                })))
            }
        } catch (err) {
            console.error("Failed to fetch trends", err)
        } finally {
            setIsLoading(false)
        }
    }

    if (!biomarker) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-lg bg-[#FAFAF7] shadow-2xl z-[60] overflow-y-auto"
                    >
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-[#1C1917]">{biomarker.name}</h2>
                                        <p className="text-sm text-[#57534E]">Biomarker Analysis</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            {/* Current Value Card */}
                            <div className="bg-white border border-[#E8E6DF] rounded-2xl p-6 mb-6 shadow-sm">
                                <div className="flex items-end gap-2 mb-4">
                                    <span className="text-4xl font-bold text-[#1C1917]">{biomarker.value}</span>
                                    <span className="text-lg text-[#A8A29E] pb-1">{biomarker.unit}</span>
                                    <div className={`ml-auto px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                        ${biomarker.status === 'optimal' ? 'bg-emerald-50 text-emerald-600' :
                                            biomarker.status === 'warning' ? 'bg-amber-50 text-amber-600' :
                                                'bg-red-50 text-red-600'}`}>
                                        {biomarker.status}
                                    </div>
                                </div>

                                {biomarker.referenceMin !== null && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium text-[#A8A29E]">
                                            <span>Ref: {biomarker.referenceMin} - {biomarker.referenceMax}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full relative overflow-hidden">
                                            {/* Simple Range Indicator */}
                                            <div
                                                className={`absolute h-full rounded-full ${biomarker.status === 'optimal' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                style={{
                                                    left: '10%',
                                                    width: '80%',
                                                    opacity: 0.2
                                                }}
                                            />
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "50%" }} // Placeholder logic for range position
                                                className="absolute h-full bg-sky-500 rounded-full shadow-[0_0_8px_rgba(14,165,233,0.5)]"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Trend Chart */}
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-[#1C1917] mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-sky-500" />
                                    Historical Trend
                                </h3>
                                {isLoading ? (
                                    <div className="h-48 bg-slate-50 rounded-2xl flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
                                    </div>
                                ) : trends.length > 1 ? (
                                    <WellnessTrendChart data={trends} className="col-span-1" />
                                ) : (
                                    <div className="h-48 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                                        <Info className="w-8 h-8 mb-2 opacity-20" />
                                        <p className="text-sm">Not enough data to show a trend yet. Upload more reports to see progress!</p>
                                    </div>
                                )}
                            </div>

                            {/* AI Insights */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4 text-amber-500" />
                                    AI Interpretation
                                </h3>
                                <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5">
                                    <p className="text-[#57534E] text-sm leading-relaxed">
                                        {biomarker.aiInterpretation}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white border border-[#E8E6DF] p-4 rounded-lg">
                                        <p className="text-[10px] font-bold text-[#A8A29E] uppercase mb-1">Impact</p>
                                        <p className="text-xs text-[#1C1917] font-medium">Affects metabolic health and energy levels.</p>
                                    </div>
                                    <div className="bg-white border border-[#E8E6DF] p-4 rounded-lg">
                                        <p className="text-[10px] font-bold text-[#A8A29E] uppercase mb-1">Recommendation</p>
                                        <p className="text-xs text-[#1C1917] font-medium">Monitor intake and re-test in 3 months.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-[#FAFAF7]/80 backdrop-blur-md border-t border-[#E8E6DF] p-6 mt-auto">
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-[#1C1917] text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
