import React from 'react';
import { Biomarker } from '@/types/medical';
import { AlertCircle, CheckCircle, MessageSquare, ClipboardList } from 'lucide-react';
import Link from 'next/link';

interface PriorityAlertCardProps {
    biomarkers: Biomarker[];
}

export function PriorityAlertCard({ biomarkers }: PriorityAlertCardProps) {
    const criticalMarkers = biomarkers.filter(b => b.status === 'critical');

    if (criticalMarkers.length === 0) {
        return (
            <div className="bg-[#FAFAF7] border border-[#E8E6DF] rounded-[18px] p-6 flex flex-col md:flex-row items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-lg font-display font-bold text-[#1C1917] mb-1 break-words">Everything looks stable.</h3>
                    <p className="text-sm text-[#57534E] break-words">Your one-pager is still useful for confirming what to monitor next at your visit.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border-2 border-red-100 rounded-[18px] p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-50 z-0" />

            <div className="relative z-10 flex flex-col xl:flex-row gap-6 items-start xl:items-center">
                <div className="grow shrink basis-0 min-w-0">
                    <div className="flex items-center gap-3 mb-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <h3 className="text-xl font-display font-bold text-[#1C1917] break-words">Immediate Attention Recommended</h3>
                    </div>

                    <p className="text-sm text-[#57534E] mb-4 break-words">
                        The following biomarkers are out of optimal range and should be part of your appointment agenda:
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4 xl:mb-0">
                        {criticalMarkers.map(marker => (
                            <div key={marker.id || marker.name} className="px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg text-sm font-medium text-red-700 break-words min-w-0">
                                {marker.name} <span className="text-red-400 font-normal ml-1">{marker.value} {marker.unit}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row xl:flex-col gap-3 shrink-0 w-full xl:w-auto">
                    <Link
                        href={`/assistant?context=${criticalMarkers[0].name}`}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1C1917] text-white rounded-[12px] text-sm font-bold hover:bg-black transition-all shadow-md active:scale-[0.98]"
                    >
                        <MessageSquare className="w-4 h-4" />
                        Rehearse Visit Summary
                    </Link>
                    <button
                        onClick={() => {
                            document.getElementById('doctor-prep-sheet')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[#E8E6DF] text-[#1C1917] rounded-[12px] text-sm font-bold hover:bg-[#F5F4EF] transition-all active:scale-[0.98]"
                    >
                        <ClipboardList className="w-4 h-4" />
                        View Prep Sheet
                    </button>
                </div>
            </div>
        </div>
    );
}
