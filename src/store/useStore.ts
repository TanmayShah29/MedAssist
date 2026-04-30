import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserProfile {
    name: string;
    id: string;
    memberSince: string;
}

interface LabReport {
    id: string;
    date: string;
    name: string;
    status: 'analyzed' | 'pending';
}

/**
 * Biomarker as stored in the Zustand store.
 *
 * NOTE: This is a UI-layer type that is intentionally broader than the
 * backend's `BiomarkerResult` (from `groq-medical.ts`). Extra fields
 * (`trend`, `referenceRange`, `lastUpdated`) are needed by dashboard
 * components that display historical data with trend indicators.
 * The backend type is used for raw AI output; this type is used after
 * the data has been fetched from Supabase and enriched for display.
 */
export interface Biomarker {
    id: string;
    name: string;
    value: number;
    unit: string;
    category: string;
    status: 'optimal' | 'warning' | 'critical';
    trend: 'up' | 'down' | 'stable';
    referenceRange: string;
    lastUpdated: string;
}

interface AppState {
    // User Identity
    user: UserProfile;

    // App State
    hasData: boolean;

    // Clinical Data
    healthScore: number;
    healthTrend: { date: string; score: number; ideal: number }[];
    labs: LabReport[];
    biomarkers: Biomarker[];
    riskAnalysis: unknown | null;
    insightAnalysis: unknown | null;

    // Actions
    updateUser: (profile: Partial<UserProfile>) => void;
    setHasData: (status: boolean) => void;
    updateHealthScore: (score: number) => void;
    uploadLab: (report: LabReport) => void;
    reset: () => void;
}

// ── Safe defaults (empty — real data comes from Supabase) ─────────────────────
//
// We intentionally do NOT seed mock biomarkers or a fake user here.
// The store is persisted to localStorage, so any default data would survive
// page refreshes and could appear on real user sessions. Components that need
// placeholder UI while loading should use their own local loading state.

const EMPTY_USER: UserProfile = {
    name: '',
    id: '',
    memberSince: '',
};

// ── Store ─────────────────────────────────────────────────────────────────────

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            user: EMPTY_USER,
            hasData: false,
            healthScore: 0,
            healthTrend: [],
            labs: [],
            biomarkers: [],
            riskAnalysis: null,
            insightAnalysis: null,

            setHasData: (status) => set({ hasData: status }),

            updateUser: (profile) => set((state) => ({
                user: { ...state.user, ...profile }
            })),

            // updateHealthScore is used by consumers that receive the score
            // from the API response and want to cache it locally.
            updateHealthScore: (score) => set({ healthScore: score }),

            uploadLab: (report) => {
                set((state) => ({
                    labs: [...state.labs, report],
                    hasData: true,
                }));
            },

            reset: () => set({
                user: EMPTY_USER,
                hasData: false,
                labs: [],
                healthScore: 0,
                healthTrend: [],
                biomarkers: [],
                riskAnalysis: null,
                insightAnalysis: null,
            }),
        }),
        {
            name: 'medassist-storage-v2', // Bumped version to bust stale mock data from old key
            storage: createJSONStorage(() => {
                try {
                    // Test if localStorage is actually accessible
                    // (throws QuotaExceededError in Safari private mode)
                    const testKey = '__medassist_test__';
                    window.localStorage.setItem(testKey, testKey);
                    window.localStorage.removeItem(testKey);
                    return window.localStorage;
                } catch (_e) {
                    // Fallback to in-memory storage
                    const fallbackStorage = new Map<string, string>();
                    return {
                        getItem: (name: string) => fallbackStorage.get(name) || null,
                        setItem: (name: string, value: string) => fallbackStorage.set(name, value),
                        removeItem: (name: string) => fallbackStorage.delete(name),
                    };
                }
            }),
        }
    )
);
