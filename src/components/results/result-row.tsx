"use client"

import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ResultRowProps {
    name: string
    value: number
    unit: string
    range: { min: number, max: number }
    status: 'optimal' | 'warning' | 'critical' | 'monitor'
    date: Date
    isSelected?: boolean
    onClick?: () => void
}

export function ResultRow({ name, value, unit, range, status, date, isSelected, onClick }: ResultRowProps) {
    // Calculate position in range bar (clamped 0-100)
    // Assuming range.min is 20% and range.max is 80% of the bar visual
    const totalRange = range.max * 1.5; // Arbitrary visualization scale
    const percentage = Math.min(Math.max((value / totalRange) * 100, 0), 100);

    return (
        <motion.div
            onClick={onClick}
            className={cn(
                "group flex items-center h-[44px] px-4 border-b border-slate-200 cursor-pointer transition-colors relative",
                isSelected ? "bg-slate-100" : "hover:bg-slate-50 bg-white"
            )}
        >
            {/* Selected Indicator */}
            {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#10B981]" />
            )}

            {/* Status Dot */}
            <div className="w-6 flex items-center justify-center mr-2">
                <div className={cn(
                    "w-2 h-2 rounded-full",
                    status === 'optimal' ? "bg-[#10B981]" :
                        status === 'warning' ? "bg-[#F59E0B]" :
                            status === 'critical' ? "bg-[#EF4444]" : "bg-[#0EA5E9]" // Sky-500
                )} />
            </div>

            {/* Name */}
            <div className="w-[180px] text-sm text-slate-900 font-medium truncate">
                {name}
            </div>

            {/* Range Bar (Mini) */}
            <div className="flex-1 px-4 flex items-center">
                <div className="h-1 w-[120px] bg-slate-200 rounded-full relative overflow-hidden">
                    {/* Range zone (min to max) - simplified viz */}
                    <div
                        className="absolute top-0 bottom-0 bg-slate-300"
                        style={{
                            left: `${(range.min / totalRange) * 100}%`,
                            width: `${((range.max - range.min) / totalRange) * 100}%`
                        }}
                    />
                    {/* Value Marker */}
                    <div
                        className={cn(
                            "absolute top-0 bottom-0 w-1.5 rounded-full",
                            status === 'optimal' ? "bg-[#10B981]" :
                                status === 'warning' ? "bg-[#F59E0B]" : "bg-[#EF4444]"
                        )}
                        style={{ left: `${percentage}%` }}
                    />
                </div>
            </div>

            {/* Value */}
            <div className="w-[100px] text-right text-sm font-medium">
                <span className={cn(
                    status === 'optimal' ? "text-slate-600" :
                        status === 'warning' ? "text-[#F59E0B]" :
                            status === 'critical' ? "text-[#EF4444]" : "text-[#0EA5E9]"
                )}>{value}</span>
                <span className="text-xs text-slate-400 ml-1">{unit}</span>
            </div>

            {/* Chevron */}
            <div className="w-8 flex items-center justify-end">
                <ChevronRight className={cn(
                    "w-4 h-4 text-slate-400 transition-transform",
                    isSelected && "rotate-90 text-slate-600"
                )} />
            </div>
        </motion.div>
    )
}
