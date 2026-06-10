const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const FALLBACK_IP = "0.0.0.0";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function prune(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

function makeKey(ip: string, route: string): string {
  return `${route}:${ip || FALLBACK_IP}`;
}

export function checkRateLimit(ip: string, route: string = "default"): RateLimitResult {
  const now = Date.now();
  prune(now);
  const key = makeKey(ip, route);
  const config = ROUTE_LIMITS[route] ?? ROUTE_LIMITS.default;
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const bucket: Bucket = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    buckets.set(key, bucket);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: bucket.resetAt,
    };
  }
  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }
  existing.count += 1;
  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetAt: existing.resetAt,
  };
}

export function resetRateLimit(): void {
  buckets.clear();
}

export function extractClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = headers.get("x-real-ip");
  if (real) return real;
  return FALLBACK_IP;
}

export const RATE_LIMIT_CONFIG = {
  windowMs: WINDOW_MS,
  maxRequests: MAX_REQUESTS,
  fallbackIp: FALLBACK_IP,
};

export const ROUTE_LIMITS: Record<string, { windowMs: number; maxRequests: number }> = {
  default: { windowMs: 60_000, maxRequests: 5 },
  "result.lookup": { windowMs: 60_000, maxRequests: 3 },
  "notices.list": { windowMs: 60_000, maxRequests: 30 },
  "admin.login": { windowMs: 60_000, maxRequests: 5 },
  subscribe: { windowMs: 60_000, maxRequests: 10 },
};
