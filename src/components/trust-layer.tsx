'use client';

import { Shield, AlertTriangle, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustLayerProps {
    variant?: 'compact' | 'full';
    className?: string;
}

/** Medical AI trust layer: privacy, limitations, educational use. */
export function TrustLayer({ variant = 'full', className }: TrustLayerProps) {
    if (variant === 'compact') {
        return (
            <div
                className={cn(
                    'flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#78716C]',
                    className
                )}
            >
                <span className="flex items-center gap-1.5">
                    <Shield size={12} className="text-emerald-600" />
                    Delete reports and export your data anytime.
                </span>
                <span className="flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-amber-600" />
                    Educational only. AI can make mistakes; use urgent care for urgent symptoms.
                </span>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'rounded-[14px] border border-[#E8E6DF] bg-[#FAFAF7] p-4 space-y-3',
                className
            )}
        >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#78716C]">
                Important information
            </p>
            <ul className="space-y-2 text-[13px] text-[#57534E]">
                <li className="flex items-start gap-2">
                    <Shield size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                    <span>
                        <strong className="text-[#1C1917]">Privacy:</strong> Your reports are saved only to your account, with controls to export data, delete reports, or delete your account.
                    </span>
                </li>
                <li className="flex items-start gap-2">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                    <span>
                        <strong className="text-[#1C1917]">AI limitations:</strong> AI can make mistakes. MedAssist explains values and prepares questions; it does not diagnose, prescribe, or replace your clinician.
                    </span>
                </li>
                <li className="flex items-start gap-2">
                    <BookOpen size={16} className="shrink-0 mt-0.5 text-sky-600" />
                    <span>
                        <strong className="text-[#1C1917]">Urgent symptoms:</strong> For chest pain, severe shortness of breath, fainting, confusion, stroke symptoms, or severe weakness, seek urgent or emergency care.
                    </span>
                </li>
            </ul>
        </div>
    );
}
