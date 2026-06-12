/**
 * Tests for server action auth guards and input validation.
 *
 * deleteLabResult: verifies the authenticated session, scopes deletes by user,
 *   and removes child biomarkers before the report for non-cascade deployments.
 *
 * updateUserProfile: has an explicit session ownership check (IDOR prevention).
 *   supabaseAdmin must be non-null for auth checks to be reached.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks (must be declared before vi.mock factories use them) ─────────────────

// We re-assign these in beforeEach — initial value doesn't matter
let mockGetUser: ReturnType<typeof vi.fn>;
let mockFrom: ReturnType<typeof vi.fn>;
let mockDelete: ReturnType<typeof vi.fn>;
let mockEq: ReturnType<typeof vi.fn>;
let mockRpc: ReturnType<typeof vi.fn>;

vi.mock('@/lib/supabase/server', () => ({
    getAuthClient: vi.fn(),
}));

// Give supabaseAdmin a real-ish object so updateUserProfile gets past the null guard
vi.mock('@/lib/supabase-admin', () => ({
    supabaseAdmin: {
        from: vi.fn(),
        rpc: vi.fn(),
    },
}));

vi.mock('next/headers', () => ({
    cookies: vi.fn().mockResolvedValue({
        getAll: vi.fn().mockReturnValue([]),
        set: vi.fn(),
    }),
}));

vi.mock('@/lib/logger', () => ({
    logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

// Import after mocks
import { getAuthClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { deleteLabResult, updateUserProfile } from '@/app/actions/user-data';

// ── Chain builder ──────────────────────────────────────────────────────────────

function _buildDeleteChain(result: unknown) {
    const chain = {
        from: vi.fn(),
        delete: vi.fn(),
        eq: vi.fn().mockResolvedValue(result),
    };
    chain.from.mockReturnValue({ delete: chain.delete });
    chain.delete.mockReturnValue({ eq: chain.eq });
    return chain;
}

function buildProfileChain(result: unknown) {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    const methods = ['from', 'select', 'eq', 'single', 'update', 'upsert', 'insert'];
    methods.forEach(m => { chain[m] = vi.fn().mockReturnValue(chain); });
    chain.single.mockResolvedValue(result);
    chain.eq.mockResolvedValue(result);
    return chain;
}

function buildDeleteChain() {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    const methods = ['select', 'eq', 'single', 'delete'];
    methods.forEach(m => { chain[m] = vi.fn().mockReturnValue(chain); });
    chain.single.mockResolvedValue({ data: { id: 'report-1' }, error: null });
    return chain;
}

// ── deleteLabResult tests ──────────────────────────────────────────────────────

describe('deleteLabResult — input validation', () => {
    let adminFrom: ReturnType<typeof vi.fn>;
    let reportChain: Record<string, ReturnType<typeof vi.fn>>;
    let biomarkerChain: Record<string, ReturnType<typeof vi.fn>>;
    let deleteReportChain: Record<string, ReturnType<typeof vi.fn>>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
        mockFrom = vi.fn();

        (getAuthClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: { getUser: mockGetUser },
            from: mockFrom,
        });

        reportChain = buildDeleteChain();
        biomarkerChain = buildDeleteChain();
        deleteReportChain = buildDeleteChain();
        
        mockFrom
            .mockReturnValueOnce(reportChain)
            .mockReturnValueOnce(biomarkerChain)
            .mockReturnValueOnce(deleteReportChain);
    });

    it('rejects empty string ID before touching the DB', async () => {
        const result = await deleteLabResult('');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid report ID');
        // No DB call should have been made
        expect(mockFrom).not.toHaveBeenCalled();
    });

    it('passes a UUID string through to the DB (RLS guards access)', async () => {
        const uuid = 'b534d94e-b7e0-4d21-962f-d62d8de7ed81';
        const result = await deleteLabResult(uuid);
        expect(mockFrom).toHaveBeenNthCalledWith(1, 'lab_results');
        expect(mockFrom).toHaveBeenNthCalledWith(2, 'biomarkers');
        expect(mockFrom).toHaveBeenNthCalledWith(3, 'lab_results');
        expect(reportChain.eq).toHaveBeenCalledWith('id', uuid);
        expect(reportChain.eq).toHaveBeenCalledWith('user_id', 'user-1');
        expect(biomarkerChain.delete).toHaveBeenCalled();
        expect(biomarkerChain.eq).toHaveBeenCalledWith('lab_result_id', uuid);
        expect(biomarkerChain.eq).toHaveBeenCalledWith('user_id', 'user-1');
        expect(deleteReportChain.delete).toHaveBeenCalled();
        expect(deleteReportChain.eq).toHaveBeenCalledWith('id', uuid);
        expect(deleteReportChain.eq).toHaveBeenCalledWith('user_id', 'user-1');
        expect(result.success).toBe(true);
    });

    it('calls .from("lab_results").delete().eq("id", ...) for a numeric string ID', async () => {
        const result = await deleteLabResult('42');
        expect(mockFrom).toHaveBeenNthCalledWith(1, 'lab_results');
        expect(mockFrom).toHaveBeenNthCalledWith(2, 'biomarkers');
        expect(mockFrom).toHaveBeenNthCalledWith(3, 'lab_results');
        expect(reportChain.eq).toHaveBeenCalledWith('id', '42');
        expect(biomarkerChain.eq).toHaveBeenCalledWith('lab_result_id', '42');
        expect(deleteReportChain.eq).toHaveBeenCalledWith('id', '42');
        expect(result.success).toBe(true);
    });

    it('surfaces the DB error message on failure', async () => {
        biomarkerChain.eq
            .mockReturnValueOnce(biomarkerChain)
            .mockResolvedValueOnce({ data: null, error: { message: 'permission denied' } });
        const result = await deleteLabResult('some-uuid-99');
        // Error is thrown and caught; message is surfaced
        expect(result.success).toBe(false);
        expect(result.error).toBe('permission denied');
    });
});

// ── updateUserProfile IDOR tests ───────────────────────────────────────────────

describe('updateUserProfile — IDOR prevention', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetUser = vi.fn();
        mockFrom = vi.fn();
        mockRpc = vi.fn().mockResolvedValue({ data: null, error: null });

        (getAuthClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: { getUser: mockGetUser },
            from: mockFrom,
            rpc: mockRpc,
        });

        (supabaseAdmin as unknown as Record<string, ReturnType<typeof vi.fn>>).from.mockReset();
        (supabaseAdmin as unknown as Record<string, ReturnType<typeof vi.fn>>).rpc.mockReset();
        const profileChain = buildProfileChain({ data: { id: 'user-1' }, error: null });
        (supabaseAdmin as unknown as Record<string, ReturnType<typeof vi.fn>>).from
            .mockReturnValue(profileChain);
        (supabaseAdmin as unknown as Record<string, ReturnType<typeof vi.fn>>).rpc
            .mockResolvedValue({ data: null, error: null });
    });

    it('rejects when session user does not match the target userId (IDOR)', async () => {
        const SESSION_USER = 'session-user-abc';
        const ATTACKER_TARGET = 'victim-user-xyz';

        mockGetUser.mockResolvedValue({ data: { user: { id: SESSION_USER } }, error: null });

        const result = await updateUserProfile(ATTACKER_TARGET, { first_name: 'Eve' });

        expect(result.success).toBe(false);
        expect(result.error).toMatch(/unauthorized/i);
    });

    it('rejects when no session exists', async () => {
        mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

        const result = await updateUserProfile('user-abc', { first_name: 'Eve' });

        expect(result.success).toBe(false);
        expect(result.error).toMatch(/unauthorized/i);
    });

    it('proceeds when session user matches the target userId', async () => {
        const SESSION_USER = 'user-legitimate';
        mockGetUser.mockResolvedValue({ data: { user: { id: SESSION_USER } }, error: null });

        // updateUserProfile reads the profile then upserts — mock chain for admin client
        const adminChain = buildProfileChain({ data: { user_id: SESSION_USER }, error: null });
        (supabaseAdmin as unknown as Record<string, ReturnType<typeof vi.fn>>).from.mockReturnValue(adminChain);

        const result = await updateUserProfile(SESSION_USER, { first_name: 'Alice', age: 25 });

        // Auth guard passed — result is either success or a DB error, but not auth-related
        if (!result.success) {
            expect(result.error).not.toMatch(/unauthorized/i);
        }
    });
});
