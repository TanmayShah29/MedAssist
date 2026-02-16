'use client';

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
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-teal-500 rounded-lg hover:bg-teal-600 transition-colors"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
