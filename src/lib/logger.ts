/**
 * Structured Logger
 *
 * - In development: all levels printed with timestamps.
 * - In production:  INFO logs are suppressed unless ENABLE_VERBOSE_LOGGING=true.
 *                   Stack traces are stripped from error objects to avoid leaking
 *                   implementation details.
 *
 * External error reporting (e.g. Sentry) can be plugged in by setting
 * `logger.onError` before the app starts.  The default is a no-op so the app
 * works without any monitoring service configured.
 *
 * Usage:
 *   logger.info('Starting analysis', { userId })
 *   logger.warn('Rate limit hit')
 *   logger.error('Groq API failed', error)        // also calls logger.onError
 */

const isProduction = process.env.NODE_ENV === 'production';

function timestamp(): string {
  return new Date().toISOString();
}

const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

function redactSensitiveData(message: string): string {
  return message.replace(UUID_PATTERN, (match) => match.slice(0, 8) + "...");
}

function safeSerialize(data: unknown): unknown {
  if (data instanceof Error) {
    // In production strip stack trace so internal paths aren't exposed
    return isProduction
      ? { name: data.name, message: data.message }
      : { name: data.name, message: data.message, stack: data.stack };
  }
  return data;
}

type ErrorHandler = (error: unknown, context?: string) => void;

// Default no-op — swap this out at app startup to connect Sentry or similar.
// Example in instrumentation.ts:
//   import * as Sentry from '@sentry/nextjs';
//   logger.onError = (err, ctx) => Sentry.captureException(err, { extra: { context: ctx } });
let _onError: ErrorHandler = () => {};

export const logger = {
  /** Replace this to plug in Sentry or another error-monitoring service. */
  set onError(handler: ErrorHandler) {
    _onError = handler;
  },

  info(message: string, data?: unknown): void {
    if (isProduction && process.env.ENABLE_VERBOSE_LOGGING !== 'true') return;
    const safeMsg = redactSensitiveData(message);
    if (data !== undefined) {
      console.log(`[INFO]  [${timestamp()}] ${safeMsg}`, safeSerialize(data));
    } else {
      console.log(`[INFO]  [${timestamp()}] ${safeMsg}`);
    }
  },

  warn(message: string, data?: unknown): void {
    const safeMsg = redactSensitiveData(message);
    if (data !== undefined) {
      console.warn(`[WARN]  [${timestamp()}] ${safeMsg}`, safeSerialize(data));
    } else {
      console.warn(`[WARN]  [${timestamp()}] ${safeMsg}`);
    }
  },

  error(message: string, error?: unknown): void {
    const safeMsg = redactSensitiveData(message);
    const serialized = safeSerialize(error);
    if (serialized !== undefined) {
      console.error(`[ERROR] [${timestamp()}] ${safeMsg}`, serialized);
    } else {
      console.error(`[ERROR] [${timestamp()}] ${safeMsg}`);
    }
    if (error instanceof Error) {
      error.message = redactSensitiveData(error.message);
    }
    _onError(error, safeMsg);
  },
};
