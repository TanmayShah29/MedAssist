import React from 'react';
import { Info } from 'lucide-react';

interface HealthScoreOverviewProps {
    score: number;
    optimalCount: number;
    warningCount: number;
    criticalCount: number;
}

export function HealthScoreOverview({ score, optimalCount, warningCount, criticalCount }: HealthScoreOverviewProps) {
    if (score === 0 && optimalCount === 0 && warningCount === 0 && criticalCount === 0) {
        return null;
    }

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

            <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-display font-bold text-[#1C1917]">{score}</span>
                <span className="text-[14px] text-[#A8A29E] font-medium">/ 100</span>
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
