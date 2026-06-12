import { NextResponse } from "next/server";

export function apiResponse(data: unknown, init?: { status?: number; headers?: Record<string, string> }) {
  return NextResponse.json(data, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "no-store, private, max-age=0",
      ...init?.headers,
    },
  });
}
