/** In-memory rate limit store keyed by identifier (e.g. IP address). */
const rateMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Configuration for a rate limit bucket.
 */
export interface RateLimitConfig {
  /** Duration of the rate limit window in milliseconds. */
  windowMs: number;
  /** Maximum number of requests allowed within the window. */
  max: number;
}

/**
 * Result returned by {@link checkRateLimit}.
 */
export interface RateLimitResult {
  /** Whether the request is within the allowed limit. */
  allowed: boolean;
  /** Number of requests remaining in the current window. */
  remaining: number;
  /** Timestamp (ms) when the current window resets. */
  resetAt: number;
}

/**
 * Checks whether a request is allowed under the rate limit for a given key.
 *
 * Uses an in-memory sliding window counter. Entries are automatically reset
 * when their window expires.
 *
 * @param key - Unique identifier for the rate limit bucket (e.g. IP address or user ID)
 * @param config - Rate limit configuration specifying window duration and max requests
 * @returns Whether the request is allowed, remaining count, and window reset time
 *
 * @example
 * ```ts
 * const result = checkRateLimit("127.0.0.1", { windowMs: 60_000, max: 10 })
 * if (!result.allowed) {
 *   return new Response("Too Many Requests", { status: 429 })
 * }
 * ```
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.max - 1, resetAt: now + config.windowMs };
  }

  entry.count++;
  if (entry.count > config.max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: config.max - entry.count, resetAt: entry.resetAt };
}

/** Rate limit config for general API endpoints: 60 requests per minute. */
export const API_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000,
  max: 60,
};

/** Rate limit config for authentication endpoints: 5 requests per 15 minutes. */
export const AUTH_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  max: 5,
};

/** Rate limit config for search endpoints: 20 requests per minute. */
export const SEARCH_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000,
  max: 20,
};

/** Rate limit config for search suggestion endpoints: 60 requests per minute. */
export const SUGGESTION_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000,
  max: 60,
};

/** Rate limit config for AI summarization endpoints: 10 requests per minute. */
export const SUMMARY_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000,
  max: 10,
};
