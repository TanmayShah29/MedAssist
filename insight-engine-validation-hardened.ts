
// Phase 4 Final Seal Audit Script

import { generateInsights, InsightAnalysis } from './src/lib/insight-engine';
import { RiskAnalysis } from './src/lib/risk-engine';

const BASE_METRICS = { domainCoverage: 100, markerCoverage: 100, confidenceLevel: 100 };

// Base Template
const BASE_ANALYSIS: RiskAnalysis = {
    engineVersion: "3.5.0", tierLogicVersion: "1.0", weightConfigVersion: "2026-02", tierMode: "structural",
    structuralScore: 80, reliabilityAdjustedScore: 80, overallTier: "Monitor",
    domains: [], overallBreakdown: [], metrics: BASE_METRICS,
    dataValidationStatus: "valid", validationWarnings: [], criticalOverrideTriggered: false,
    confidenceBand: { lower: 80, upper: 80 }, trajectory: "Stable", actionTriggers: [],
    missingDomainAssumption: "neutral", tierHierarchy: [], timestamp: ""
};

// Scenarios

const S1_CRITICAL_HIGH_CONF: RiskAnalysis = {
    ...BASE_ANALYSIS,
    structuralScore: 40, overallTier: "Elevated",
    metrics: { ...BASE_METRICS, confidenceLevel: 90 },
    criticalOverrideTriggered: true, trajectory: "Declining",
    domains: [{ name: "Cardiometabolic", score: 25, tier: "Critical", weight: 0.25, weightedContribution: 6.25, contributors: [] }]
};

const S2_CRITICAL_LOW_CONF: RiskAnalysis = {
    ...S1_CRITICAL_HIGH_CONF,
    metrics: { ...BASE_METRICS, confidenceLevel: 45 }
};

const S3_ELEVATED_50_CONF: RiskAnalysis = {
    ...BASE_ANALYSIS,
    structuralScore: 60, overallTier: "Elevated",
    metrics: { ...BASE_METRICS, confidenceLevel: 50 },
    criticalOverrideTriggered: false, trajectory: "Declining",
    domains: [{ name: "Inflammation", score: 60, tier: "Elevated", weight: 0.15, weightedContribution: 9, contributors: [] }]
};

const S4_ANOMALOUS: RiskAnalysis = {
    ...BASE_ANALYSIS,
    dataValidationStatus: "anomalous",
    domains: [{ name: "Cardiometabolic", score: 95, tier: "Optimal", weight: 0.25, weightedContribution: 23.75, contributors: [] }]
};

const S5_FLOAT_CONF: RiskAnalysis = {
    ...S1_CRITICAL_HIGH_CONF,
    metrics: { ...BASE_METRICS, confidenceLevel: 0.59 } // Should normalize to 59
};

const S6_INT_CONF: RiskAnalysis = {
    ...S1_CRITICAL_HIGH_CONF,
    metrics: { ...BASE_METRICS, confidenceLevel: 59 } // Should stay 59
};

function runTest(name: string, input: RiskAnalysis) {
    console.log(`\n\n=== SCENARIO: ${name} ===`);
    const output = generateInsights(input);
    const i = output.insights[0];

    if (i) {
        console.log(JSON.stringify({
            rawPriorityScore: i.rawPriorityScore,
            normalizedPriorityScore: i.normalizedPriorityScore,
            finalPriorityScore: i.finalPriorityScore,
            baseBand: i.baseBand,
            downgradedBand: i.downgradedBand,
            actionLevel: i.recommendedActions[0].interventionLevel,
            confidenceLevel: i.confidence,
            dataValidationStatus: input.dataValidationStatus,
            sortingPosition: 1 // Single item array, always 1
        }, null, 2));
    } else {
        console.log("No insights generated?");
    }
}

console.log("--- INSIGHT ENGINE FINAL SEAL AUDIT ---");
// runTest("1. Critical + 90% Conf", S1_CRITICAL_HIGH_CONF);
// runTest("2. Critical + 45% Conf", S2_CRITICAL_LOW_CONF);
// runTest("3. Elevated + 50% Conf", S3_ELEVATED_50_CONF);
// runTest("4. Anomalous Case", S4_ANOMALOUS);
runTest("CASE A: Float 0.59", S5_FLOAT_CONF);
runTest("CASE B: Int 59", S6_INT_CONF);
