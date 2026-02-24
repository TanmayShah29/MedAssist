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
                <div>
                    <h3 className="text-lg font-display font-bold text-[#1C1917] mb-1">Everything looks stable.</h3>
                    <p className="text-sm text-[#57534E]">Continue your current monitoring routine. No immediate clinical action is required.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border-2 border-red-100 rounded-[18px] p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-50 z-0" />

            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <h3 className="text-xl font-display font-bold text-[#1C1917]">Immediate Attention Recommended</h3>
                    </div>

                    <p className="text-sm text-[#57534E] mb-4">
                        The following biomarkers are out of optimal range and require clinical review:
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
                        {criticalMarkers.map(marker => (
                            <div key={marker.id || marker.name} className="px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg text-sm font-medium text-red-700">
                                {marker.name} <span className="text-red-400 font-normal ml-1">{marker.value} {marker.unit}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto">
                    <Link
                        href={`/assistant?context=${criticalMarkers[0].name}`}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1C1917] text-white rounded-[12px] text-sm font-bold hover:bg-black transition-all shadow-md active:scale-[0.98]"
                    >
                        <MessageSquare className="w-4 h-4" />
                        Discuss With Assistant
                    </Link>
                    <button
                        onClick={() => {
                            // Scroll to Doctor Questions section smoothly
                            document.getElementById('doctor-questions-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[#E8E6DF] text-[#1C1917] rounded-[12px] text-sm font-bold hover:bg-[#F5F4EF] transition-all active:scale-[0.98]"
                    >
                        <ClipboardList className="w-4 h-4" />
                        Prepare Doctor Questions
                    </button>
                </div>
            </div>
        </div>
    );
}
