/** User-facing message when PDF is image-based (scanned) and text extraction fails. */
export const IMAGE_BASED_PDF_MESSAGE =
    'This file appears to be image-based. Please upload a digital lab report or enter values manually.';
const OCR_TIMEOUT_MS = 58_000; // 58s to avoid hung requests, max limit for Vercel Hobby is 60s

interface OCRResponse {
    IsErroredOnProcessing?: boolean;
    ErrorMessage?: string[];
    ParsedResults?: Array<{
        ParsedText: string;
    }>;
}

export async function extractPdfText(fileBuffer: Buffer, mimeType: string = 'application/pdf'): Promise<string> {
    const blob = new Blob([new Uint8Array(fileBuffer)], { type: mimeType })

    const formData = new FormData()
    formData.append('file', blob, 'report.pdf') // OCR.space expects 'file' for binary or 'base64Image' for base64
    formData.append('language', 'eng')
    formData.append('isOverlayRequired', 'false')
    formData.append('detectOrientation', 'true')
    formData.append('isTable', 'true')
    formData.append('OCREngine', '2')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), OCR_TIMEOUT_MS)

    let response: Response
    try {
        response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            headers: {
                'apikey': process.env.OCR_SPACE_API_KEY!
            },
            body: formData,
            signal: controller.signal
        })
    } catch (err) {
        clearTimeout(timeoutId)
        if (err instanceof Error && err.name === 'AbortError') {
            throw new Error('OCR timed out. Please try again or enter values manually.')
        }
        throw err
    } finally {
        clearTimeout(timeoutId)
    }

    const data = (await response.json()) as OCRResponse;

    if (!response.ok || data.IsErroredOnProcessing) {
        throw new Error(`OCR failed: ${data.ErrorMessage?.[0] || 'Unknown error'}`)
    }

    const text = data.ParsedResults
        ?.map((r) => r.ParsedText)
        .join('\n') || ''

    if (!text || text.trim().length < 50) {
        throw new Error(IMAGE_BASED_PDF_MESSAGE);
    }

    return text
}
