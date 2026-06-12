import { AlertTriangle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MedicalDisclaimerProps {
    variant?: 'standard' | 'compact';
    className?: string;
}

export function MedicalDisclaimer({ variant = 'standard', className }: MedicalDisclaimerProps) {
    if (variant === 'compact') {
        return (
            <p
                className={cn(
                    'text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2',
                    className
                )}
                role="status"
            >
                This information is for educational purposes only. Discuss all results with your clinician.
            </p>
        );
    }

    return (
        <div
            className={cn(
                'rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2',
                className
            )}
            role="status"
        >
            <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0 text-amber-700" />
                <p className="text-sm font-semibold text-amber-900">
                    Medical Disclaimer
                </p>
            </div>
            <p className="text-sm text-amber-800 leading-relaxed">
                MedAssist is a patient education and visit-preparation tool. The information provided
                is based on AI analysis of your lab reports and is <strong>not a medical diagnosis</strong>.
                Always consult a qualified healthcare professional before making any health decisions.
                If you are experiencing a medical emergency, call 911 immediately.
            </p>
            <div className="flex items-center gap-2 pt-1">
                <Shield size={14} className="shrink-0 text-amber-600" />
                <p className="text-xs text-amber-700">
                    AI can make mistakes. Verify all results with your clinician.
                </p>
            </div>
        </div>
    );
}
