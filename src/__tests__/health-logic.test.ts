import { describe, it, expect } from 'vitest';
import { validateAndRecalculateScore, normalizeStatus } from '../lib/health-logic';

describe('Health Logic Utilities', () => {
    
    describe('normalizeStatus', () => {
        it('should normalize "normal" to "optimal"', () => {
            expect(normalizeStatus('normal')).toBe('optimal');
        });

        it('should normalize "elevated" to "warning"', () => {
            expect(normalizeStatus('elevated')).toBe('warning');
        });

        it('should normalize "high" to "critical"', () => {
            expect(normalizeStatus('high')).toBe('critical');
        });

        it('should default to "warning" for unknown statuses', () => {
            expect(normalizeStatus('unknown')).toBe('warning');
        });
    });

    describe('validateAndRecalculateScore', () => {
        it('should return the groqScore if it is valid (0-100)', () => {
            expect(validateAndRecalculateScore(85, [])).toBe(85);
        });

        it('should recalculate if groqScore is 0 or invalid', () => {
            const biomarkers = [
                { status: 'optimal' },
                { status: 'optimal' },
                { status: 'critical' }
            ];
            // ((100*2) + (40*1)) / 3 = 240 / 3 = 80
            expect(validateAndRecalculateScore(0, biomarkers)).toBe(80);
        });

        it('should apply a minimum floor of 50 if at least one is optimal', () => {
            const biomarkers = [
                { status: 'optimal' },
                { status: 'critical' },
                { status: 'critical' },
                { status: 'critical' }
            ];
            // ((100*1) + (40*3)) / 4 = 220 / 4 = 55 (already above floor)
            expect(validateAndRecalculateScore(0, biomarkers)).toBe(55);
            
            const lowBiomarkers = [
                { status: 'optimal' },
                { status: 'critical' },
                { status: 'critical' },
                { status: 'critical' },
                { status: 'critical' },
                { status: 'critical' }
            ];
            // ((100*1) + (40*5)) / 6 = 300 / 6 = 50
            expect(validateAndRecalculateScore(0, lowBiomarkers)).toBe(50);
        });
    });
});
