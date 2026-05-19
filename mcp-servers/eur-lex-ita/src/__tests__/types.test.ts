import { describe, it, expect } from 'vitest';
import { SearchEurLexInputSchema, GetAttoCelexInputSchema } from '../types.js';

describe('EUR-Lex types', () => {
  it('validates search input', () => {
    const result = SearchEurLexInputSchema.safeParse({ query: 'privacy' });
    expect(result.success).toBe(true);
  });

  it('validates get atto input', () => {
    const result = GetAttoCelexInputSchema.safeParse({ celex: '32016R0679' });
    expect(result.success).toBe(true);
  });
});
