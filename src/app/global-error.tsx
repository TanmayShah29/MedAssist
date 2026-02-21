'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white">
                    <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
                    <p className="text-slate-400 mb-6 max-w-md text-center">
                        We apologize for the inconvenience. Our team has been notified.
                        <br />
                        Digest: {error.digest}
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => reset()}
                            className="px-4 py-2 bg-teal-500 rounded-lg hover:bg-teal-600 transition-colors"
                        >
                            Try again
                        </button>
                        <button
                            onClick={() => {
                                // Clear Supabase cookies manually as an emergency reset
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
