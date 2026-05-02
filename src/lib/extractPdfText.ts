/**
 * PDF text extraction with a two-stage hybrid strategy:
 *
 *   Stage 1 — pdf-parse (fast, free, offline):
 *     Works perfectly for digital/text-based PDFs. No network call needed.
 *     This is the primary path for ~95% of real lab reports.
 *
 *   Stage 2 — OCR.space image-render mode (fallback):
 *     Used only when Stage 1 returns too little text, meaning the PDF is
 *     likely scanned or image-based. Requires OCR_SPACE_API_KEY to be set.
 *     If the key is not configured, we skip Stage 2 and return a clear error.
 *
 * This two-stage design avoids the original bug where OCR.space was the ONLY
 * extraction path and was treating every PDF as a rasterised image.
 */

/** User-facing message when all extraction strategies fail. */
export const IMAGE_BASED_PDF_MESSAGE =
  'This file appears to be image-based (scanned). Please upload a digital lab report or enter values manually.';

/** User-facing message when OCR is not configured and Stage 1 failed. */
const OCR_NOT_CONFIGURED_MESSAGE =
  'This PDF does not contain extractable text. To support scanned PDFs, ' +
  'add an OCR_SPACE_API_KEY to your environment variables. ' +
  'Alternatively, upload a digital lab report or enter your values manually.';

/**
 * Minimum characters Stage 1 must extract before we consider the result usable.
 * 100 is high enough to filter near-empty results while accepting short reports.
 */
const MIN_TEXT_LENGTH = 100;

/** Hard timeout for the OCR.space network call. Keep well under Vercel's 60s limit. */
const OCR_STAGE2_TIMEOUT_MS = 25_000;

interface OCRResponse {
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string[];
  ParsedResults?: Array<{ ParsedText: string }>;
}

/**
 * Main entry point. Tries pdf-parse first, then OCR.space if needed and configured.
 *
 * @throws {Error} with a user-friendly message on all failure paths.
 */
export async function extractPdfText(
  fileBuffer: Buffer,
  _mimeType: string = 'application/pdf'
): Promise<string> {
  // ── Stage 1: pdf-parse — handles digital/text-based PDFs ─────────────────
  try {
    const text = await extractWithPdfParse(fileBuffer);
    if (text.length >= MIN_TEXT_LENGTH) {
      return text;
    }
    // Text too short — PDF may be scanned. Fall through to Stage 2.
  } catch {
    // pdf-parse throws on corrupt or password-protected PDFs — fall through.
  }

  // ── Stage 2: OCR.space — fallback for scanned/image-based PDFs ───────────
  const ocrApiKey = process.env.OCR_SPACE_API_KEY;
  if (!ocrApiKey) {
    // Key not configured — give a clear, actionable error instead of a cryptic failure.
    throw new Error(OCR_NOT_CONFIGURED_MESSAGE);
  }

  const ocrText = await attemptOcrSpaceFallback(fileBuffer, ocrApiKey);
  if (ocrText && ocrText.trim().length >= MIN_TEXT_LENGTH) {
    return ocrText.trim();
  }

  // Both stages failed — PDF is truly unreadable (encrypted, corrupt, pure image).
  throw new Error(IMAGE_BASED_PDF_MESSAGE);
}

async function extractWithPdfParse(fileBuffer: Buffer): Promise<string> {
  const pdfParse = loadPdfParse();

  if (typeof pdfParse === 'function') {
    const parsed = await pdfParse(fileBuffer);
    return parsed.text?.trim() ?? '';
  }

  if (typeof pdfParse.PDFParse === 'function') {
    const parser = new pdfParse.PDFParse({ data: new Uint8Array(fileBuffer) });
    try {
      const parsed = await parser.getText();
      return parsed.text?.trim() ?? '';
    } finally {
      await parser.destroy();
    }
  }

  throw new Error('PDF parser is unavailable.');
}

function loadPdfParse() {
  // pdf-parse v2 touches these globals during module evaluation in some
  // server runtimes. Define tiny no-op versions before requiring it so the
  // API route never crashes before our handler/catch can return JSON.
  const globalScope = globalThis as Record<string, unknown>;

  if (!globalScope["DOMMatrix"]) globalScope["DOMMatrix"] = class {};
  if (!globalScope["ImageData"]) globalScope["ImageData"] = class {};
  if (!globalScope["Path2D"]) globalScope["Path2D"] = class {};

  // Use require() since this is server-only code and pdf-parse ships mixed CJS/ESM.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('pdf-parse');
}

/**
 * Calls OCR.space in image-render mode (rasterises the PDF then OCRs the pixels).
 * Only called when pdf-parse confirmed the PDF lacks sufficient embedded text.
 */
async function attemptOcrSpaceFallback(
  fileBuffer: Buffer,
  apiKey: string
): Promise<string> {
  const blob = new Blob([new Uint8Array(fileBuffer)], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('file', blob, 'report.pdf');
  formData.append('language', 'eng');
  formData.append('isOverlayRequired', 'false');
  formData.append('detectOrientation', 'true');
  formData.append('isTable', 'true');
  formData.append('OCREngine', '2');
  // Explicitly declare filetype so OCR.space treats it as PDF, not JPEG.
  formData.append('filetype', 'PDF');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OCR_STAGE2_TIMEOUT_MS);

  try {
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: { apikey: apiKey },
      body: formData,
      signal: controller.signal,
    });

    const data = (await response.json()) as OCRResponse;

    if (!response.ok || data.IsErroredOnProcessing) {
      console.warn('[OCR.space] Error:', data.ErrorMessage?.[0] || 'Unknown error');
      return '';
    }

    return data.ParsedResults?.map((r) => r.ParsedText).join('\n') || '';
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('OCR timed out. Please try again or enter your values manually.');
    }
    if ((err as Error).message?.includes('expected pattern')) {
      throw new Error('OCR fallback is not configured correctly. Please upload a digital PDF or enter your values manually.');
    }
    console.warn('[OCR.space] Fetch failed:', (err as Error).message);
    return ''; // Non-fatal — outer function handles the empty result
  } finally {
    clearTimeout(timeoutId);
  }
}
