import { NextRequest } from "next/server";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

interface RateLimitState {
  store: Map<string, RateLimitBucket>;
  calls: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __lvRateLimitState: RateLimitState | undefined;
}

function getRateLimitState(): RateLimitState {
  if (!globalThis.__lvRateLimitState) {
    globalThis.__lvRateLimitState = {
      store: new Map<string, RateLimitBucket>(),
      calls: 0,
    };
  }

  return globalThis.__lvRateLimitState;
}

function pruneRateLimitStore(now: number) {
  const state = getRateLimitState();
  state.calls += 1;

  if (state.calls % 200 !== 0 || state.store.size < 2000) {
    return;
  }

  state.store.forEach((bucket, key) => {
    if (bucket.resetAt <= now) {
      state.store.delete(key);
    }
  });
}

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

export function buildRateLimitKey(request: NextRequest, prefix: string, identity?: string): string {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const scope = identity ?? `${ip}:${userAgent.slice(0, 60)}`;
  return `${prefix}:${scope}`;
}

export function consumeRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const state = getRateLimitState();
  const now = Date.now();
  pruneRateLimitStore(now);

  const current = state.store.get(key);
  if (!current || current.resetAt <= now) {
    state.store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  state.store.set(key, current);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function isSameOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const expectedOrigin = request.nextUrl.origin;

  if (origin) {
    return origin === expectedOrigin;
  }

  const secFetchSite = request.headers.get("sec-fetch-site");
  if (!secFetchSite) {
    return true;
  }

  return secFetchSite === "same-origin" || secFetchSite === "same-site" || secFetchSite === "none";
}

export function isSafeInternalPath(value: string): boolean {
  if (!value.startsWith("/")) {
    return false;
  }

  if (value.startsWith("//")) {
    return false;
  }

  if (value.includes("\\") || value.includes("\u0000")) {
    return false;
  }

  return true;
}

export function sanitizeFileName(value: string): string {
  const normalized = value.normalize("NFKD").replace(/[^\w.-]+/g, "_");
  const compact = normalized.replace(/_+/g, "_").slice(0, 140);
  return compact || "arquivo";
}
