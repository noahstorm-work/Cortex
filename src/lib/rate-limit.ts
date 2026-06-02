const rateMap = new Map<string, { count: number; resetAt: number }>()

export interface RateLimitConfig {
  windowMs: number
  max: number
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true, remaining: config.max - 1, resetAt: now + config.windowMs }
  }

  entry.count++
  if (entry.count > config.max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: config.max - entry.count, resetAt: entry.resetAt }
}

export const API_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000,
  max: 60,
}

export const AUTH_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  max: 5,
}

export const SEARCH_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000,
  max: 20,
}

export const SUGGESTION_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000,
  max: 60,
}
