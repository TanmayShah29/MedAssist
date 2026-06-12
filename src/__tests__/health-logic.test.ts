import { describe, it, expect } from 'vitest';
import { normalizeStatus, validateAndRecalculateScore } from '../lib/health-logic';

// ─────────────────────────────────────────────────────────────────────────────
// normalizeStatus
// ─────────────────────────────────────────────────────────────────────────────

describe('normalizeStatus', () => {
  it.each([
    ['normal', 'optimal'],
    ['optimal', 'optimal'],
    ['stable', 'optimal'],
    ['within range', 'optimal'],
  ])('maps "%s" → "optimal"', (input, expected) => {
    expect(normalizeStatus(input)).toBe(expected);
  });

  it.each([
    ['critical', 'critical'],
    ['high', 'critical'],
    ['low', 'critical'],
    ['action required', 'critical'],
    ['abnormal', 'critical'],
  ])('maps "%s" → "critical"', (input, expected) => {
    expect(normalizeStatus(input)).toBe(expected);
  });

  it.each([
    ['elevated', 'warning'],
    ['borderline', 'warning'],
    ['unknown', 'warning'],
    ['', 'warning'],
  ])('maps "%s" → "warning" (safe default)', (input, expected) => {
    expect(normalizeStatus(input)).toBe(expected);
  });

  it('is case-insensitive', () => {
    expect(normalizeStatus('NORMAL')).toBe('optimal');
    expect(normalizeStatus('HIGH')).toBe('critical');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validateAndRecalculateScore
// ─────────────────────────────────────────────────────────────────────────────

describe('validateAndRecalculateScore', () => {
  it('trusts a valid AI score in [0, 100]', () => {
    const biomarkers = [{ status: 'critical' }, { status: 'critical' }];
    // Biomarkers are all critical → formula gives 40, but AI says 78
    expect(validateAndRecalculateScore(78, biomarkers)).toBe(78);
  });

  it('trusts a valid AI score of 0', () => {
    // 0 is a valid number in [0, 100] — the function trusts the AI score
    const biomarkers = [{ status: 'optimal' }];
    expect(validateAndRecalculateScore(0, biomarkers)).toBe(0);
  });

  it('falls back to formula when AI score is NaN', () => {
    const biomarkers = [{ status: 'optimal' }, { status: 'optimal' }];
    // all optimal → (200/200)*100 = 100
    expect(validateAndRecalculateScore(NaN, biomarkers)).toBe(100);
  });

  it('falls back to formula when AI score is out of range (> 100)', () => {
    const biomarkers = [{ status: 'warning' }];
    // (75/100)*100 = 75
    expect(validateAndRecalculateScore(150, biomarkers)).toBe(75);
  });

  it('falls back to formula when AI score is negative', () => {
    const biomarkers = [{ status: 'warning' }];
    expect(validateAndRecalculateScore(-5, biomarkers)).toBe(75);
  });

  it('returns 0 for an empty biomarker array', () => {
    expect(validateAndRecalculateScore(NaN, [])).toBe(0);
  });

  it('computes correctly with mixed statuses', () => {
    // 2 optimal (200), 1 warning (75), 1 critical (40) → 315/4 = 78.75 → 79
    const biomarkers = [
      { status: 'optimal' },
      { status: 'optimal' },
      { status: 'warning' },
      { status: 'critical' },
    ];
    expect(validateAndRecalculateScore(NaN, biomarkers)).toBe(79);
  });
});
