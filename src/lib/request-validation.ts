import { NextRequest } from "next/server";

export const MAX_REQUEST_BODY_BYTES = 1_000_000;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function validateContentLength(request: NextRequest, maxBytes: number = MAX_REQUEST_BODY_BYTES): void {
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    throw new Error(`Request body exceeds ${(maxBytes / 1024 / 1024).toFixed(0)}MB limit`);
  }
}
