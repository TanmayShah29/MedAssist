import { analyzeHealthRisks, RiskTierMode, Biomarker } from './src/lib/risk-engine';

const BIOMARKERS: Biomarker[] = [
    { name: "HbA1c", value: 5.4, category: "Cardiometabolic", unit: "%", id: "1", status: "optimal", trend: "stable", referenceRange: "<5.7", lastUpdated: "2024-01-01" },
    { name: "LDL Cholesterol", value: 118, category: "Cardiometabolic", unit: "mg/dL", id: "2", status: "warning", trend: "up", referenceRange: "<100", lastUpdated: "2024-01-01" },
    { name: "hs-CRP", value: 0.8, category: "Inflammation", unit: "mg/L", id: "3", status: "optimal", trend: "stable", referenceRange: "<1.0", lastUpdated: "2024-01-01" },
    { name: "Vitamin D", value: 28, category: "Micronutrient", unit: "ng/mL", id: "4", status: "warning", trend: "down", referenceRange: "30-100", lastUpdated: "2024-01-01" },
    { name: "Ferritin", value: 45, category: "Micronutrient", unit: "ng/mL", id: "5", status: "optimal", trend: "stable", referenceRange: "30-400", lastUpdated: "2024-01-01" },
    { name: "Cortisol", value: 14.2, category: "Hormonal", unit: "µg/dL", id: "6", status: "optimal", trend: "stable", referenceRange: "6-23", lastUpdated: "2024-01-01" },
    { name: "Testosterone", value: 650, category: "Hormonal", unit: "ng/dL", id: "7", status: "optimal", trend: "stable", referenceRange: "300-1000", lastUpdated: "2024-01-01" },
    { name: "TSH", value: 2.5, category: "Hormonal", unit: "mIU/L", id: "8", status: "optimal", trend: "stable", referenceRange: "0.4-4.0", lastUpdated: "2024-01-01" }
];

const modes: RiskTierMode[] = ["structural", "reliability_adjusted", "hybrid"];

console.log("--- TIER MODE VALIDATION ---\n");

modes.forEach(mode => {
    const result = analyzeHealthRisks(BIOMARKERS, mode);
    console.log(`MODE: ${mode.toUpperCase()}`);
    // Safe access to metrics
    const confidence = result.metrics ? result.metrics.confidenceLevel : 0;
    const coverage = result.metrics ? result.metrics.domainCoverage : 0;

    console.log(JSON.stringify({
        tierMode: result.tierMode,
        structuralScore: result.structuralScore,
        reliabilityAdjustedScore: result.reliabilityAdjustedScore,
        effectiveTierScore: result.effectiveTierScore,
        overallTier: result.overallTier,
        domainCoverage: coverage + "%",
        confidenceLevel: confidence + "%",
        tierHierarchy: result.tierHierarchy
    }, null, 2));
    console.log("\n--------------------------------------------------\n");
});
