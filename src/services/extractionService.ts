/**
 * Extraction service: PDF text extraction with clear error semantics.
 * Used by the analyze-report API; keeps extraction logic separate from route logic.
 */

import { extractPdfText } from '@/lib/extractPdfText';

/** Thrown when the PDF appears to be image-based (scanned) and OCR yielded too little text. */
export class ImageBasedPdfError extends Error {
    constructor(message: string = 'This file appears to be image-based. Please upload a digital lab report or enter values manually.') {
        super(message);
        this.name = 'ImageBasedPdfError';
    }
}

/** Thrown when file is too large, wrong type, or other validation. */
export class ExtractionValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ExtractionValidationError';
    }
}

const MIN_EXTRACTED_LENGTH = 50;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface ExtractionResult {
    text: string;
}

/**
 * Extract text from a PDF buffer. Detects image-based (scanned) PDFs and throws
 * ImageBasedPdfError with a user-friendly message so the UI can show a clean fallback.
 */
export async function extractTextFromPdf(
    fileBuffer: Buffer,
    mimeType: string = 'application/pdf',
    fileName?: string
): Promise<ExtractionResult> {
    if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
        throw new ExtractionValidationError(`File size exceeds ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit.`);
    }

    try {
        const text = await extractPdfText(fileBuffer, mimeType);
        const trimmed = text?.trim() ?? '';
        if (trimmed.length < MIN_EXTRACTED_LENGTH) {
            throw new ImageBasedPdfError(
                'This file appears to be image-based. Please upload a digital lab report or enter values manually.'
            );
        }
        return { text: trimmed };
    } catch (err) {
        if (err instanceof ImageBasedPdfError) throw err;
        if (err instanceof ExtractionValidationError) throw err;
        const message = (err as Error).message || '';
        // OCR failed or returned very little text → treat as image-based
        if (
            message.includes('Could not extract text') ||
            message.includes('OCR failed') ||
            message.toLowerCase().includes('empty') ||
            message.toLowerCase().includes('corrupted')
        ) {
            throw new ImageBasedPdfError(
                'This file appears to be image-based. Please upload a digital lab report or enter values manually.'
            );
        }
        throw err;
    }
}
