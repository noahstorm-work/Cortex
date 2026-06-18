import { describe, it, expect } from "vitest";
import { checkRateLimit, API_RATE_LIMIT } from "../rate-limit";

describe("checkRateLimit", () => {
  it("allows first request for a new key", () => {
    const result = checkRateLimit("test-key-1", API_RATE_LIMIT);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(API_RATE_LIMIT.max - 1);
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });

  it("allows requests within limit", () => {
    const key = "test-key-2";
    for (let i = 0; i < 3; i++) {
      const result = checkRateLimit(key, { windowMs: 60000, max: 5 });
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks requests exceeding limit", () => {
    const key = "test-key-3";
    const config = { windowMs: 60000, max: 2 };

    expect(checkRateLimit(key, config).allowed).toBe(true);
    expect(checkRateLimit(key, config).allowed).toBe(true);
    const blocked = checkRateLimit(key, config);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    const key = "test-key-4";
    const config = { windowMs: 50, max: 1 };

    expect(checkRateLimit(key, config).allowed).toBe(true);
    expect(checkRateLimit(key, config).allowed).toBe(false);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const result = checkRateLimit(key, config);
        expect(result.allowed).toBe(true);
        resolve();
      }, 60);
    });
  });

  it("tracks remaining count correctly", () => {
    const key = "test-key-5";
    const config = { windowMs: 60000, max: 10 };

    for (let i = 0; i < 4; i++) {
      checkRateLimit(key, config);
    }
    const result = checkRateLimit(key, config);
    expect(result.remaining).toBe(5);
  });

  it("separates keys independently", () => {
    const config = { windowMs: 60000, max: 1 };

    expect(checkRateLimit("key-a", config).allowed).toBe(true);
    expect(checkRateLimit("key-b", config).allowed).toBe(true);
    expect(checkRateLimit("key-a", config).allowed).toBe(false);
    expect(checkRateLimit("key-b", config).allowed).toBe(false);
  });
});
