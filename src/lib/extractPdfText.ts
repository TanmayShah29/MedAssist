/**
 * PDF text extraction with a two-stage hybrid strategy:
 *   Stage 1 — pdf-parse (fast, free, offline): works perfectly for digital/text-based PDFs.
 *   Stage 2 — OCR.space image-render mode (fallback): used only when Stage 1 returns too
 *             little text, meaning the PDF is likely scanned or image-based.
 *
 * This fixes the root bug where OCR.space was the ONLY extraction path. It was treating
 * every PDF as a rasterized image, producing empty/sparse text for digital PDFs with
 * vector text or non-standard fonts — causing valid lab reports to be rejected as
 * "image-based".
 */

// pdf-parse v2 ESM doesn't expose a default export that Turbopack can resolve.
// Use require() since this is server-only code.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

/** User-facing message when all extraction strategies fail (truly image-based PDF). */
export const IMAGE_BASED_PDF_MESSAGE =
    'This file appears to be image-based (scanned). Please upload a digital lab report or enter values manually.';

/**
 * How many characters must be extracted before we consider the text usable.
 * 50 was the original threshold — too low. Raised to 100 to filter out near-empty
 * results while still accepting short-but-valid reports.
 */
const MIN_TEXT_LENGTH = 100;

/** Per-stage timeouts. Keep both well under Vercel's 60s limit. */
const OCR_STAGE2_TIMEOUT_MS = 25_000;

interface OCRResponse {
    IsErroredOnProcessing?: boolean;
    ErrorMessage?: string[];
    ParsedResults?: Array<{
        ParsedText: string;
    }>;
}

/**
 * Main entry point. Tries pdf-parse first, falls back to OCR.space only when needed.
 */
export async function extractPdfText(fileBuffer: Buffer, _mimeType: string = 'application/pdf'): Promise<string> {
    // ── Stage 1: pdf-parse (handles digital/text-based PDFs natively) ──────────
    try {
        const parsed = await pdfParse(fileBuffer);
        const text = parsed.text?.trim() ?? '';
        if (text.length >= MIN_TEXT_LENGTH) {
            return text;
        }
        // Text too short — PDF may be scanned. Fall through to Stage 2.
    } catch {
        // pdf-parse can throw on corrupt/password-protected PDFs — fall through.
    }

    // ── Stage 2: OCR.space image-render mode (handles scanned/image PDFs) ──────
    const ocrText = await attemptOcrSpaceFallback(fileBuffer);
    if (ocrText && ocrText.trim().length >= MIN_TEXT_LENGTH) {
        return ocrText.trim();
    }

    // Both stages failed — the PDF is truly unreadable (encrypted, corrupt, pure image)
    throw new Error(IMAGE_BASED_PDF_MESSAGE);
}

/**
 * Calls OCR.space in image-render mode (rasterises the PDF page then OCRs the pixels).
 * This is the correct fallback for scanned PDFs.
 *
 * NOTE: The original code was sending PDFs here as the ONLY step and without
 * 'filetype=PDF', causing OCR.space to silently mishandle many digital PDFs.
 * Now this is only reached when pdf-parse already confirmed the PDF lacks embedded text.
 */
async function attemptOcrSpaceFallback(fileBuffer: Buffer): Promise<string> {
    const blob = new Blob([new Uint8Array(fileBuffer)], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', blob, 'report.pdf');
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('isTable', 'true');
    formData.append('OCREngine', '2');
    // Explicitly declare filetype so OCR.space processes it as a PDF, not a JPEG.
    formData.append('filetype', 'PDF');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OCR_STAGE2_TIMEOUT_MS);

    try {
        const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            headers: { 'apikey': process.env.OCR_SPACE_API_KEY! },
            body: formData,
            signal: controller.signal,
        });

        const data = (await response.json()) as OCRResponse;

        if (!response.ok || data.IsErroredOnProcessing) {
            // Log but don't throw — outer function will throw IMAGE_BASED_PDF_MESSAGE
            console.warn('[OCR.space] Error:', data.ErrorMessage?.[0] || 'Unknown error');
            return '';
        }

        return data.ParsedResults?.map((r) => r.ParsedText).join('\n') || '';
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            throw new Error('OCR timed out. Please try again or enter values manually.');
        }
        console.warn('[OCR.space] Fetch failed:', (err as Error).message);
        return ''; // Non-fatal — outer function handles the empty result
    } finally {
        clearTimeout(timeoutId);
    }
}
