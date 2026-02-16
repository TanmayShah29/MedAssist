
import { RiskAnalysis, DomainAnalysis, RiskTier } from "./risk-engine";

// --- Types ---

export type SignalClassification =
    | "Critical Risk"
    | "Elevated Risk"
    | "Optimization Opportunity"
    | "Stable"
    | "High Performance";

export interface RecommendedAction {
    interventionLevel: "Immediate" | "Urgent" | "Short-Term" | "Optimization" | "Maintain" | "Hold";
    actionType: "Specialist Referral" | "Confirmatory Testing" | "Testing/Lifestyle" | "Lifestyle Optimization" | "Routine Check" | "Validate Data";
    expectedImpact: "High" | "Moderate" | "Steady" | "Unknown";
    timeHorizon: "Now" | "2-4 Weeks" | "3-6 Months" | "Ongoing";
}

export interface Insight {
    domain: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    classification: SignalClassification;
    drivers: string[];
    trend: string;
    confidence: number;
    narrative: string;

    // Scoring Breakdown
    rawPriorityScore: number;
    normalizedPriorityScore: number;
    finalPriorityScore: number; // Integer 0-100

    // Audit Fields
    baseBand: string;
    downgradedBand: string | null;

    recommendedActions: RecommendedAction[];
}

export interface InsightConfig {
    modelType: "Model B (Risk Preserved)";
    weights: {
        tier: Record<RiskTier, number>;
        trajectory: Record<string, number>;
        overrideBonus: number;
        domainScale: number;
    };
    bands: Record<string, string>;
    version: string;
}

export interface InsightAnalysis {
    insightEngineVersion: string;
    priorityConfig: InsightConfig;
    insights: Insight[];
    topPriorityDomain: string;
    actionSummary: {
        immediateActions: number;
        urgentActions: number;
        shortTermActions: number;
        optimizationActions: number;
        maintainActions: number;
        holdActions: number;
    };
}

// --- Configuration & Constants ---

const INSIGHT_ENGINE_VERSION = "2.3.0"; // Final Seal

const PRIORITY_WEIGHTS = {
    tier: {
        "Critical": 10,
        "Elevated": 7,
        "Monitor": 4,
        "Optimal": 1
    },
    trajectory: {
        "Declining": 5,
        "Worsening": 5,
        "Stable": 2,
        "Improving": 0,
        "Baseline": 3
    },
    overrideBonus: 10,
    domainScale: 10
};

const MAX_POSSIBLE_SCORE = 9.0;
const MIN_POSSIBLE_SCORE = 0.5;

const PRIORITY_BANDS = {
    "Immediate": { min: 80, max: 100 },
    "Urgent": { min: 60, max: 79 },
    "Short-Term": { min: 40, max: 59 },
    "Optimization": { min: 20, max: 39 },
    "Maintain": { min: 0, max: 19 }
};

// --- Helper Functions ---

// Strict Confidence Normalization (0-100 Integer)
function normalizeConfidence(input: number): number {
    let conf = input;
    // Guard: detailed float (0.0 - 1.0) -> Convert to 0-100
    if (conf <= 1) {
        conf = conf * 100;
    }
    return Math.max(0, Math.min(100, Math.round(conf)));
}

function classifySignal(tier: RiskTier, delta: number = 0): SignalClassification {
    if (tier === "Critical") return "Critical Risk";
    if (tier === "Elevated") return "Elevated Risk";
    if (tier === "Monitor") return "Optimization Opportunity";
    return "Stable";
}

// Explicit Downgrade Logic
function determineAction(
    score: number, // Integer 0-100
    confidence: number, // 0-100
    validationStatus: string
): { action: RecommendedAction, baseBand: string, downgradedBand: string | null } {

    // 1. Data Integrity Gate (Anomalous Rule)
    if (validationStatus !== "valid") {
        return {
            action: {
                interventionLevel: "Hold",
                actionType: "Validate Data",
                expectedImpact: "Unknown",
                timeHorizon: "Now"
            },
            baseBand: "Hold",
            downgradedBand: null
        };
    }

    let baseBand = "Maintain";
    if (score >= PRIORITY_BANDS["Immediate"].min) baseBand = "Immediate";
    else if (score >= PRIORITY_BANDS["Urgent"].min) baseBand = "Urgent";
    else if (score >= PRIORITY_BANDS["Short-Term"].min) baseBand = "Short-Term";
    else if (score >= PRIORITY_BANDS["Optimization"].min) baseBand = "Optimization";

    // 2. Confidence Downgrade Rule (<60%)
    let effectiveBand = baseBand;
    let downgradedBand: string | null = null;

    if (confidence < 60) {
        if (baseBand === "Immediate") {
            effectiveBand = "Urgent";
            downgradedBand = "Urgent";
        } else if (baseBand === "Urgent") {
            effectiveBand = "Short-Term";
            downgradedBand = "Short-Term";
        }
        // Lower bands don't downgrade further in this model
    }

    // 3. Map Band to Action
    let action: RecommendedAction;

    switch (effectiveBand) {
        case "Immediate":
            action = { interventionLevel: "Immediate", actionType: "Specialist Referral", expectedImpact: "High", timeHorizon: "Now" };
            break;
        case "Urgent":
            if (baseBand === "Immediate" && confidence < 60) {
                action = { interventionLevel: "Urgent", actionType: "Confirmatory Testing", expectedImpact: "High", timeHorizon: "Now" };
            } else {
                action = { interventionLevel: "Urgent", actionType: "Testing/Lifestyle", expectedImpact: "High", timeHorizon: "2-4 Weeks" };
            }
            break;
        case "Short-Term":
            if (baseBand === "Urgent" && confidence < 60) {
                action = { interventionLevel: "Short-Term", actionType: "Confirmatory Testing", expectedImpact: "High", timeHorizon: "2-4 Weeks" };
            } else {
                action = { interventionLevel: "Short-Term", actionType: "Testing/Lifestyle", expectedImpact: "Moderate", timeHorizon: "2-4 Weeks" };
            }
            break;
        case "Optimization":
            action = { interventionLevel: "Optimization", actionType: "Lifestyle Optimization", expectedImpact: "Moderate", timeHorizon: "3-6 Months" };
            break;
        default:
            action = { interventionLevel: "Maintain", actionType: "Routine Check", expectedImpact: "Steady", timeHorizon: "Ongoing" };
            break;
    }

    return { action, baseBand, downgradedBand };
}

function generateNarrative(domain: DomainAnalysis, trajectory: string, confidence: number): string {
    let narrative = `Current status is ${domain.tier}.`;
    if (trajectory === "Declining" || trajectory === "Worsening") narrative += " Trend is concerning.";
    else if (trajectory === "Improving") narrative += " Showing improvement.";
    if (confidence < 60) narrative += " Low confidence requires verification.";
    return narrative;
}

// --- Main Engine ---

export function generateInsights(analysis: RiskAnalysis): InsightAnalysis {
    const rawInsights: Insight[] = [];

    // Normalize Confidence Once
    const normalizedConfidence = normalizeConfidence(analysis.metrics.confidenceLevel);

    analysis.domains.forEach(domain => {
        const delta = 0;
        const classification = classifySignal(domain.tier, delta);

        const severityMap: Record<RiskTier, Insight["severity"]> = {
            "Critical": "Critical", "Elevated": "High", "Monitor": "Medium", "Optimal": "Low"
        };

        const drivers = domain.contributors
            .filter(c => c.status === "Critical" || c.status === "Elevated")
            .map(c => c.marker);

        const narrative = generateNarrative(domain, analysis.trajectory, normalizedConfidence);

        // --- Priority Scoring (Model B Locked) ---

        const tierWeight = PRIORITY_WEIGHTS.tier[domain.tier];
        const trajWeight = PRIORITY_WEIGHTS.trajectory[analysis.trajectory] || PRIORITY_WEIGHTS.trajectory["Baseline"];
        const overrideBonus = (analysis.criticalOverrideTriggered && domain.tier === "Critical") ? PRIORITY_WEIGHTS.overrideBonus : 0;
        const effectiveDomainWeight = Math.max(0.1, domain.weight);
        const domainScore = effectiveDomainWeight * PRIORITY_WEIGHTS.domainScale;

        // 1. Raw Calculation
        const rawPriorityScore = (tierWeight * 0.4) + (trajWeight * 0.2) + (domainScore * 0.2) + (overrideBonus * 0.2);

        // 2. Normalization
        let normalizedPriorityScore = ((rawPriorityScore - MIN_POSSIBLE_SCORE) / (MAX_POSSIBLE_SCORE - MIN_POSSIBLE_SCORE)) * 100;
        normalizedPriorityScore = Math.max(0, Math.min(100, normalizedPriorityScore));

        // 3. Rounding (Explicit)
        // Anomalous Rule: Forced to 0.
        let finalPriorityScore = analysis.dataValidationStatus === "valid" ? Math.round(normalizedPriorityScore) : 0;

        // 4. Action Determination
        const { action, baseBand, downgradedBand } = determineAction(
            finalPriorityScore,
            normalizedConfidence, // Use normalized value
            analysis.dataValidationStatus
        );

        rawInsights.push({
            domain: domain.name,
            severity: severityMap[domain.tier],
            classification,
            drivers,
            trend: analysis.trajectory,
            confidence: normalizedConfidence, // Use normalized value
            narrative,

            rawPriorityScore: parseFloat(rawPriorityScore.toFixed(3)),
            normalizedPriorityScore: parseFloat(normalizedPriorityScore.toFixed(2)),
            finalPriorityScore, // Integer

            baseBand,
            downgradedBand,

            recommendedActions: [action]
        });
    });

    // 5. Sorting (Explicit Integer Sort)
    // Anomalous items have score 0 so they sort to bottom naturally.
    const sortedInsights = rawInsights.sort((a, b) => b.finalPriorityScore - a.finalPriorityScore);

    // Summary Counts
    const summary = {
        immediateActions: 0, urgentActions: 0, shortTermActions: 0,
        optimizationActions: 0, maintainActions: 0, holdActions: 0
    };

    sortedInsights.forEach(i => {
        i.recommendedActions.forEach(a => {
            if (a.interventionLevel === "Immediate") summary.immediateActions++;
            if (a.interventionLevel === "Urgent") summary.urgentActions++;
            if (a.interventionLevel === "Short-Term") summary.shortTermActions++;
            if (a.interventionLevel === "Optimization") summary.optimizationActions++;
            if (a.interventionLevel === "Maintain") summary.maintainActions++;
            if (a.interventionLevel === "Hold") summary.holdActions++;
        });
    });

    return {
        insightEngineVersion: INSIGHT_ENGINE_VERSION,
        priorityConfig: {
            modelType: "Model B (Risk Preserved)",
            weights: PRIORITY_WEIGHTS,
            bands: { "0-19": "Maintain", "20-39": "Optimization", "40-59": "Short-Term", "60-79": "Urgent", "80-100": "Immediate" },
            version: "2.3"
        },
        insights: sortedInsights,
        topPriorityDomain: sortedInsights.length > 0 ? sortedInsights[0].domain : "None",
        actionSummary: summary
    };
}
