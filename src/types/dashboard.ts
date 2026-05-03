// NOTE: The real LabResult type lives in @/types/medical.ts.
// The types below are used exclusively for UI mock/demo data and charts.

export interface HealthMetric {
    id: string;
    label: string;
    value: number | string;
    unit?: string;
    trend: 'up' | 'down' | 'stable';
    trendValue: number;
    status: 'critical' | 'warning' | 'optimal' | 'monitor';
    lastUpdated: Date;
    subtitle?: string;
}

export interface WellnessTrendDataPoint {
    date: string; // ISO format or display string
    score: number;
}

// ─── Mock / demo data only — not used by real Supabase queries ───────────────

export const mockHealthMetrics: HealthMetric[] = [
    {
        id: 'm1',
        label: 'Health Score',
        value: 82,
        trend: 'up',
        trendValue: 2.4,
        status: 'optimal',
        lastUpdated: new Date(),
        subtitle: 'Top 12% for age group'
    },
    {
        id: 'm2',
        label: 'Risk Profile',
        value: 'Low',
        trend: 'stable',
        trendValue: 0,
        status: 'optimal',
        lastUpdated: new Date(),
        subtitle: 'Stable since Jan'
    },
    {
        id: 'm3',
        label: 'Biomarkers Flagged',
        value: 2,
        trend: 'down',
        trendValue: 1,
        status: 'warning',
        lastUpdated: new Date(),
        subtitle: 'Action required'
    },
    {
        id: 'm4',
        label: 'Sleep Quality',
        value: '8.2',
        unit: 'hrs',
        trend: 'up',
        trendValue: 0.5,
        status: 'optimal',
        lastUpdated: new Date(),
        subtitle: 'Restorative'
    }
];

export const mockWellnessTrend: WellnessTrendDataPoint[] = [
    { date: 'Jan 1', score: 65 },
    { date: 'Jan 8', score: 68 },
    { date: 'Jan 15', score: 72 },
    { date: 'Jan 22', score: 70 },
    { date: 'Feb 1', score: 75 },
    { date: 'Feb 8', score: 78 },
    { date: 'Feb 15', score: 82 }
];
