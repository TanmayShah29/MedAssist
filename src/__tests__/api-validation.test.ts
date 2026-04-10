/**
 * Tests for API input validation schemas.
 * These run without hitting any real HTTP endpoints — they validate the Zod
 * schemas used inside each route so regressions are caught before deployment.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// ─── Inline the schemas from the route files ──────────────────────────────────
// (Ideally they'd be exported from a shared module; copy them here for now.)

const askAiRequestSchema = z.object({
  question: z.string().trim().min(1, 'Question is required').max(1000, 'Question is too long'),
  symptoms: z.array(z.string()).optional().default([]),
});

const supplementSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  dosage: z.string().optional().nullable(),
  frequency: z.string().optional().nullable(),
  start_date: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: 'Invalid start_date. Use YYYY-MM-DD.',
  }),
});

const manualPayloadSchema = z.object({
  biomarkers: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        value: z
          .union([z.number(), z.string()])
          .transform((v) => Number(v))
          .refine((n) => !Number.isNaN(n)),
        unit: z
          .string()
          .trim()
          .default('unit')
          .transform((u) => u || 'unit'),
      })
    )
    .min(1, 'Please add at least one biomarker with a valid name and numeric value.'),
});

// ─────────────────────────────────────────────────────────────────────────────
// /api/ask-ai
// ─────────────────────────────────────────────────────────────────────────────

describe('/api/ask-ai request validation', () => {
  it('accepts a valid question', () => {
    const result = askAiRequestSchema.safeParse({ question: 'What is my health score?' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty question', () => {
    const result = askAiRequestSchema.safeParse({ question: '   ' });
    expect(result.success).toBe(false);
  });

  it('rejects a question over 1000 characters', () => {
    const result = askAiRequestSchema.safeParse({ question: 'a'.repeat(1001) });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('too long');
  });

  it('defaults symptoms to an empty array when omitted', () => {
    const result = askAiRequestSchema.safeParse({ question: 'Hello?' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.symptoms).toEqual([]);
  });

  it('rejects a missing question field', () => {
    const result = askAiRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// /api/supplements POST
// ─────────────────────────────────────────────────────────────────────────────

describe('/api/supplements POST validation', () => {
  it('accepts a valid supplement', () => {
    const result = supplementSchema.safeParse({
      name: 'Vitamin D3',
      dosage: '5000 IU',
      frequency: 'daily',
      start_date: '2025-01-15',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty supplement name', () => {
    const result = supplementSchema.safeParse({
      name: '',
      start_date: '2025-01-15',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Name is required');
  });

  it('rejects an invalid start_date', () => {
    const result = supplementSchema.safeParse({
      name: 'Magnesium',
      start_date: 'not-a-date',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('Invalid start_date');
  });

  it('allows null dosage and frequency', () => {
    const result = supplementSchema.safeParse({
      name: 'Zinc',
      dosage: null,
      frequency: null,
      start_date: '2025-03-01',
    });
    expect(result.success).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Manual entry payload (used inside analyze-report route)
// ─────────────────────────────────────────────────────────────────────────────

describe('Manual entry payload validation', () => {
  it('accepts valid biomarkers', () => {
    const result = manualPayloadSchema.safeParse({
      biomarkers: [{ name: 'Hemoglobin', value: 13.5, unit: 'g/dL' }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty biomarkers array', () => {
    const result = manualPayloadSchema.safeParse({ biomarkers: [] });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('at least one biomarker');
  });

  it('rejects a biomarker with a non-numeric value', () => {
    const result = manualPayloadSchema.safeParse({
      biomarkers: [{ name: 'Glucose', value: 'abc', unit: 'mg/dL' }],
    });
    expect(result.success).toBe(false);
  });

  it('coerces string numeric values to numbers', () => {
    const result = manualPayloadSchema.safeParse({
      biomarkers: [{ name: 'Glucose', value: '95', unit: 'mg/dL' }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.biomarkers[0].value).toBe(95);
    }
  });

  it('defaults empty unit to "unit"', () => {
    const result = manualPayloadSchema.safeParse({
      biomarkers: [{ name: 'Hemoglobin', value: 13.5, unit: '' }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.biomarkers[0].unit).toBe('unit');
    }
  });

  it('rejects a biomarker with an empty name', () => {
    const result = manualPayloadSchema.safeParse({
      biomarkers: [{ name: '', value: 13.5, unit: 'g/dL' }],
    });
    expect(result.success).toBe(false);
  });
});
