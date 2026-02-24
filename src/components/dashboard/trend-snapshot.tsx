import React from 'react';
import { Biomarker, LabResult } from '@/types/medical';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

interface TrendSnapshotProps {
    latestBiomarkers: Biomarker[];
    history: Biomarker[];
    latestLabResult?: LabResult;
}

export function TrendSnapshot({ latestBiomarkers, history, latestLabResult }: TrendSnapshotProps) {
    // If only 1 lab result or no history to compare against
    const hasHistory = history.some(b => b.lab_result_id !== latestLabResult?.id);

    if (!hasHistory || latestBiomarkers.length === 0) {
        return (
            <div className="bg-[#FAFAF7] border border-[#E8E6DF] rounded-[18px] p-6 flex items-center justify-center text-center shadow-sm h-full min-h-[160px]">
                <div>
                    <Activity className="w-8 h-8 text-[#A8A29E] mx-auto mb-3 opacity-50" />
                    <h3 className="text-[15px] font-bold text-[#57534E] mb-1">Upload another report</h3>
                    <p className="text-[13px] text-[#A8A29E]">Track trends over time with multiple reports.</p>
                </div>
            </div>
        );
    }

    // Get up to 3 interesting biomarkers to show trend
    const trends = latestBiomarkers
        .map(current => {
            const previous = history.find(b => b.name === current.name && b.lab_result_id !== latestLabResult?.id);
            if (!previous) return null;

            const diff = current.value - previous.value;
            if (diff === 0) return { name: current.name, status: 'stable', label: 'Stable', icon: Minus, color: 'text-amber-500' };

            // Determine if increase/decrease is good or bad simply by looking at status change or just directional
            // A simple approach: 
            const _isImprovement = (current.status === 'optimal' && previous.status !== 'optimal') ||
                (diff > 0 && current.status === 'optimal'); // This is a simplification. 
            // Truly knowing if improved is hard without knowing the specific marker.
            // Let's just state Increased/Decreased/Stable objectively, but style it.

            const direction = diff > 0 ? 'Increased' : 'Decreased';
            const icon = diff > 0 ? TrendingUp : TrendingDown;

            // If it's optimal now, that's good. Else neutral/warning.
            let color = 'text-[#57534E]';
            if (current.status === 'optimal' && diff !== 0) color = 'text-emerald-500';
            else if (current.status === 'critical') color = 'text-red-500';

            return { name: current.name, label: direction, icon, color };
        })
        .filter(Boolean)
        .slice(0, 4); // Show up to 4

    return (
        <div className="bg-[#FAFAF7] border border-[#E8E6DF] rounded-[18px] p-6 shadow-sm h-full">
            <h3 className="text-[10px] font-semibold uppercase text-[#A8A29E] tracking-wider mb-4">Trend Snapshot</h3>
            <div className="space-y-3">
                {trends.map((item, idx) => {
                    if (!item) return null;
                    const Icon = item.icon;
                    return (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-[#E8E6DF]/50 last:border-0">
                            <span className="text-[14px] font-bold text-[#1C1917]">{item.name}</span>
                            <div className={`flex items-center gap-1.5 text-[13px] font-semibold ${item.color}`}>
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
