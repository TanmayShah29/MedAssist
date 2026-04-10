/**
 * Exponential-backoff retry utility.
 *
 * Used to make external API calls (Groq, OCR.space) resilient to transient failures.
 * Does NOT retry on rate-limit errors, authentication errors, or deliberate
 * abort timeouts — those should propagate immediately.
 */

export interface RetryOptions {
  /** Maximum number of attempts (including the first). Default: 3 */
  maxAttempts?: number;
  /** Delay before the 2nd attempt in ms. Doubles each retry. Default: 600 */
  initialDelayMs?: number;
  /** Upper cap for any single delay in ms. Default: 8000 */
  maxDelayMs?: number;
  /** Return true to allow a retry, false to rethrow immediately. */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Default predicate: retry on transient network / server errors only.
 * Hard stops: rate limits, auth errors, deliberately aborted timeouts,
 * validation errors, and our own AIExtractionError.
 */
function defaultShouldRetry(error: unknown): boolean {
  if (!(error instanceof Error)) return true; // unknown error — give it a shot

  const msg = error.message ?? '';
  const name = error.name ?? '';

  // Never retry deliberate rate-limit signals
  if (msg.startsWith('RATE_LIMIT') || msg.includes('rate_limit')) return false;

  // Never retry our custom extraction validation failure
  if (name === 'AIExtractionError') return false;

  // Never retry an explicit timeout — the request is already as long as allowed
  if (name === 'AbortError') return false;

  // Never retry Zod validation errors
  if (name === 'ZodError') return false;

  // HTTP 4xx client errors shouldn't be retried (except 429 handled above)
  const status = (error as { status?: number }).status;
  if (status && status >= 400 && status < 500 && status !== 429) return false;

  return true;
}

/**
 * Wraps `fn` with automatic retries on transient failures.
 *
 * @example
 * const result = await withRetry(
 *   () => groq.chat.completions.create(params),
 *   { maxAttempts: 3, initialDelayMs: 600 }
 * );
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelayMs = 600,
    maxDelayMs = 8000,
    shouldRetry = defaultShouldRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt === maxAttempts;
      const canRetry = shouldRetry(error, attempt);

      if (isLastAttempt || !canRetry) {
        throw error;
      }

      // Jitter ±20% so concurrent callers don't all retry at the same tick
      const baseDelay = Math.min(initialDelayMs * Math.pow(2, attempt - 1), maxDelayMs);
      const jitter = baseDelay * 0.2 * (Math.random() - 0.5);
      const delay = Math.max(0, Math.round(baseDelay + jitter));

      await sleep(delay);
    }
  }

  throw lastError;
}
