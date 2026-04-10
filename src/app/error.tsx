'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/logger';

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
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-slate-50 px-4 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full">
                <div className="mx-auto bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="h-8 w-8 text-rose-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h2>
                
                <p className="text-slate-600 mb-8 max-w-[280px] mx-auto text-sm">
                    We encountered an unexpected error. Our team has been notified.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => reset()}
                        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try again
                    </button>
                    
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                    >
                        <Home className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
