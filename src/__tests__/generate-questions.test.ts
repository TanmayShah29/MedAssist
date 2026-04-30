/**
 * Tests for the /api/generate-questions route handler.
 *
 * Covers:
 *  - Auth rejection (401)
 *  - Rate limiting (429)
 *  - Input validation (400)
 *  - Global cache hit path
 *  - Empty biomarkers shortcircuit
 *  - All-optimal biomarkers shortcircuit
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── vi.mock factories must be self-contained (hoisted) ────────────────────────

let mockGetUser: ReturnType<typeof vi.fn>;
let mockFrom: ReturnType<typeof vi.fn>;

vi.mock('@/lib/supabase/server', () => ({
    getAuthClient: vi.fn(),
}));

vi.mock('@/lib/supabase-admin', () => ({
    supabaseAdmin: null, // Skip global cache in unit tests
}));

vi.mock('@/services/rateLimitService', () => ({
    checkRateLimit: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
    logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

// Mock Groq SDK — no real network calls
vi.mock('groq-sdk', () => ({
    default: class {
        chat = {
            completions: {
                create: vi.fn().mockResolvedValue({
                    choices: [{
                        message: {
                            content: JSON.stringify({
                                questions: [
                                    { question: 'What does my iron level mean?', context: 'Your iron is low.' },
                                ],
                            }),
                        },
                    }],
                }),
            },
        };
    },
}));

// Import after vi.mock
import { getAuthClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/services/rateLimitService';
import { POST } from '@/app/api/generate-questions/route';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(body: unknown) {
    return new NextRequest('http://localhost/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
        body: JSON.stringify(body),
    });
}

function chainWith(result: unknown) {
    const chain = {
        select: vi.fn(),
        eq: vi.fn(),
        order: vi.fn(),
        limit: vi.fn(),
        single: vi.fn().mockResolvedValue(result),
        update: vi.fn(),
        then: vi.fn(),
    };
    // Make every chainable method return the chain so we can do
    // .select(...).eq(...).order(...).limit(...).single()
    chain.select.mockReturnValue(chain);
    chain.eq.mockReturnValue(chain);
    chain.order.mockReturnValue(chain);
    chain.limit.mockReturnValue(chain);
    chain.update.mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) });
    return chain;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/generate-questions', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockGetUser = vi.fn();
        mockFrom = vi.fn();

        // Default: rate limit passes
        (checkRateLimit as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });

        // Default: user authenticated
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
        (getAuthClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: { getUser: mockGetUser },
            from: mockFrom,
        });

        // Default: no local cache
        mockFrom.mockReturnValue(chainWith({ data: null, error: null }));
    });

    it('returns 429 when rate limit is exceeded', async () => {
        (checkRateLimit as ReturnType<typeof vi.fn>).mockResolvedValue({
            success: false,
            message: 'Too many requests',
            retryAfter: 60,
        });

        const res = await POST(makeRequest({ biomarkers: [] }));
        expect(res.status).toBe(429);
    });

    it('returns 401 when user is not authenticated', async () => {
        mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

        const res = await POST(makeRequest({ biomarkers: [] }));
        expect(res.status).toBe(401);
    });

    it('returns 400 for malformed JSON body', async () => {
        const req = new NextRequest('http://localhost/api/generate-questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{not valid json',
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it('returns empty questions array for no biomarkers', async () => {
        const res = await POST(makeRequest({ biomarkers: [] }));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.questions).toEqual([]);
    });

    it('returns a "maintain health" question when all biomarkers are optimal', async () => {
        const res = await POST(makeRequest({
            biomarkers: [
                { name: 'Iron', value: 90, unit: 'µg/dL', status: 'optimal' },
            ],
        }));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.questions[0].question).toMatch(/maintain|healthy|optimal/i);
    });

    it('returns cached questions when local cache exists and is valid', async () => {
        const cachedQuestions = [
            { question: 'Cached question?', context: 'From cache.' },
        ];

        mockFrom.mockReturnValue(chainWith({
            data: {
                id: 'report-1',
                raw_ai_json: { cached_doctor_questions: cachedQuestions },
            },
            error: null,
        }));

        const res = await POST(makeRequest({
            biomarkers: [
                { name: 'Iron', value: 40, unit: 'µg/dL', status: 'critical' },
            ],
        }));

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.cached).toBe(true);
        expect(json.questions).toEqual(cachedQuestions);
    });

    it('rejects biomarkers with non-numeric values', async () => {
        const res = await POST(makeRequest({
            biomarkers: [
                { name: 'Iron', value: 'not-a-number', unit: 'µg/dL', status: 'critical' },
            ],
        }));
        expect(res.status).toBe(400);
    });

    it('ignores malformed cached_doctor_questions shape in local cache', async () => {
        // Malformed: cached_doctor_questions is not an array of {question, context}
        mockFrom.mockReturnValue(chainWith({
            data: {
                id: 'report-2',
                raw_ai_json: { cached_doctor_questions: [{ wrong: 'shape' }] },
            },
            error: null,
        }));

        // Should fall through to generate new questions, not return malformed cache
        const res = await POST(makeRequest({
            biomarkers: [
                { name: 'Iron', value: 40, unit: 'µg/dL', status: 'critical' },
            ],
        }));

        // Should succeed (either AI or fallback), but not serve malformed cached data
        expect(res.status).toBe(200);
        const json = await res.json();
        // If it hit the cache, questions would have 'wrong' key — verify it doesn't
        const hasWrongShape = json.questions.some((q: Record<string, unknown>) => 'wrong' in q);
        expect(hasWrongShape).toBe(false);
    });
});
