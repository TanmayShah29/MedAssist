/**
 * Structured Logger
 * Wraps console methods to ensure consistent log formatting and
 * prevents sensitive info leakage in production.
 *
 * In production, INFO logs are silenced unless ENABLE_VERBOSE_LOGGING=true.
 * Stack traces are stripped from errors in production to avoid leaking internals.
 */
const isProduction = process.env.NODE_ENV === 'production';

function timestamp(): string {
    return new Date().toISOString();
}

export const logger = {
    info: (message: string, data?: unknown) => {
        if (isProduction && !process.env.ENABLE_VERBOSE_LOGGING) return;
        if (data !== undefined && data !== '') {
            console.log(`[INFO] [${timestamp()}] ${message}`, data);
        } else {
            console.log(`[INFO] [${timestamp()}] ${message}`);
        }
    },
    warn: (message: string, data?: unknown) => {
        if (data !== undefined && data !== '') {
            console.warn(`[WARN] [${timestamp()}] ${message}`, data);
        } else {
            console.warn(`[WARN] [${timestamp()}] ${message}`);
        }
    },
    error: (message: string, error?: unknown) => {
        if (isProduction) {
            // Strip full stack traces in production — avoids leaking implementation details
            const safeError = error instanceof Error
                ? { message: error.message, name: error.name }
                : String(error);
            console.error(`[ERROR] [${timestamp()}] ${message}`, safeError);
        } else {
            console.error(`[ERROR] [${timestamp()}] ${message}`, error);
        }
    }
};
