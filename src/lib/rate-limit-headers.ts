import { NextResponse } from "next/server";

export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  limit: number,
  resetMs: number
): NextResponse {
  response.headers.set("X-RateLimit-Limit", String(limit));
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(resetMs / 1000)));
  return response;
}
