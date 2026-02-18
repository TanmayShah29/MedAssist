/**
 * PDF Text Extraction (Client-Side)
 *
 * SETUP:
 * 1. Run `npm install pdfjs-dist` if not already installed.
 * 2. Copy `node_modules/pdfjs-dist/build/pdf.worker.min.mjs` to `public/pdf.worker.min.mjs`.
 *    (For pdfjs-dist v4, the worker file uses .mjs extension.)
 *
 * Note: Scanned PDFs (image-only) will return empty or near-empty text.
 * PDF.js only extracts selectable text. Use isPDFReadable() to detect this.
 */

import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

/**
 * Extract all selectable text from a PDF file.
 * Works fully client-side — no server needed.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
    if (!file || file.type !== "application/pdf") {
        throw new Error("Invalid file: expected a PDF document.");
    }

    let arrayBuffer: ArrayBuffer;
    try {
        arrayBuffer = await file.arrayBuffer();
    } catch {
        throw new Error("Failed to read PDF file. The file may be corrupted.");
    }

    if (arrayBuffer.byteLength === 0) {
        throw new Error("PDF file is empty.");
    }

    let pdf: pdfjsLib.PDFDocumentProxy;
    try {
        pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    } catch {
        throw new Error(
            "Failed to parse PDF. The file may be corrupted or password-protected."
        );
    }

    const pageTexts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items
            .filter((item: any) => typeof item.str === "string")
            .map((item: any) => item.str)
            .join(" ");
        pageTexts.push(text);
    }

    const fullText = pageTexts.join("\n").trim();

    if (!fullText) {
        throw new Error(
            "No text could be extracted from this PDF. It may be a scanned/image-only document."
        );
    }

    return fullText;
}

/**
 * Sanity check: returns true if extracted text has at least 100 characters.
 * Scanned or image-only PDFs typically return empty or near-empty text.
 */
export function isPDFReadable(text: string): boolean {
    return text.trim().length >= 100;
}
