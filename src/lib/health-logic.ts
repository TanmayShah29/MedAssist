/**
 * Recalculates the health score based on biomarker statuses if the AI score is missing or invalid.
 */
export function validateAndRecalculateScore(groqScore: number, biomarkers: { status: string }[]): number {
    if (!groqScore || groqScore < 0 || groqScore > 100) {
        const optimal = biomarkers.filter(b => b.status === 'optimal').length
        const warning = biomarkers.filter(b => b.status === 'warning').length
        const critical = biomarkers.filter(b => b.status === 'critical').length
        const total = biomarkers.length

        if (total === 0) return 0

        const rawScore = ((optimal * 100) + (warning * 75) + (critical * 40)) / total
        const floor = optimal > 0 ? 50 : 30
        return Math.round(Math.max(floor, rawScore))
    }
    return groqScore
}

/**
 * Normalizes various status strings into the app's standard set.
 */
export function normalizeStatus(status: string): 'optimal' | 'warning' | 'critical' {
    const s = status?.toLowerCase();
    if (s === 'normal' || s === 'optimal' || s === 'stable' || s === 'within range') return 'optimal';
    if (s === 'warning' || s === 'monitor' || s === 'borderline' || s === 'elevated') return 'warning';
    if (s === 'critical' || s === 'high' || s === 'low' || s === 'action required' || s === 'abnormal') return 'critical';
    return 'warning';
}
