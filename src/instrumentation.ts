/**
 * Next.js Instrumentation Hook
 *
 * This file is loaded by Next.js before the app starts (both server and edge).
 * It's the correct place to initialise error monitoring (Sentry, Datadog, etc.)
 * and to wire up the logger's `onError` hook.
 *
 * HOW TO ENABLE SENTRY:
 *   1. npm install @sentry/nextjs
 *   2. Set SENTRY_DSN in your .env.local / Vercel env vars
 *   3. Uncomment the Sentry blocks below
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // ── Sentry (disabled until package is installed) ─────────────────────────
  // Uncomment after running: npm install @sentry/nextjs
  //
  // if (process.env.NEXT_RUNTIME === 'nodejs') {
  //   const Sentry = await import('@sentry/nextjs');
  //   Sentry.init({
  //     dsn: process.env.SENTRY_DSN,
  //     tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  //     environment: process.env.NODE_ENV,
  //   });
  //
  //   // Wire logger so all logger.error() calls are forwarded to Sentry
  //   const { logger } = await import('@/lib/logger');
  //   logger.onError = (err) => Sentry.captureException(err);
  // }

  // ── Startup validation ───────────────────────────────────────────────────
  // Verify required env vars are present before accepting any requests.
  // This causes an immediate, loud failure rather than mysterious 500s.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('@/lib/env');
    try {
      validateEnv();
    } catch (err) {
      // Let the error propagate — it will be visible in build/startup logs
      console.error('[instrumentation] FATAL: environment misconfiguration', err);
      // In production we still want to surface this rather than silently run
      if (process.env.NODE_ENV === 'production') {
        throw err;
      }
    }
  }
}

// ── Sentry — capture unhandled errors in server components ──────────────────
// Uncomment after running: npm install @sentry/nextjs
//
// export const onRequestError = Sentry.captureRequestError;
