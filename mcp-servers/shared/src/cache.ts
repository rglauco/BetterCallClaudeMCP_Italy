import { LRUCache } from 'lru-cache';

export interface CacheConfig {
  maxSize: number;
  ttlMs: number;
}

/**
 * Generic LRU cache wrapper for legal data.
 */
export class LegalCache<T extends {} = Record<string, unknown>> {
  private cache: LRUCache<string, T>;

  constructor(config: CacheConfig) {
    this.cache = new LRUCache<string, T>({
      max: config.maxSize,
      ttl: config.ttlMs,
      updateAgeOnGet: true,
    });
  }

  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: T): void {
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  static generateKey(prefix: string, params: Record<string, unknown>): string {
    const sorted = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join('&');
    return `${prefix}:${sorted}`;
  }
}

// Pre-configured cache instances
export const searchCache = new LegalCache<Record<string, unknown>>({ maxSize: 500, ttlMs: 5 * 60 * 1000 });
export const citationCache = new LegalCache<Record<string, unknown>>({ maxSize: 1000, ttlMs: 15 * 60 * 1000 });
export const statuteCache = new LegalCache<Record<string, unknown>>({ maxSize: 200, ttlMs: 60 * 60 * 1000 });
