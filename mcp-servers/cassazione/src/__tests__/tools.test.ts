import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchMassime } from '../tools/search-massime.js';
import { getSentenzaCassazione } from '../tools/get-sentenza.js';

describe('cassazione tools fallback', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.ITALGIURE_COOKIE;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('searchMassime', () => {
    it('returns fallback when cookie is missing', async () => {
      const result = await searchMassime({ query: 'responsabilita medica' });

      expect(result.autenticazione.cookieValido).toBe(false);
      expect(result.massime).toHaveLength(0);
      expect(result.totale).toBe(0);
      expect(result.fallback).toBeDefined();
      expect(result.fallback!.urlGoogle).toContain('google.com');
      expect(result.fallback!.urlDuckDuckGo).toContain('duckduckgo.com');
      expect(result.fallback!.istruzioni).toContain('ITALGIURE_COOKIE');
    });

    it('accepts optional filters without cookie', async () => {
      const result = await searchMassime({
        query: 'danno',
        materia: 'civile',
        anno: 2024,
        tipo: 'sentenza',
        page: 2,
        pageSize: 10,
      });

      expect(result.autenticazione.cookieValido).toBe(false);
      expect(result.fallback).toBeDefined();
    });
  });

  describe('getSentenzaCassazione', () => {
    it('returns fallback when cookie is missing', async () => {
      const result = await getSentenzaCassazione({ id: 'snciv2024332127S' });

      expect(result.autenticazione.cookieValido).toBe(false);
      expect(result.id).toBe('snciv2024332127S');
      expect(result.fallback).toBeDefined();
      expect(result.fallback!.istruzioni).toContain('ITALGIURE_COOKIE');
    });
  });
});
