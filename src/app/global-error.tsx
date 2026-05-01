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
        <html lang="en">
            <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#0F172A', color: '#fff' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100dvh',
                    padding: '24px',
                    textAlign: 'center',
                }}>
                    <div style={{
                        background: '#1E293B',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 20,
                        padding: '40px 32px',
                        maxWidth: 480,
                        width: '100%',
                    }}>
                        <div style={{
                            width: 56, height: 56,
                            background: 'rgba(239,68,68,0.15)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px',
                            fontSize: 24,
                        }}>
                            ⚠
                        </div>

                        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>
                            Something went wrong
                        </h2>
                        <p style={{ color: '#94A3B8', margin: '0 0 8px', lineHeight: 1.6, fontSize: 15 }}>
                            An unexpected error occurred. Our team has been notified.
                        </p>
                        {error.digest && (
                            <p style={{ color: '#475569', fontSize: 12, margin: '0 0 24px', fontFamily: 'monospace' }}>
                                Error ID: {error.digest}
                            </p>
                        )}

                        {process.env.NODE_ENV === 'development' && (
                            <pre style={{
                                textAlign: 'left',
                                background: '#0F172A',
                                border: '1px solid rgba(255,255,255,0.06)',
                                padding: '16px',
                                borderRadius: 10,
                                overflow: 'auto',
                                maxWidth: '100%',
                                fontSize: 12,
                                marginBottom: 24,
                                color: '#F87171',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                            }}>
                                {error.message}
                                {error.stack && `\n\n${error.stack}`}
                            </pre>
                        )}

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button
                                onClick={() => reset()}
                                style={{
                                    padding: '10px 24px',
                                    background: '#0EA5E9',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 10,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Try again
                            </button>
                            <button
                                onClick={() => {
                                    // Clear Supabase session cookies
                                    document.cookie.split(";").forEach((c) => {
                                        const name = c.split("=")[0].trim();
                                        if (name.includes('supabase') || name.includes('sb-')) {
                                            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                                        }
                                    });
                                    window.location.href = '/auth';
                                }}
                                style={{
                                    padding: '10px 24px',
                                    background: 'transparent',
                                    color: '#94A3B8',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: 10,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Sign Out &amp; Reset
                            </button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
