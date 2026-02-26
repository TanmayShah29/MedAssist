"use client";

import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { animate } from 'framer-motion';

interface HealthScoreOverviewProps {
    score: number;
    optimalCount: number;
    warningCount: number;
    criticalCount: number;
}

function getScoreLabel(score: number): { label: string; color: string; bg: string } {
    if (score >= 85) return { label: "Excellent", color: "#065F46", bg: "#ECFDF5" };
    if (score >= 70) return { label: "Good", color: "#0C4A6E", bg: "#E0F2FE" };
    if (score >= 55) return { label: "Fair", color: "#78350F", bg: "#FFFBEB" };
    return { label: "Needs Attention", color: "#991B1B", bg: "#FFF1F2" };
}

export function HealthScoreOverview({ score, optimalCount, warningCount, criticalCount }: HealthScoreOverviewProps) {
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
        const controls = animate(0, score, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate(value) {
                setDisplayScore(Math.round(value));
            }
        });
        return controls.stop;
    }, [score]);

    if (score === 0 && optimalCount === 0 && warningCount === 0 && criticalCount === 0) {
        return null;
    }

    const scoreInfo = getScoreLabel(score);

    return (
        <div className="bg-[#FAFAF7] border border-[#E8E6DF] rounded-[18px] p-6 shadow-sm h-full flex flex-col justify-center relative group">
            <h3 className="text-[10px] font-semibold uppercase text-[#A8A29E] tracking-wider mb-2 flex items-center justify-between">
                Health Stability Score
                <div className="cursor-help text-[#A8A29E] hover:text-[#57534E] relative">
                    <Info className="w-4 h-4" />
                    <div className="absolute right-0 bottom-6 w-48 p-3 bg-white border border-[#E8E6DF] shadow-md rounded-lg text-[11px] text-[#57534E] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 normal-case leading-relaxed font-normal">
                        This is a simplified stability estimate based on your lab ranges.
                    </div>
                </div>
            </h3>

            <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-display font-bold text-[#1C1917]">{displayScore}</span>
                <span className="text-[14px] text-[#A8A29E] font-medium">/ 100</span>
            </div>

            {/* Score label badge */}
            <div className="mb-4">
                <span
                    className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold"
                    style={{ color: scoreInfo.color, background: scoreInfo.bg }}
                >
                    {scoreInfo.label}
                </span>
            </div>

            <div className="space-y-2 mt-auto">
                <div className="flex justify-between items-center text-[12px]">
                    <span className="text-[#57534E] flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Optimal</span>
                    <span className="font-bold text-[#1C1917]">{optimalCount}</span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                    <span className="text-[#57534E] flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Monitor</span>
                    <span className="font-bold text-[#1C1917]">{warningCount}</span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                    <span className="text-[#57534E] flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Action</span>
                    <span className="font-bold text-[#1C1917]">{criticalCount}</span>
                </div>
            </div>
        </div>
    );
}
