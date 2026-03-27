"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        logger.error("Global error boundary caught:", { error, digest: error.digest });
    }, [error]);

    return (
        <html>
            <body>
                <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-slate-900 text-white">
                    <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
                    <p className="text-slate-400 mb-6 max-w-md text-center">
                        We apologize for the inconvenience. Our team has been notified.
                        <br />
                        {error.digest && <span className="text-xs text-slate-500">Error ID: {error.digest}</span>}
                    </p>
                    {process.env.NODE_ENV === "development" && (
                        <pre style={{ textAlign: 'left', background: '#1e293b', padding: '1rem', overflow: 'auto', maxWidth: '100%', fontSize: '12px', marginBottom: '1rem' }}>
                            {error.message}
                        </pre>
                    )}
                    <div className="flex gap-4">
                        <button
                            onClick={() => reset()}
                            className="px-4 py-2 bg-teal-500 rounded-lg hover:bg-teal-600 transition-colors"
                        >
                            Try again
                        </button>
                        <button
                            onClick={() => {
                                document.cookie.split(";").forEach((c) => {
                                    const name = c.split("=")[0].trim();
                                    if (name.includes('supabase') || name.includes('sb-')) {
                                        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                                    }
                                });
                                window.location.href = '/auth';
                            }}
                            className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors border border-slate-600"
                        >
                            Sign Out & Reset
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
