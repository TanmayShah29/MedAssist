export async function extractPdfText(fileBuffer: Buffer, mimeType: string = 'application/pdf'): Promise<string> {
    const blob = new Blob([new Uint8Array(fileBuffer)], { type: mimeType })

    const formData = new FormData()
    formData.append('file', blob, 'report.pdf') // OCR.space expects 'file' for binary or 'base64Image' for base64
    formData.append('language', 'eng')
    formData.append('isOverlayRequired', 'false')
    formData.append('detectOrientation', 'true')
    formData.append('isTable', 'true')
    formData.append('OCREngine', '2')

    const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: {
            'apikey': process.env.OCR_SPACE_API_KEY!
        },
        body: formData
    })

    const data = await response.json()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!response.ok || (data as any).IsErroredOnProcessing) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error(`OCR failed: ${(data as any).ErrorMessage?.[0] || 'Unknown error'}`)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = (data as any).ParsedResults
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ?.map((r: any) => r.ParsedText)
        .join('\n') || ''

    if (!text || text.trim().length < 50) {
        throw new Error('Could not extract text from PDF. File may be empty or corrupted.')
    }

    return text
}
