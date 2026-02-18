import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BasicInfo {
    firstName: string;
    lastName: string;
    age: string;
    sex: "male" | "female" | "other" | "";
    bloodType: string;
    emergencyContact: string;
}

export interface ExtractedLabValue {
    name: string;
    value: number;
    unit: string;
    status: "optimal" | "warning" | "critical";
    referenceRange: { min: number; max: number };
    rangePosition: number;    // 0-100 where value sits on range bar
    confidence: number;       // Groq AI confidence 0-100
    aiInterpretation: string; // Groq AI explanation
    trend: string;            // "↑ up 5%" or "↓ down 8%"
    category: "hematology" | "inflammation" | "metabolic" | "vitamins";
    icdCode?: string;
}

export interface ExtractedEntity {
    id: string;
    text: string;
    type: "symptom" | "condition" | "medication" | "labValue";
    confidence: number;
}

export interface OnboardingState {
    // Step tracking
    currentStep: number;
    completedSteps: number[];

    // Step 1: Basic info
    basicInfo: BasicInfo;

    // Step 2: Symptoms
    selectedSymptoms: string[];
    customSymptom: string;

    // Step 3: Lab upload
    uploadedFile: File | null;
    uploadedFileName: string;

    // Step 4: Processing results
    extractedLabValues: ExtractedLabValue[];
    extractedEntities: ExtractedEntity[];
    healthScore: number;
    riskLevel: "low" | "moderate" | "high";
    processingComplete: boolean;

    // Analysis result from API
    analysisResult: { biomarkers: any[]; healthScore: number; riskLevel: string; summary: string } | null;

    // Actions
    setStep: (step: number) => void;
    completeStep: (step: number) => void;
    setBasicInfo: (info: Partial<BasicInfo>) => void;
    toggleSymptom: (symptom: string) => void;
    setUploadedFile: (file: File) => void;
    setExtractedData: (data: {
        labValues: ExtractedLabValue[];
        entities: ExtractedEntity[];
        healthScore: number;
        riskLevel: "low" | "moderate" | "high";
    }) => void;
    setAnalysisResult: (result: { biomarkers: any[]; healthScore: number; riskLevel: string; summary: string }) => void;
    reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            currentStep: 1,
            completedSteps: [],
            basicInfo: {
                firstName: "",
                lastName: "",
                age: "",
                sex: "",
                bloodType: "",
                emergencyContact: "",
            },
            selectedSymptoms: [],
            customSymptom: "",
            uploadedFile: null,
            uploadedFileName: "",
            extractedLabValues: [],
            extractedEntities: [],
            healthScore: 0,
            riskLevel: "low",
            processingComplete: false,
            analysisResult: null,

            setStep: (step) => set({ currentStep: step }),
            completeStep: (step) =>
                set((s) => ({
                    completedSteps: [...new Set([...s.completedSteps, step])],
                })),
            setBasicInfo: (info) =>
                set((s) => ({ basicInfo: { ...s.basicInfo, ...info } })),
            toggleSymptom: (symptom) =>
                set((s) => ({
                    selectedSymptoms: s.selectedSymptoms.includes(symptom)
                        ? s.selectedSymptoms.filter((x) => x !== symptom)
                        : [...s.selectedSymptoms, symptom],
                })),
            setUploadedFile: (file) =>
                set({ uploadedFile: file, uploadedFileName: file.name }),
            setExtractedData: (data) =>
                set({
                    extractedLabValues: data.labValues,
                    extractedEntities: data.entities,
                    healthScore: data.healthScore,
                    riskLevel: data.riskLevel,
                    processingComplete: true,
                }),
            setAnalysisResult: (result) =>
                set({ analysisResult: result }),
            reset: () =>
                set({
                    currentStep: 1,
                    completedSteps: [],
                    selectedSymptoms: [],
                    uploadedFile: null,
                    extractedLabValues: [],
                    extractedEntities: [],
                    processingComplete: false,
                    analysisResult: null,
                }),
        }),
        { name: "medassist-onboarding" }
    )
);
