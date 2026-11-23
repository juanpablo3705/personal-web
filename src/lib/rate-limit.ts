import { headers } from "next/headers";

type RateLimitBucket = {
  timestamps: number[];
};

const buckets = new Map<string, RateLimitBucket>();
const MAX_BUCKETS = 2000;

function cleanupBuckets(now: number, windowMs: number) {
  if (buckets.size < MAX_BUCKETS) {
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

  // tope duro fifo si las 2000 entradas siguen activas en la ventana
  while (buckets.size >= MAX_BUCKETS) {
    const oldestKey = buckets.keys().next().value;
    if (!oldestKey) {
      break;
    }
    buckets.delete(oldestKey);
  }
}

function resolveClientIp(headerStore: Headers): string {
  const vercelForwarded = headerStore
    .get("x-vercel-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  if (vercelForwarded) {
    return vercelForwarded;
  }

  const realIp = headerStore.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  const forwardedFor = headerStore
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  return forwardedFor || "unknown-ip";
}

export async function checkRateLimit(options: {
  namespace: string;
  maxRequests: number;
  windowMs: number;
}): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const headerStore = await headers();
  const clientIp = resolveClientIp(headerStore);
  const now = Date.now();

  cleanupBuckets(now, options.windowMs);

  const key = `${options.namespace}:${clientIp}`;
  const existing = buckets.get(key) ?? { timestamps: [] };
  const recentTimestamps = existing.timestamps.filter(
    (timestamp) => now - timestamp < options.windowMs
  );

  if (recentTimestamps.length >= options.maxRequests) {
    const oldestInWindow = recentTimestamps[0] ?? now;
    const retryAfterMs = Math.max(
      1000,
      options.windowMs - (now - oldestInWindow)
    );
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
