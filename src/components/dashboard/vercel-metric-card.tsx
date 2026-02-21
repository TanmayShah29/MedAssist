"use client"

import { motion } from "framer-motion"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface VercelMetricCardProps {
    label: string
    value: string | number
    trend?: {
        value: number
        direction: 'up' | 'down' | 'neutral'
    }
    subtext?: string
    icon?: React.ReactNode
    status?: 'optimal' | 'warning' | 'critical'
}

export function VercelMetricCard({ label, value, trend, subtext, icon, status }: VercelMetricCardProps) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className={cn(
                "group bg-white border border-slate-200 rounded-[14px] p-6 relative overflow-hidden transition-all duration-300",
                "hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300",
                status === 'optimal' && "hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]",
                status === 'warning' && "hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]",
                status === 'critical' && "hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]"
            )}
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">{label}</h3>
                {icon && <div className="text-slate-400 group-hover:text-slate-600 transition-colors">{icon}</div>}
            </div>

            <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-semibold text-slate-900 tracking-tight">{value}</span>
                {trend && (
                    <div className={cn(
                        "flex items-center text-xs font-medium",
                        trend.direction === 'up' ? "text-[#10B981]" :
                            trend.direction === 'down' ? "text-[#EF4444]" : "text-slate-400"
                    )}>
                        {trend.direction === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> :
                            trend.direction === 'down' ? <ArrowDownRight className="w-3 h-3 mr-1" /> :
                                <Minus className="w-3 h-3 mr-1" />}
                        {Math.abs(trend.value)}%
                    </div>
                )}
            </div>

            {subtext && (
                <p className="text-[13px] text-slate-500 group-hover:text-slate-700 transition-colors">
                    {subtext}
                </p>
            )}

            {/* Status Indicator (Vercel style) */}
            {status && (
                <div className={cn(
                    "absolute top-6 right-6 w-2 h-2 rounded-full",
                    status === 'optimal' ? "bg-[#10B981]" :
                        status === 'warning' ? "bg-[#F59E0B]" : "bg-[#EF4444]"
                )} />
            )}
        </motion.div>
    )
}
