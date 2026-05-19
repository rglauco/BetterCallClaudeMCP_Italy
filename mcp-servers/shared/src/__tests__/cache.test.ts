import { describe, it, expect } from 'vitest';
import { LegalCache } from '../cache.js';

describe('LegalCache', () => {
  it('should store and retrieve values', () => {
    const cache = new LegalCache<string>({ maxSize: 10, ttlMs: 60000 });
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should generate consistent keys', () => {
    const key1 = LegalCache.generateKey('prefix', { a: 1, b: 2 });
    const key2 = LegalCache.generateKey('prefix', { b: 2, a: 1 });
    expect(key1).toBe(key2);
  });
});
