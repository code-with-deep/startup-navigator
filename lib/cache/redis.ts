import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// ─── Redis client (lazy — safe during build) ─────────────────────────────────

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token || url.startsWith('REPLACE_')) {
      throw new Error(
        'Upstash Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.'
      );
    }

    _redis = new Redis({ url, token });
  }
  return _redis;
}

// Convenience wrapper that re-exports common Redis methods without exposing client
export const redis = {
  get: <T>(key: string) => getRedis().get<T>(key),
  set: (key: string, value: unknown, options?: { ex: number }) =>
    options?.ex
      ? getRedis().set(key, value, { ex: options.ex })
      : getRedis().set(key, value),
  del: (key: string) => getRedis().del(key),
};

// ─── Rate limiters ───────────────────────────────────────────────────────────

/**
 * AI search: 10 requests per minute per IP.
 * Falls back to a no-op if Redis is not configured (dev without Upstash).
 */
export function getSearchRatelimit() {
  try {
    return new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: 'sn:search:rl',
    });
  } catch {
    return null;
  }
}

// Cache TTLs (seconds)
export const CACHE_TTL = {
  ragResponse: 60 * 60 * 6,  // 6 hours
  topicList: 60 * 60,         // 1 hour
} as const;
