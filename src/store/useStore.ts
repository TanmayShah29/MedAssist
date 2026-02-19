import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';


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

// Biomarker Interface matches Component needs
export interface Biomarker {
    id: string;
    name: string;
    value: number;
    unit: string;
    category: string; // Relaxed for compatibility with RiskDomain
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
    insightAnalysis: unknown | null; // NEW: Engine Output

    // Actions
    updateUser: (profile: Partial<UserProfile>) => void;
    setHasData: (status: boolean) => void;
    updateHealthScore: (score: number) => void;
    uploadLab: (report: LabReport) => void;
    refreshAnalysis: () => void; // NEW: Trigger Engine
    reset: () => void;
}

const DEFAULT_USER = {
    name: "John Doe",
    id: "8492",
    memberSince: "2024"
};

const DEFAULT_TREND = [
    { date: 'Jan 1', score: 72, ideal: 85 },
    { date: 'Jan 15', score: 76, ideal: 85 },
    { date: 'Feb 1', score: 88, ideal: 85 },
    { date: 'Feb 14', score: 92, ideal: 85 },
];

// Expanded Mock Data for Full Engine Demo
const DEFAULT_BIOMARKERS: Biomarker[] = [
    // Cardiometabolic
    { id: '1', name: 'HbA1c', value: 5.4, unit: '%', category: 'Metabolic', status: 'optimal', trend: 'stable', referenceRange: '< 5.7', lastUpdated: 'Today' },
    { id: '2', name: 'LDL Cholesterol', value: 118, unit: 'mg/dL', category: 'Cardio', status: 'warning', trend: 'down', referenceRange: '< 100', lastUpdated: '2 weeks ago' },

    // Inflammation
    { id: '3', name: 'hs-CRP', value: 0.8, unit: 'mg/L', category: 'Inflammation', status: 'optimal', trend: 'down', referenceRange: '< 2.0', lastUpdated: 'Today' },

    // Micronutrient
    { id: '4', name: 'Vitamin D', value: 28, unit: 'ng/mL', category: 'Vitamin', status: 'warning', trend: 'up', referenceRange: '30-100', lastUpdated: 'Today' },
    { id: '5', name: 'Ferritin', value: 45, unit: 'ng/mL', category: 'Metabolic', status: 'optimal', trend: 'stable', referenceRange: '30-400', lastUpdated: 'Today' },

    // Hormonal (New)
    { id: '6', name: 'Cortisol', value: 14.2, unit: 'µg/dL', category: 'Metabolic', status: 'optimal', trend: 'stable', referenceRange: '6-23', lastUpdated: 'Today' },
    { id: '7', name: 'Testosterone', value: 650, unit: 'ng/dL', category: 'Hormonal', status: 'optimal', trend: 'up', referenceRange: '300-1000', lastUpdated: 'Today' },
    { id: '8', name: 'TSH', value: 2.5, unit: 'mIU/L', category: 'Hormonal', status: 'optimal', trend: 'stable', referenceRange: '0.4-4.0', lastUpdated: 'Today' }
];

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            user: DEFAULT_USER,
            hasData: false,
            healthScore: 0, // Calculated by Engine
            healthTrend: DEFAULT_TREND,
            labs: [],
            biomarkers: DEFAULT_BIOMARKERS,
            riskAnalysis: null,
            insightAnalysis: null,

            setHasData: (status) => {
                set({ hasData: status });
                if (status) get().refreshAnalysis();
            },

            updateUser: (profile) => set((state) => ({
                user: { ...state.user, ...profile }
            })),

            updateHealthScore: (score) => set({ healthScore: score }), // Legacy logic (kept for compatibility)

            uploadLab: (report) => {
                set((state) => ({
                    labs: [...state.labs, report],
                    hasData: true
                }));
                get().refreshAnalysis();
            },

            refreshAnalysis: () => {
                // Placeholder for new engine logic
                // const risks = analyzeHealthRisks(get().healthTrend);
                // const insights = await generateInsights(get().biomarkers);

                set({
                    // riskAnalysis: risks,
                    // insights: insights,
                    // lastUpdated: new Date() // This field does not exist in AppState
                    healthScore: 0 // Reset or placeholder score
                });
            },

            reset: () => set({
                hasData: false,
                labs: [],
                healthScore: 0,
                riskAnalysis: null,
                insightAnalysis: null
            }),
        }),
        {
            name: 'medassist-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
