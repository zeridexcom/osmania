import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  RATE_LIMIT_CONFIG,
  checkRateLimit,
  extractClientIp,
  resetRateLimit,
} from "@/lib/ratelimit";

beforeEach(() => {
  resetRateLimit();
});

afterEach(() => {
  resetRateLimit();
});

describe("checkRateLimit", () => {
  it("allows the first 5 requests", () => {
    for (let i = 0; i < RATE_LIMIT_CONFIG.maxRequests; i += 1) {
      const r = checkRateLimit("1.1.1.1");
      expect(r.allowed).toBe(true);
    }
  });

  it("blocks the 6th request", () => {
    for (let i = 0; i < RATE_LIMIT_CONFIG.maxRequests; i += 1) {
      checkRateLimit("1.1.1.1");
    }
    const sixth = checkRateLimit("1.1.1.1");
    expect(sixth.allowed).toBe(false);
    expect(sixth.remaining).toBe(0);
  });

  it("isolates IPs", () => {
    for (let i = 0; i < RATE_LIMIT_CONFIG.maxRequests; i += 1) {
      checkRateLimit("1.1.1.1");
    }
    const other = checkRateLimit("2.2.2.2");
    expect(other.allowed).toBe(true);
  });

  it("reports remaining count", () => {
    const r1 = checkRateLimit("3.3.3.3");
    expect(r1.remaining).toBe(RATE_LIMIT_CONFIG.maxRequests - 1);
    const r2 = checkRateLimit("3.3.3.3");
    expect(r2.remaining).toBe(RATE_LIMIT_CONFIG.maxRequests - 2);
  });
});

describe("extractClientIp", () => {
  it("prefers x-forwarded-for", () => {
    const h = new Headers({
      "x-forwarded-for": "10.0.0.1, 10.0.0.2",
      "x-real-ip": "10.0.0.3",
    });
    expect(extractClientIp(h)).toBe("10.0.0.1");
  });

  it("falls back to x-real-ip", () => {
    const h = new Headers({ "x-real-ip": "10.0.0.5" });
    expect(extractClientIp(h)).toBe("10.0.0.5");
  });

  it("returns fallback when no headers are present", () => {
    const h = new Headers();
    expect(extractClientIp(h)).toBe(RATE_LIMIT_CONFIG.fallbackIp);
  });
});
