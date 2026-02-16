/**
 * Structured Logger
 * Wraps console methods to ensure consistent log formatting and
 * prevents sensitive info leakage in production.
 */
const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
    info: (message: string, data?: any) => {
        if (isProduction && !process.env.ENABLE_VERBOSE_LOGMING) return; // Silence info in prod unless enabled
        console.log(`[INFO] ${message}`, data || '');
    },
    warn: (message: string, data?: any) => {
        console.warn(`[WARN] ${message}`, data || '');
    },
    error: (message: string, error?: any) => {
        // In production, we might want to send this to a monitoring service (Sentry, etc.)
        // For now, we strip complex objects to avoid leaking full stack traces to stdout if sensitive
        if (isProduction) {
            console.error(`[ERROR] ${message}`, error instanceof Error ? error.message : String(error));
        } else {
            console.error(`[ERROR] ${message}`, error);
        }
    }
};
