/**
 * Simple in-memory TTL cache for slow-changing data.
 * Keyed by string, with configurable TTL per entry.
 * Non-blocking: stale reads return cached data while refresh happens in background.
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const store = new Map<string, CacheEntry<unknown>>();

/**
 * Get cached data or compute it. If the cache is expired, the factory function
 * is called and the result is stored. Subsequent calls within the TTL window
 * return the cached value instantly.
 *
 * @param key - Unique cache key (e.g., "batters:IPL")
 * @param ttlMs - Time-to-live in milliseconds
 * @param fn - Async factory function to compute the value on cache miss
 */
export async function getCached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const cached = store.get(key) as CacheEntry<T> | undefined;
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  const data = await fn();
  store.set(key, { data, expiry: Date.now() + ttlMs });
  return data;
}

/**
 * Invalidate a specific cache key.
 */
export function invalidateCache(key: string): void {
  store.delete(key);
}

/**
 * Invalidate all cache keys matching a prefix.
 * Useful for invalidating all keys for a league, e.g. invalidateCacheByPrefix("IPL:")
 */
export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

/**
 * Clear the entire cache.
 */
export function clearCache(): void {
  store.clear();
}

// Common TTL constants
export const CACHE_TTL = {
  /** 5 minutes — for data that changes with new match ingestion */
  SHORT: 5 * 60 * 1000,
  /** 1 hour — for near-static data like season lists */
  LONG: 60 * 60 * 1000,
} as const;
