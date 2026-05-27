'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';
import { logger } from '@/lib/logger';
import { BrandLockup } from '@/components/branding/brand-lockup';

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        logger.error('Unhandled app exception:', error);
    }, [error]);

    return (
        <div className="flex min-h-[100dvh] flex-col bg-[#FAFAF7]">
            {/* Minimal brand header */}
            <header className="h-16 flex items-center px-6 border-b border-[#E8E6DF]">
                <Link href="/" className="group">
                    <BrandLockup showTagline markClassName="transition-transform group-hover:-rotate-3 group-hover:scale-105" />
                </Link>
            </header>

            {/* Error content */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                {/* Error indicator */}
                <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-6">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>

                <h1 className="font-display text-3xl text-[#1C1917] mb-3">
                    Something went wrong
                </h1>
                <p className="text-[#57534E] text-[15px] max-w-sm leading-relaxed mb-8">
                    We hit an unexpected error. Our team has been notified — you can try again or head back to your dashboard.
                </p>

                {/* Error digest for support */}
                {error.digest && (
                    <p className="text-[11px] font-mono text-[#A8A29E] bg-[#F5F4EF] border border-[#E8E6DF] px-3 py-1.5 rounded-full mb-8">
                        Error ID: {error.digest}
                    </p>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                        onClick={() => reset()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-[10px] font-semibold text-sm shadow-[0_4px_14px_rgba(14,165,233,0.25)] hover:bg-sky-600 hover:shadow-[0_4px_18px_rgba(14,165,233,0.35)] transition-all min-h-[44px] active:scale-95"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try again
                    </button>
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#F5F4EF] text-[#57534E] border border-[#E8E6DF] rounded-[10px] font-semibold text-sm hover:border-[#D9D6CD] hover:text-[#1C1917] transition-all min-h-[44px]"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </div>

                <p className="text-[11px] text-[#A8A29E] mt-12">
                    If this keeps happening, please contact support.
                </p>
            </main>
        </div>
    );
}
