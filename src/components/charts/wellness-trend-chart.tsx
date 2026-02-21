"use client"

import { useTheme } from "next-themes"
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    ReferenceLine,
    ReferenceDot,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
// Phase 7: Add Framer Motion and state for filters
import { motion } from "framer-motion"
import { useState } from "react"
import { Pill } from "lucide-react"

const timeFilters = ['3M', '6M', '1Y', 'ALL'] as const;

interface Supplement {
    id: number;
    name: string;
    start_date: string;
}

interface WellnessTrendChartProps {
    data: { date: string; score: number; ideal?: number }[]
    supplements?: Supplement[]
    className?: string
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; payload: { ideal?: number; supplement?: string } }>;
    label?: string;
}

// Custom animated tooltip
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload?.[0]) return null;

    const supplement = payload[0].payload.supplement;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            // Glassmorphism style - Light Mode
            className="rounded-lg border bg-white/90 backdrop-blur-md p-4 shadow-xl ring-1 ring-slate-200/50 z-50"
        >
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[0.65rem] uppercase text-slate-400 font-bold">
                            Wellness Score
                        </span>
                        <span className="text-2xl font-bold bg-gradient-to-br from-sky-500 to-sky-700 bg-clip-text text-transparent">
                            {payload[0].value}
                        </span>
                    </div>
                    {payload[0].payload.ideal && (
                        <div className="flex flex-col border-l pl-4 border-slate-200">
                            <span className="text-[0.65rem] uppercase text-slate-400 font-bold">
                                Target
                            </span>
                            <span className="text-2xl font-bold text-slate-300">
                                {payload[0].payload.ideal}
                            </span>
                        </div>
                    )}
                </div>

                {supplement && (
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                        <Pill size={12} className="text-rose-500" />
                        <span className="text-xs font-medium text-rose-600">Started: {supplement}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export function WellnessTrendChart({ data, supplements = [], className }: WellnessTrendChartProps) {
    useTheme() // Call useTheme to ensure hook rules are followed, but don't destructure theme
    const [filter, setFilter] = useState<typeof timeFilters[number]>('6M');

    // Enrich data with supplements
    const enrichedData = data.map(item => {
        const itemDate = new Date(item.date);
        // Find supplement started on this date (or closest to it for visualization)
        const supp = supplements.find(s => {
            const sDate = new Date(s.start_date);
            // Simple match for same day/month for mock/demo purposes
            // In real app, we might want more complex logic to snap to chart points
            return sDate.toLocaleDateString() === itemDate.toLocaleDateString();
        });

        return {
            ...item,
            supplement: supp?.name
        };
    });

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={cn("col-span-4", className)}
        >
            <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-slate-50">
                {/* Animated background glow effect (subtle) */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 blur-3xl rounded-full pointer-events-none" />

                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div className="space-y-1">
                        <CardTitle className="text-slate-900">Wellness Trend</CardTitle>
                        <p className="text-sm text-slate-500">Trajectory over time</p>
                    </div>

                    {/* Animated filter buttons */}
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                        {timeFilters.map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setFilter(tf)}
                                className={cn(
                                    'relative px-3 py-1 text-xs font-medium transition-colors rounded-md z-10',
                                    filter === tf ? 'text-white' : 'text-slate-500 hover:text-slate-900'
                                )}
                            >
                                {filter === tf && (
                                    <motion.div
                                        layoutId="activeFilter"
                                        className="absolute inset-0 bg-sky-500 rounded-md -z-10 shadow-sm"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                {tf}
                            </button>
                        ))}
                    </div>
                </CardHeader>

                <CardContent className="pl-0 relative min-h-[220px]">
                    <div className="absolute inset-0 w-full h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={enrichedData}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} />
                                    </linearGradient>
                                    {/* Phase 7: Glow filter for the line */}
                                    <filter id="glow" height="200%">
                                        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    stroke="#94A3B8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#94A3B8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}%`}
                                    domain={[50, 100]}
                                    dx={-10}
                                />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} stroke="#000000" />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ stroke: '#0EA5E9', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 }}
                                />

                                {enrichedData.map((entry, index) => (
                                    entry.supplement ? (
                                        <ReferenceLine
                                            key={`line-${index}`}
                                            x={entry.date}
                                            stroke="#F43F5E"
                                            strokeDasharray="3 3"
                                            strokeWidth={1}
                                        />
                                    ) : null
                                ))}

                                {enrichedData.map((entry, index) => (
                                    entry.supplement ? (
                                        <ReferenceDot
                                            key={`dot-${index}`}
                                            x={entry.date}
                                            y={entry.score}
                                            r={4}
                                            fill="#F43F5E"
                                            stroke="#fff"
                                            strokeWidth={2}
                                        />
                                    ) : null
                                ))}

                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#0EA5E9"
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                    strokeWidth={2}
                                    filter="url(#glow)" // Apply glow
                                    animationDuration={2000} // Slower, smoother draw
                                    animationEasing="ease-out"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
