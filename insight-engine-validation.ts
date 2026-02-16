
// Phase 4 Validation Script

import { generateInsights } from './src/lib/insight-engine';
import { RiskAnalysis } from './src/lib/risk-engine';

// Mock Risk Analysis Data (Output from Phase 3.5)
const MOCK_RISK_ANALYSIS: RiskAnalysis = {
    engineVersion: "3.5.0",
    tierLogicVersion: "1.0",
    weightConfigVersion: "2026-02",
    tierMode: "structural",
    structuralScore: 78,
    reliabilityAdjustedScore: 78,
    overallTier: "Monitor",
    domains: [
        {
            name: "Cardiometabolic",
            score: 45,
            tier: "Critical", // Critical Tier
            weight: 0.25,
            weightedContribution: 11.25,
            contributors: [{ marker: "HbA1c", value: 8.5, status: "Critical", scoreContribution: 25 }]
        },
        {
            name: "Inflammation",
            score: 85,
            tier: "Monitor", // Monitor Tier
            weight: 0.15,
            weightedContribution: 12.75,
            contributors: []
        },
        {
            name: "Hormonal",
            score: 95,
            tier: "Optimal", // Optimal
            weight: 0.20,
            weightedContribution: 19.0,
            contributors: []
        }
    ],
    overallBreakdown: [],
    metrics: { domainCoverage: 100, markerCoverage: 100, confidenceLevel: 80 },
    dataValidationStatus: "valid",
    validationWarnings: [],
    criticalOverrideTriggered: true, // Triggered!
    confidenceBand: { lower: 78, upper: 78 },
    trajectory: "Declining", // Global Trajectory
    actionTriggers: [],
    missingDomainAssumption: "neutral",
    tierHierarchy: [],
    timestamp: new Date().toISOString()
};

console.log("--- INSIGHT ENGINE (PHASE 4) VALIDATION ---\n");

const insights = generateInsights(MOCK_RISK_ANALYSIS);

console.log(`Version: ${insights.insightEngineVersion}`);
console.log(`Top Priority: ${insights.topPriorityDomain}`);
console.log(`Action Summary:`, insights.actionSummary);

console.log("\n--- INSIGHT DETAILS ---");
insights.insights.forEach(i => {
    console.log(`\nDOMAIN: ${i.domain}`);
    console.log(`Class: ${i.classification} | Severity: ${i.severity}`);
    console.log(`Priority Score: ${i.rawPriorityScore}`);
    console.log(`Narrative: ${i.narrative}`);
    console.log(`Actions:`, i.recommendedActions.map(a => `${a.interventionLevel}: ${a.actionType}`));

    // MATH VERIFICATION
    // Formula: (tierSeverityWeight × 0.4) + (trajectoryWeight × 0.2) + (domainWeight × 0.2) + (criticalOverrideBonus × 0.2)
    // Critical Tier=10, Elevated=7, Monitor=4, Optimal=1
    // Declining=5, Stable=2
    // Override Bonus=10 if Critical+Triggered

    // Manual Check output for validation log:
    // Cardiometabolic: (10 * 0.4) + (5 * 0.2) + (5.0 * 0.2) + (10 * 0.2) = 4 + 1 + 1 + 2 = 8.0?
    // Let's see what the code calculated.
});

console.log("\n--- JSON OUTPUT ---");
console.log(JSON.stringify(insights, null, 2));
