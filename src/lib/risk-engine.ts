
import { Biomarker } from "../store/useStore";
export type { Biomarker };

// --- 0. Versioning Constants (v3.5) ---
export const ENGINE_VERSION = "3.5.0";
export const TIER_LOGIC_VERSION = "1.0";
export const WEIGHT_CONFIG_VERSION = "2026-02";

// --- 1. Domain Definitions ---

export type RiskDomain =
    | "Cardiometabolic"
    | "Inflammation"
    | "Hormonal"
    | "Liver Function"
    | "Kidney Function"
    | "Micronutrient"
    | "Hematology"
    | "Longevity";

export type RiskTier = "Optimal" | "Monitor" | "Elevated" | "Critical";
export type RiskTierMode = "structural" | "reliability_adjusted" | "hybrid";

// Explicit Tier Hierarchy for Transparency (Updated v3.0)
export const TIER_HIERARCHY = [
    { tier: "Optimal", range: [90, 100], description: "Peak performance" },
    { tier: "Monitor", range: [70, 89], description: "Sub-optimal, keep watch" },
    { tier: "Elevated", range: [50, 69], description: "Action required" },
    { tier: "Critical", range: [0, 49], description: "Immediate intervention" }
];

// --- 2. Configuration & Weights ---

export const DOMAIN_WEIGHTS: Record<RiskDomain, number> = {
    "Cardiometabolic": 0.25,
    "Inflammation": 0.15,
    "Hormonal": 0.20,
    "Micronutrient": 0.15,
    "Liver Function": 0.10,
    "Kidney Function": 0.10,
    "Hematology": 0.00,
    "Longevity": 0.05
};

interface BiomarkerConfig {
    id: string; // Matches Biomarker.name
    domain: RiskDomain;
    weight: number; // 1-10 scale relative to other markers in the domain
    optimalRange: [number, number];
    warningRange: [number, number]; // Broad range covering "Monitor" and "Elevated"
    criticalThreshold: { min?: number; max?: number };
    unit: string;
}

const BIOMARKER_CONFIG: Record<string, BiomarkerConfig> = {
    // Cardiometabolic
    "HbA1c": { id: "HbA1c", domain: "Cardiometabolic", weight: 10, optimalRange: [0, 5.6], warningRange: [5.7, 6.4], criticalThreshold: { max: 6.5 }, unit: "%" },
    "LDL Cholesterol": { id: "LDL Cholesterol", domain: "Cardiometabolic", weight: 8, optimalRange: [0, 100], warningRange: [100, 159], criticalThreshold: { max: 160 }, unit: "mg/dL" },
    "HDL Cholesterol": { id: "HDL Cholesterol", domain: "Cardiometabolic", weight: 6, optimalRange: [60, 100], warningRange: [40, 59], criticalThreshold: { min: 40 }, unit: "mg/dL" },
    "Triglycerides": { id: "Triglycerides", domain: "Cardiometabolic", weight: 7, optimalRange: [0, 149], warningRange: [150, 199], criticalThreshold: { max: 200 }, unit: "mg/dL" },

    // Inflammation
    "hs-CRP": { id: "hs-CRP", domain: "Inflammation", weight: 9, optimalRange: [0, 1.0], warningRange: [1.1, 3.0], criticalThreshold: { max: 3.1 }, unit: "mg/L" },

    // Hormonal
    "Cortisol": { id: "Cortisol", domain: "Hormonal", weight: 7, optimalRange: [6, 23], warningRange: [23, 29], criticalThreshold: { max: 30 }, unit: "µg/dL" },
    "Testosterone": { id: "Testosterone", domain: "Hormonal", weight: 8, optimalRange: [300, 1000], warningRange: [250, 300], criticalThreshold: { min: 250 }, unit: "ng/dL" },
    "TSH": { id: "TSH", domain: "Hormonal", weight: 8, optimalRange: [0.4, 4.0], warningRange: [4.1, 9.9], criticalThreshold: { max: 10.0 }, unit: "mIU/L" },

    // Micronutrient
    "Vitamin D": { id: "Vitamin D", domain: "Micronutrient", weight: 6, optimalRange: [30, 100], warningRange: [20, 29], criticalThreshold: { min: 20 }, unit: "ng/mL" },
    "Ferritin": { id: "Ferritin", domain: "Micronutrient", weight: 7, optimalRange: [30, 400], warningRange: [15, 29], criticalThreshold: { min: 15 }, unit: "ng/mL" },
    "Vitamin B12": { id: "Vitamin B12", domain: "Micronutrient", weight: 5, optimalRange: [400, 900], warningRange: [200, 399], criticalThreshold: { min: 200 }, unit: "pg/mL" },

    // Liver
    "ALT": { id: "ALT", domain: "Liver Function", weight: 5, optimalRange: [0, 29], warningRange: [30, 49], criticalThreshold: { max: 50 }, unit: "U/L" },

    // Kidney
    "Creatinine": { id: "Creatinine", domain: "Kidney Function", weight: 8, optimalRange: [0.6, 1.2], warningRange: [1.21, 1.5], criticalThreshold: { max: 1.5 }, unit: "mg/dL" }
};

// --- 3. Output Interfaces (v3.5) ---

export interface DomainAnalysis {
    name: RiskDomain;
    score: number; // 0-100
    tier: RiskTier;
    weight: number; // Domain weight
    weightedContribution: number;
    contributors: Array<{
        marker: string;
        value: number;
        status: RiskTier;
        scoreContribution: number; // Raw score
    }>;
}

export interface RiskAnalysis {
    engineVersion: string; // v3.5
    tierLogicVersion: string;
    weightConfigVersion: string;
    tierMode: RiskTierMode;

    structuralScore: number;
    reliabilityAdjustedScore: number;
    effectiveTierScore?: number;

    overallTier: RiskTier;
    domains: DomainAnalysis[];
    overallBreakdown: Array<{
        domain: string;
        domainScore: number;
        domainWeight: number;
        weightedContribution: number;
    }>;
    metrics: {
        domainCoverage: number; // %
        markerCoverage: number; // %
        confidenceLevel: number; // %
    };

    // v3.5 New Fields
    dataValidationStatus: "valid" | "incomplete" | "anomalous";
    validationWarnings: string[];
    criticalOverrideTriggered: boolean;
    confidenceBand: { lower: number; upper: number };
    trajectory: "Improving" | "Stable" | "Declining" | "Baseline";
    trajectoryDelta?: {
        structuralDelta: number;
        reliabilityDelta: number;
    };
    actionTriggers: Array<{ domain: string; tier: string; priority: string }>;
    smoothedStructuralScore?: number; // Optional if enabled

    missingDomainAssumption: string;
    tierHierarchy: typeof TIER_HIERARCHY;
    timestamp: string;
}

// --- 4. Validation Logic (v3.5) ---

function validateBiomarkerInternal(marker: Biomarker, config: BiomarkerConfig): string[] {
    const warnings: string[] = [];
    if (isNaN(marker.value) || marker.value === null) warnings.push(`Invalid value for ${marker.name}`);
    if (marker.value < 0) warnings.push(`Negative value for ${marker.name}`); // Assuming all bio markers are positive

    // 5x Range Check (Anomaly)
    // Heuristic: If value > 5 * max(optimal, warning)
    const upperLimit = Math.max(config.optimalRange[1], config.warningRange[1]) * 5;
    if (marker.value > upperLimit) warnings.push(`Anomalous value for ${marker.name} (>5x range)`);

    return warnings;
}

// --- 5. Scoring Engine Logic ---

function calculateMarkerScore(value: number, config: BiomarkerConfig): { score: number; tier: RiskTier } {
    const { optimalRange, warningRange, criticalThreshold } = config;

    // 1. Critical Check (0-49 score range, fixed to 25)
    if ((criticalThreshold.max !== undefined && value >= criticalThreshold.max) ||
        (criticalThreshold.min !== undefined && value <= criticalThreshold.min)) {
        return { score: 25, tier: "Critical" };
    }

    // 2. Optimal Check (90-100 score range, fixed to 100)
    if (value >= optimalRange[0] && value <= optimalRange[1]) {
        return { score: 100, tier: "Optimal" };
    }

    // 3. Warning Check (50-89 score range)
    // 65 is Elevated (50-69)
    return { score: 65, tier: "Elevated" };
}

function getTierFromScore(score: number): RiskTier {
    if (score >= 90) return "Optimal";
    if (score >= 70) return "Monitor";
    if (score >= 50) return "Elevated";
    return "Critical";
}

// Helper to get numeric rank
function getTierRank(tier: RiskTier): number {
    switch (tier) {
        case "Optimal": return 3;
        case "Monitor": return 2;
        case "Elevated": return 1;
        case "Critical": return 0;
        default: return 0;
    }
}

function getTierFromRank(rank: number): RiskTier {
    if (rank >= 3) return "Optimal";
    if (rank === 2) return "Monitor";
    if (rank === 1) return "Elevated";
    return "Critical";
}

// Configuration Flags (v3.5)
const CONFIG = {
    criticalOverrideEnabled: true,
    scoreSmoothingEnabled: true,
    smoothingWindow: 2
};

export const TIER_MODE: RiskTierMode = "structural"; // Default

export function analyzeHealthRisks(
    biomarkers: Biomarker[],
    mode: RiskTierMode = TIER_MODE,
    history: RiskAnalysis[] = [] // Optional history for longitudinal
): RiskAnalysis {

    // --- Step 2: Data Validation ---
    const validationWarnings: string[] = [];
    const activeMarkers = biomarkers.map(m => {
        const config = BIOMARKER_CONFIG[m.name] || Object.values(BIOMARKER_CONFIG).find(c => m.name.includes(c.id));
        if (config) {
            const warning = validateBiomarkerInternal(m, config);
            validationWarnings.push(...warning);
        }
        return { marker: m, config };
    }).filter(item => item.config !== undefined);

    const dataValidationStatus = validationWarnings.length > 0 ? "anomalous" : "valid";

    // If anomalous, we might want to halt or flag confidence. 
    // Requirement: "Set confidenceLevel = 0"
    const isAnomalous = dataValidationStatus === "anomalous";

    // --- Scoring Calculation (Standard) ---
    const domainData: Record<string, { totalWeightedScore: number; totalMaxWeight: number; contributors: any[]; hasCritical: boolean }> = {};
    const domainsWithData = new Set<string>();
    let globalCriticalTriggered = false;

    activeMarkers.forEach(({ marker, config }) => {
        if (!config) return;
        domainsWithData.add(config.domain);

        if (!domainData[config.domain]) {
            domainData[config.domain] = { totalWeightedScore: 0, totalMaxWeight: 0, contributors: [], hasCritical: false };
        }

        const { score, tier } = calculateMarkerScore(marker.value, config);

        if (tier === "Critical") {
            domainData[config.domain].hasCritical = true;
            globalCriticalTriggered = true;
        }

        domainData[config.domain].totalWeightedScore += score * config.weight;
        domainData[config.domain].totalMaxWeight += 100 * config.weight;

        domainData[config.domain].contributors.push({
            marker: marker.name,
            value: marker.value,
            status: tier,
            scoreContribution: score
        });
    });

    const activeDomainsList = Array.from(domainsWithData);
    const totalActiveBaseWeight = activeDomainsList.reduce((sum, d) => sum + (DOMAIN_WEIGHTS[d as RiskDomain] || 0), 0);

    const processedDomains: DomainAnalysis[] = Object.keys(DOMAIN_WEIGHTS).map(domainKey => {
        const domain = domainKey as RiskDomain;
        const data = domainData[domain];
        const hasData = domainsWithData.has(domain);

        const baseWeight = DOMAIN_WEIGHTS[domain];
        const effectiveWeight = (hasData && totalActiveBaseWeight > 0)
            ? parseFloat((baseWeight / totalActiveBaseWeight).toFixed(4))
            : 0;

        let domainScore = 0;
        let tier: RiskTier = "Optimal";
        let contributors: any[] = [];
        let hasCritical = false;

        if (hasData && data.totalMaxWeight > 0) {
            domainScore = Math.round((data.totalWeightedScore / data.totalMaxWeight) * 100);
            tier = getTierFromScore(domainScore);
            contributors = data.contributors.sort((a: any, b: any) => a.scoreContribution - b.scoreContribution);
            hasCritical = data.hasCritical;
        }

        // Critical Override Logic (Domain Level)
        if (CONFIG.criticalOverrideEnabled && hasCritical) {
            tier = "Critical"; // Force Tier
            // Note: Score remains calculated score for math transparency, but Tier is forced.
        }

        return {
            name: domain,
            score: domainScore,
            tier: tier,
            weight: effectiveWeight,
            weightedContribution: parseFloat((domainScore * effectiveWeight).toFixed(2)),
            contributors
        };
    }).filter(d => domainsWithData.has(d.name));

    const structuralScoreRaw = processedDomains.reduce((sum, d) => sum + d.weightedContribution, 0);
    const structuralScore = Math.round(structuralScoreRaw);

    const totalDefinedDomains = Object.keys(DOMAIN_WEIGHTS).filter(d => DOMAIN_WEIGHTS[d as RiskDomain] > 0).length;
    const activeDomainCount = domainsWithData.size;
    const domainCoverage = activeDomainCount / totalDefinedDomains;

    const reliabilityAdjustedScore = Math.round(structuralScore * domainCoverage);

    const activeMarkerCount = activeMarkers.length;
    const totalConfigMarkers = Object.keys(BIOMARKER_CONFIG).length;
    const markerCoverage = Math.min(1, activeMarkerCount / totalConfigMarkers);

    let confidenceLevel = Math.round(domainCoverage * 100);
    if (isAnomalous) confidenceLevel = 0; // v3.5 Rule

    // --- Tier Mode Governance ---
    let overallTier: RiskTier = "Critical";
    let effectiveTierScore: number | undefined;
    const structuralTier = getTierFromScore(structuralScore);

    if (mode === "structural") {
        overallTier = structuralTier;
        effectiveTierScore = structuralScore;
    }
    else if (mode === "reliability_adjusted") {
        overallTier = getTierFromScore(reliabilityAdjustedScore);
        effectiveTierScore = reliabilityAdjustedScore;
    }
    else if (mode === "hybrid") {
        let rank = getTierRank(structuralTier);
        if (domainCoverage < 0.50) rank -= 2;
        else if (domainCoverage < 0.70) rank -= 1;
        rank = Math.max(0, rank);
        const structuralRank = getTierRank(structuralTier);
        rank = Math.min(rank, structuralRank); // Never upgrade
        overallTier = getTierFromRank(rank);
        effectiveTierScore = structuralScore;
    }

    // Critical Override Logic (Overall Level)
    const criticalOverrideTriggered = CONFIG.criticalOverrideEnabled && globalCriticalTriggered;
    if (criticalOverrideTriggered) {
        // Cap at Elevated
        const currentRank = getTierRank(overallTier);
        const maxRank = getTierRank("Elevated");
        if (currentRank > maxRank) {
            overallTier = "Elevated";
        }
    }

    // "Weakest Link" Override (Legacy Safety) -> If any domain is Critical/Elevated (and not just overridden), cap at Monitor?
    // The Critical Override Logic basically supersedes this for "Critical", but "Elevated" still needs handling for Optimal cap.
    const hasElevatedOrWorse = processedDomains.some(d => d.tier === "Elevated" || d.tier === "Critical");
    if (overallTier === "Optimal" && hasElevatedOrWorse) {
        overallTier = "Monitor";
    }

    // --- Longitudinal & Stability ---
    let smoothedStructuralScore = structuralScore;
    let trajectory: RiskAnalysis["trajectory"] = "Baseline";
    let trajectoryDelta = { structuralDelta: 0, reliabilityDelta: 0 };

    if (history.length > 0) {
        // Smoothing
        if (CONFIG.scoreSmoothingEnabled) {
            const window = history.slice(0, CONFIG.smoothingWindow - 1); // Get previous N-1
            const scores = [structuralScore, ...window.map(h => h.structuralScore)];
            smoothedStructuralScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        }

        // Trajectory
        const prev = history[0]; // Most recent
        const deltaStruct = structuralScore - prev.structuralScore;
        const deltaRel = reliabilityAdjustedScore - prev.reliabilityAdjustedScore;
        trajectoryDelta = { structuralDelta: deltaStruct, reliabilityDelta: deltaRel };

        if (deltaStruct > 2) trajectory = "Improving";
        else if (deltaStruct < -2) trajectory = "Declining";
        else trajectory = "Stable";
    }

    // Confidence Band
    const confidenceBand = {
        lower: Math.round(structuralScore * domainCoverage),
        upper: structuralScore
    };

    // Action Triggers
    const actionTriggers = processedDomains
        .filter(d => d.tier !== "Optimal")
        .map(d => ({
            domain: d.name,
            tier: d.tier,
            priority: (d.tier === "Critical" || d.tier === "Elevated") ? "High" : "Medium"
        }));

    return {
        engineVersion: ENGINE_VERSION,
        tierLogicVersion: TIER_LOGIC_VERSION,
        weightConfigVersion: WEIGHT_CONFIG_VERSION,
        tierMode: mode,

        structuralScore,
        smoothedStructuralScore,
        reliabilityAdjustedScore,
        effectiveTierScore,

        overallTier,
        domains: processedDomains.sort((a, b) => a.score - b.score),
        overallBreakdown: processedDomains.map(d => ({
            domain: d.name,
            domainScore: d.score,
            domainWeight: d.weight,
            weightedContribution: d.weightedContribution
        })),
        metrics: {
            domainCoverage: Math.round(domainCoverage * 100),
            markerCoverage: Math.round(markerCoverage * 100),
            confidenceLevel
        },

        dataValidationStatus,
        validationWarnings,
        criticalOverrideTriggered,
        confidenceBand,
        trajectory,
        trajectoryDelta,
        actionTriggers,

        missingDomainAssumption: "neutral",
        tierHierarchy: TIER_HIERARCHY,
        timestamp: new Date().toISOString()
    };
}
