import { describe, it, expect } from 'vitest';
import { SearchSentenzeInputSchema, GetSentenzaInputSchema } from '../types.js';

describe('Corte Costituzionale types', () => {
  it('validates search input', () => {
    const result = SearchSentenzeInputSchema.safeParse({ anno: 2024 });
    expect(result.success).toBe(true);
  });

  it('validates get sentenza input', () => {
    const result = GetSentenzaInputSchema.safeParse({ numero: '100', anno: 2024 });
    expect(result.success).toBe(true);
  });
});
