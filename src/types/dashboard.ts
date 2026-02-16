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

export interface LabResult {
    id: string;
    name: string;
    value: number;
    unit: string;
    category: 'hematology' | 'inflammation' | 'vitamins' | 'metabolic';
    range: { min: number; max: number };
    status: 'critical' | 'warning' | 'optimal' | 'monitor';
    date: Date;
    trend?: 'up' | 'down' | 'stable';
}

export interface WellnessTrendDataPoint {
    date: string; // ISO format or display string
    score: number;
}

// --- MOCK DATA GENERATORS ---

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

export const mockLabResults: LabResult[] = [
    {
        id: 'l1',
        name: 'Hemoglobin',
        value: 12.8,
        unit: 'g/dL',
        range: { min: 13.5, max: 17.5 },
        category: 'hematology',
        date: new Date('2024-02-14'),
        status: 'warning',
        trend: 'down'
    },
    {
        id: 'l2',
        name: 'C-Reactive Protein',
        value: 8.4,
        unit: 'mg/L',
        range: { min: 0, max: 10 },
        category: 'inflammation',
        date: new Date('2024-02-14'),
        status: 'optimal',
        trend: 'stable'
    },
    {
        id: 'l3',
        name: 'Vitamin D',
        value: 45,
        unit: 'ng/mL',
        range: { min: 30, max: 100 },
        category: 'vitamins',
        date: new Date('2024-01-20'),
        status: 'optimal',
        trend: 'up'
    },
    {
        id: 'l4',
        name: 'Glucose (Fasting)',
        value: 105,
        unit: 'mg/dL',
        range: { min: 70, max: 100 },
        category: 'metabolic',
        date: new Date('2024-02-14'),
        status: 'monitor',
        trend: 'up'
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
