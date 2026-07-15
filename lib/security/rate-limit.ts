import "server-only";
import { createHash } from "node:crypto";

export type RateLimitDecision =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

type Bucket = { count: number; resetAt: number };

const ipBuckets = new Map<string, Bucket>();
const emailBuckets = new Map<string, Bucket>();

const WINDOW_MS = 10 * 60 * 1000;
const IP_LIMIT = 5;
const EMAIL_LIMIT = 3;

function hashEmail(email: string): string {
  return createHash("sha256").update(email).digest("hex");
}

function checkBucket(map: Map<string, Bucket>, key: string, limit: number, now: number): RateLimitDecision {
  const existing = map.get(key);
  if (!existing || existing.resetAt <= now) {
    map.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { allowed: true };
}

export function checkLookupRateLimit({
  ip,
  email,
  now = Date.now(),
}: {
  ip: string;
  email: string;
  now?: number;
}): RateLimitDecision {
  const ipDecision = checkBucket(ipBuckets, ip || "unknown", IP_LIMIT, now);
  if (!ipDecision.allowed) return ipDecision;

  return checkBucket(emailBuckets, hashEmail(email), EMAIL_LIMIT, now);
}

export function resetRateLimitForTests(): void {
  ipBuckets.clear();
  emailBuckets.clear();
}
