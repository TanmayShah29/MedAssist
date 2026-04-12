import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry } from '../lib/retry';

// ─────────────────────────────────────────────────────────────────────────────
// withRetry
// ─────────────────────────────────────────────────────────────────────────────

describe('withRetry', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns immediately when fn succeeds on the first call', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on a transient error and eventually succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('network glitch'))
      .mockResolvedValue('recovered');

    const result = await withRetry(fn, { initialDelayMs: 1 });
    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after maxAttempts are exhausted', async () => {
    const error = new Error('persistent failure');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn, { maxAttempts: 3, initialDelayMs: 1 })).rejects.toThrow('persistent failure');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('does NOT retry on RATE_LIMIT errors', async () => {
    const error = new Error('RATE_LIMIT: Too many requests');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn)).rejects.toThrow('RATE_LIMIT');
    expect(fn).toHaveBeenCalledTimes(1); // no retry
  });

  it('does NOT retry on AbortError (timeout)', async () => {
    const error = new Error('The operation was aborted');
    error.name = 'AbortError';
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn)).rejects.toThrow('aborted');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry on AIExtractionError', async () => {
    const error = new Error('No biomarkers found');
    error.name = 'AIExtractionError';
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn)).rejects.toThrow('No biomarkers found');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry on HTTP 400 client errors', async () => {
    const error = Object.assign(new Error('Bad Request'), { status: 400 });
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn)).rejects.toThrow('Bad Request');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('DOES retry on HTTP 500 server errors', async () => {
    const serverError = Object.assign(new Error('Internal Server Error'), { status: 500 });
    const fn = vi.fn()
      .mockRejectedValueOnce(serverError)
      .mockResolvedValue('success after 500');

    const result = await withRetry(fn, { maxAttempts: 2, initialDelayMs: 1 });
    expect(result).toBe('success after 500');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('respects custom shouldRetry predicate', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('custom'));

    // Never retry
    await expect(
      withRetry(fn, { maxAttempts: 3, shouldRetry: () => false })
    ).rejects.toThrow('custom');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('caps delay at maxDelayMs', async () => {
    const delays: number[] = [];
    const originalSetTimeout = globalThis.setTimeout;

    // Spy on sleep calls via the timer mock
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('e1'))
      .mockRejectedValueOnce(new Error('e2'))
      .mockResolvedValue('done');

    vi.spyOn(globalThis, 'setTimeout').mockImplementation((cb: () => void, ms?: number) => {
      delays.push(ms ?? 0);
      cb(); // execute immediately
      return 0 as unknown as ReturnType<typeof originalSetTimeout>;
    });

    await withRetry(fn, { maxAttempts: 3, initialDelayMs: 100, maxDelayMs: 150 });

    // All delays should be ≤ maxDelayMs + 20% jitter headroom
    delays.forEach(d => expect(d).toBeLessThanOrEqual(180));
  });
});
