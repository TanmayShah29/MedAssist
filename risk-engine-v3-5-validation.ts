
// v3.5 Validation Script

import { analyzeHealthRisks, RiskTierMode, Biomarker } from './src/lib/risk-engine';

const BIOMARKERS_NORMAL: Biomarker[] = [
    { name: "HbA1c", value: 5.4, category: "Cardiometabolic", unit: "%", id: "1", status: "optimal", trend: "stable", referenceRange: "<5.7", lastUpdated: "2024-01-01" },
    { name: "LDL Cholesterol", value: 110, category: "Cardiometabolic", unit: "mg/dL", id: "2", status: "warning", trend: "up", referenceRange: "<100", lastUpdated: "2024-01-01" },
    { name: "hs-CRP", value: 0.8, category: "Inflammation", unit: "mg/L", id: "3", status: "optimal", trend: "stable", referenceRange: "<1.0", lastUpdated: "2024-01-01" }
];

const BIOMARKERS_CRITICAL: Biomarker[] = [
    { name: "HbA1c", value: 8.5, category: "Cardiometabolic", unit: "%", id: "4", status: "critical", trend: "up", referenceRange: "<5.7", lastUpdated: "2024-01-01" },
    { name: "LDL Cholesterol", value: 110, category: "Cardiometabolic", unit: "mg/dL", id: "5", status: "warning", trend: "up", referenceRange: "<100", lastUpdated: "2024-01-01" }
];

const BIOMARKERS_ANOMALY: Biomarker[] = [
    { name: "HbA1c", value: -1, category: "Cardiometabolic", unit: "%", id: "6", status: "optimal", trend: "stable", referenceRange: "<5.7", lastUpdated: "2024-01-01" },
    { name: "LDL Cholesterol", value: 900, category: "Cardiometabolic", unit: "mg/dL", id: "7", status: "critical", trend: "up", referenceRange: "<100", lastUpdated: "2024-01-01" }
];

console.log("--- RISK ENGINE v3.5 VALIDATION ---\n");

// TEST 1: Normal Run (Metadata Check)
console.log("\nTEST 1: Metadata & Structure");
const res1 = analyzeHealthRisks(BIOMARKERS_NORMAL, "structural");
console.log("Engine Version:", res1.engineVersion);
console.log("Tier Logic Version:", res1.tierLogicVersion);
console.log("Weights Version:", res1.weightConfigVersion);
console.log("Validation Status:", res1.dataValidationStatus);

// TEST 2: Critical Override
console.log("\nTEST 2: Critical Override Logic");
const res2 = analyzeHealthRisks(BIOMARKERS_CRITICAL, "structural");
console.log("Triggered:", res2.criticalOverrideTriggered);
console.log("Overall Tier (Expect Elevated max or Critical):", res2.overallTier);
console.log("Note: Logic caps at Elevated if triggered, unless domain is weighted heavily enough to drive it down.");
console.log("Domain Tier (Expect Critical):", res2.domains.find(d => d.name === "Cardiometabolic")?.tier);

// TEST 3: Data Validation (Anomalies)
console.log("\nTEST 3: Data Validation");
const res3 = analyzeHealthRisks(BIOMARKERS_ANOMALY, "structural");
console.log("Validation Status:", res3.dataValidationStatus);
console.log("Warnings:", res3.validationWarnings);
console.log("Confidence Level (Expect 0):", res3.metrics.confidenceLevel);

// TEST 4: Confidence Band
console.log("\nTEST 4: Confidence Band");
console.log("Band:", res1.confidenceBand);
console.log("Explanation: Lower bound is Structural * Usage. Upper is Structural.");

// TEST 5: Longitudinal (Mock)
// We can't mock history easily in this script without manually constructing RiskAnalysis objects, 
// but we verify the field exists.
console.log("\nTEST 5: Trajectory Field Existence");
console.log("Trajectory:", res1.trajectory);
console.log("Delta:", res1.trajectoryDelta);

