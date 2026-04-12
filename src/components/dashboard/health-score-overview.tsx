"use client";

import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { animate } from 'framer-motion';

import { Biomarker } from '@/types/medical';

interface HealthScoreOverviewProps {
    score: number;
    optimalCount: number;
    warningCount: number;
    criticalCount: number;
    biomarkers?: Biomarker[];
    onClick?: () => void;
}

function getScoreLabel(score: number): { label: string; color: string; bg: string; ring: string } {
    if (score >= 85) return { label: "Excellent", color: "#065F46", bg: "#ECFDF5", ring: "#10B981" };
    if (score >= 70) return { label: "Good", color: "#0C4A6E", bg: "#E0F2FE", ring: "#0EA5E9" };
    if (score >= 55) return { label: "Fair", color: "#78350F", bg: "#FFFBEB", ring: "#F59E0B" };
    return { label: "Needs Attention", color: "#991B1B", bg: "#FFF1F2", ring: "#EF4444" };
}

export function HealthScoreOverview({ score, optimalCount, warningCount, criticalCount, biomarkers: _biomarkers = [], onClick }: HealthScoreOverviewProps) {
    const [displayScore, setDisplayScore] = useState(0);
    const [animatedDash, setAnimatedDash] = useState(0);

    const r = 52;
    const circ = 2 * Math.PI * r;

    useEffect(() => {
        const controls = animate(0, score, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate(value) {
                setDisplayScore(Math.round(value));
                setAnimatedDash((value / 100) * circ);
            }
        });
        return controls.stop;
    }, [score, circ]);

    if (score === 0 && optimalCount === 0 && warningCount === 0 && criticalCount === 0) {
        return null;
    }

    const scoreInfo = getScoreLabel(score);

    return (
        <div
            onClick={onClick}
            className={`bg-[#FAFAF7] border border-[#E8E6DF] rounded-[18px] p-6 shadow-sm h-full flex flex-col justify-between relative group transition-all ${onClick ? 'cursor-pointer hover:border-sky-300 hover:shadow-md' : ''}`}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-semibold uppercase text-[#A8A29E] tracking-wider flex items-center gap-2">
                    Health Stability Score
                    <div className="cursor-help text-[#A8A29E] hover:text-[#57534E] relative">
                        <Info className="w-3.5 h-3.5" />
                        <div className="absolute left-0 bottom-6 w-52 p-3 bg-white border border-[#E8E6DF] shadow-md rounded-lg text-[11px] text-[#57534E] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 normal-case leading-relaxed font-normal">
                            Simplified stability estimate based on your lab ranges. Click to see breakdown.
                        </div>
                    </div>
                </h3>
                {onClick && (
                    <span className="text-[10px] font-semibold text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        See breakdown →
                    </span>
                )}
            </div>

            <div className="flex items-center gap-6">
                {/* SVG Ring Gauge */}
                <div className="relative shrink-0" style={{ width: 120, height: 120 }}>
                    <svg width={120} height={120} style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx={60} cy={60} r={r} fill="none" stroke="#E8E6DF" strokeWidth={9} />
                        <circle
                            cx={60} cy={60} r={r}
                            fill="none"
                            stroke={scoreInfo.ring}
                            strokeWidth={9}
                            strokeLinecap="round"
                            strokeDasharray={`${animatedDash} ${circ}`}
                            style={{ transition: 'stroke 0.3s ease' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-display text-3xl font-bold text-[#1C1917] leading-none">{displayScore}</span>
                        <span className="text-[10px] font-bold text-[#A8A29E] mt-0.5">/ 100</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex flex-col gap-2 grow shrink basis-0">
                    <span
                        className="inline-block self-start px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-1"
                        style={{ color: scoreInfo.color, background: scoreInfo.bg }}
                    >
                        {scoreInfo.label}
                    </span>
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
        </div>
    );
}
