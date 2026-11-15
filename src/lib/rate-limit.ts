import { headers } from "next/headers";

type RateLimitBucket = {
  timestamps: number[];
};

const buckets = new Map<string, RateLimitBucket>();
const MAX_BUCKETS = 2000;

function cleanupExpiredBuckets(now: number, windowMs: number) {
  if (buckets.size <= MAX_BUCKETS) {
    return;
  }
  for (const [key, bucket] of buckets.entries()) {
    const active = bucket.timestamps.filter((t) => now - t < windowMs);
    if (active.length === 0) {
      buckets.delete(key);
    } else {
      bucket.timestamps = active;
    }
  }
}

export async function checkRateLimit(options: {
  namespace: string;
  maxRequests: number;
  windowMs: number;
}): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");
  const clientIp =
    forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || "unknown-ip";

  const now = Date.now();
  cleanupExpiredBuckets(now, options.windowMs);

  const key = `${options.namespace}:${clientIp}`;
  const existing = buckets.get(key) ?? { timestamps: [] };
  const recentTimestamps = existing.timestamps.filter(
    (timestamp) => now - timestamp < options.windowMs
  );

  if (recentTimestamps.length >= options.maxRequests) {
    const oldestInWindow = recentTimestamps[0] ?? now;
    const retryAfterMs = Math.max(1000, options.windowMs - (now - oldestInWindow));
    buckets.set(key, { timestamps: recentTimestamps });
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  recentTimestamps.push(now);
  buckets.set(key, { timestamps: recentTimestamps });

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}
