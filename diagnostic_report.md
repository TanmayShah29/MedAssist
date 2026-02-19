# Diagnostic Report: File Transfer Mismatch

## Frontend (`src/app/onboarding/components/step-processing.tsx`)
- **Method**: `fetch("/api/analyze-report", { method: "POST", body: formData })`
- **Payload**: `FormData` object.
- **Content**: `formData.append("file", file)` where `file` is a JavaScript `File` object (binary).

## Backend (`src/app/api/analyze-report/route.ts`)
- **Method**: `req.formData()`
- **Reception**: Retrieves `file` as a `File` object.
- **Current Processing**:
  1. Converts `File` to `ArrayBuffer`.
  2. Converts `ArrayBuffer` to `Buffer`.
  3. Converts `Buffer` to `Base64` string (with extra logic to detect headers).
  4. Passes `Base64` string to `extractPdfText`.

## Discrepancy & Fix
The transfer format (FormData) is consistent, but the backend performs an unnecessary and potentially error-prone Base64 conversion to satisfy the `extractPdfText` signature. The OCR.space API supports direct binary file upload via the `file` parameter.

**Resolution**:
1. Modify `extractPdfText` to accept a binary `Buffer` or `Blob` and send it as `file` in the FormData to OCR.space.
2. Update `route.ts` to pass the `Buffer` directly, removing the Base64 conversion logic.
