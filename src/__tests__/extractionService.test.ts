/**
 * Tests for extractionService.ts
 *
 * We mock the underlying extractPdfText lib so these tests cover the
 * service layer's error-handling logic without requiring a real PDF.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the low-level PDF extraction before importing the service
vi.mock('../lib/extractPdfText', () => ({
  extractPdfText: vi.fn(),
}));

import { extractTextFromPdf, ImageBasedPdfError, ExtractionValidationError } from '../services/extractionService';
import { extractPdfText } from '../lib/extractPdfText';

const mockExtract = extractPdfText as ReturnType<typeof vi.fn>;

const VALID_TEXT = 'Hemoglobin: 13.5 g/dL\nGlucose: 95 mg/dL\nCholesterol: 180 mg/dL\nThis is a valid lab report with enough text to pass validation.';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('extractTextFromPdf', () => {
  it('returns extracted text when PDF has enough content', async () => {
    mockExtract.mockResolvedValue(VALID_TEXT);

    const buffer = Buffer.from('fake pdf bytes');
    const result = await extractTextFromPdf(buffer, 'application/pdf', 'report.pdf');

    expect(result.text).toBe(VALID_TEXT);
  });

  it('throws ExtractionValidationError when file exceeds 10 MB', async () => {
    const oversizedBuffer = Buffer.alloc(11 * 1024 * 1024); // 11 MB
    await expect(
      extractTextFromPdf(oversizedBuffer, 'application/pdf', 'huge.pdf')
    ).rejects.toBeInstanceOf(ExtractionValidationError);
  });

  it('throws ImageBasedPdfError when extracted text is too short (< 100 chars)', async () => {
    mockExtract.mockResolvedValue('tiny text');

    const buffer = Buffer.from('fake pdf');
    await expect(
      extractTextFromPdf(buffer, 'application/pdf', 'scan.pdf')
    ).rejects.toBeInstanceOf(ImageBasedPdfError);
  });

  it('throws ImageBasedPdfError when extractPdfText returns empty string', async () => {
    mockExtract.mockResolvedValue('');

    const buffer = Buffer.from('fake pdf');
    await expect(
      extractTextFromPdf(buffer, 'application/pdf', 'empty.pdf')
    ).rejects.toBeInstanceOf(ImageBasedPdfError);
  });

  it('re-throws ImageBasedPdfError from the underlying extractor', async () => {
    mockExtract.mockRejectedValue(new ImageBasedPdfError('scanned PDF'));

    const buffer = Buffer.from('fake pdf');
    await expect(
      extractTextFromPdf(buffer, 'application/pdf', 'scan.pdf')
    ).rejects.toBeInstanceOf(ImageBasedPdfError);
  });

  it('maps "OCR failed" errors to ImageBasedPdfError', async () => {
    mockExtract.mockRejectedValue(new Error('OCR failed after retries'));

    const buffer = Buffer.from('fake pdf');
    await expect(
      extractTextFromPdf(buffer, 'application/pdf', 'bad.pdf')
    ).rejects.toBeInstanceOf(ImageBasedPdfError);
  });

  it('maps "Could not extract text" errors to ImageBasedPdfError', async () => {
    mockExtract.mockRejectedValue(new Error('Could not extract text from document'));

    const buffer = Buffer.from('fake pdf');
    await expect(
      extractTextFromPdf(buffer, 'application/pdf', 'bad.pdf')
    ).rejects.toBeInstanceOf(ImageBasedPdfError);
  });

  it('maps "corrupted" errors to ImageBasedPdfError', async () => {
    mockExtract.mockRejectedValue(new Error('File is corrupted'));

    const buffer = Buffer.from('fake pdf');
    await expect(
      extractTextFromPdf(buffer, 'application/pdf', 'corrupted.pdf')
    ).rejects.toBeInstanceOf(ImageBasedPdfError);
  });

  it('re-throws unexpected errors that are not extraction-related', async () => {
    const unexpectedError = new Error('Disk read error');
    mockExtract.mockRejectedValue(unexpectedError);

    const buffer = Buffer.from('fake pdf');
    await expect(
      extractTextFromPdf(buffer, 'application/pdf', 'fail.pdf')
    ).rejects.toThrow('Disk read error');
  });

  it('trims leading/trailing whitespace from extracted text', async () => {
    mockExtract.mockResolvedValue('   ' + VALID_TEXT + '   ');

    const buffer = Buffer.from('fake pdf');
    const result = await extractTextFromPdf(buffer, 'application/pdf', 'report.pdf');

    expect(result.text.startsWith(' ')).toBe(false);
    expect(result.text.endsWith(' ')).toBe(false);
  });
});
