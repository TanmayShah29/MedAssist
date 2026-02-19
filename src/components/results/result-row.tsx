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
    isSelected?: boolean
    onClick?: () => void
}

export function ResultRow({ name, value, unit, range, status, isSelected, onClick }: ResultRowProps) {
    // Calculate position in range bar (clamped 0-100)
    const totalRange = range.max * 1.5;
    const percentage = Math.min(Math.max((value / totalRange) * 100, 0), 100);

    return (
        <motion.div
            onClick={onClick}
            className={cn(
                "group flex items-center h-[56px] px-5 border-b border-[#E8E6DF] cursor-pointer transition-all relative",
                isSelected ? "bg-[#EFECE5]" : "hover:bg-[#EFEDE6] bg-white"
            )}
        >
            {/* Selected Indicator */}
            {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-sky-500" />
            )}

            {/* Status Dot */}
            <div className="w-8 flex items-center justify-center mr-2">
                <div className={cn(
                    "w-2.5 h-2.5 rounded-full shadow-sm",
                    status === 'optimal' ? "bg-emerald-500" :
                        status === 'warning' ? "bg-amber-500" :
                            status === 'critical' ? "bg-red-500" : "bg-sky-500"
                )} />
            </div>

            {/* Name */}
            <div className="w-[200px] text-sm text-[#1C1917] font-semibold truncate">
                {name}
            </div>

            {/* Range Bar (Mini) */}
            <div className="flex-1 px-6 flex items-center">
                <div className="h-1.5 w-full max-w-[140px] bg-[#E8E6DF] rounded-full relative overflow-hidden">
                    {/* Range zone */}
                    <div
                        className="absolute top-0 bottom-0 bg-[#D6D3C9]"
                        style={{
                            left: `${(range.min / totalRange) * 100}%`,
                            width: `${((range.max - range.min) / totalRange) * 100}%`
                        }}
                    />
                    {/* Value Marker */}
                    <div
                        className={cn(
                            "absolute top-0 bottom-0 w-2 rounded-full shadow-sm",
                            status === 'optimal' ? "bg-emerald-500" :
                                status === 'warning' ? "bg-amber-500" : "bg-red-500"
                        )}
                        style={{ left: `${percentage}%` }}
                    />
                </div>
            </div>

            {/* Value */}
            <div className="w-[120px] text-right text-sm font-semibold">
                <span className={cn(
                    status === 'optimal' ? "text-[#57534E]" :
                        status === 'warning' ? "text-amber-600" :
                            status === 'critical' ? "text-red-600" : "text-sky-600"
                )}>{value}</span>
                <span className="text-xs text-[#A8A29E] ml-1.5 font-medium">{unit}</span>
            </div>

            {/* Chevron */}
            <div className="w-8 flex items-center justify-end">
                <ChevronRight className={cn(
                    "w-4 h-4 text-[#A8A29E] transition-transform duration-300",
                    isSelected ? "rotate-90 text-[#1C1917]" : "group-hover:text-[#57534E]"
                )} />
            </div>
        </motion.div>
    )
}
