import { describe, it, expect } from 'vitest';
import { SearchInputSchema, GetAttoInputSchema, ElencoTipiInputSchema } from '../types.js';

describe('Normattiva types', () => {
  it('validates search input', () => {
    const result = SearchInputSchema.safeParse({ query: 'privacy' });
    expect(result.success).toBe(true);
  });

  it('rejects empty query', () => {
    const result = SearchInputSchema.safeParse({ query: '' });
    expect(result.success).toBe(false);
  });

  it('validates get atto input', () => {
    const result = GetAttoInputSchema.safeParse({ codiceRedazionale: '24G00010', dataGU: '2024-01-17' });
    expect(result.success).toBe(true);
  });

  it('validates elenco tipi', () => {
    const result = ElencoTipiInputSchema.safeParse({ tipo: 'classe' });
    expect(result.success).toBe(true);
  });
});
