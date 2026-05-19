import { describe, it, expect } from 'vitest';
import { SearchSentenzeInputSchema, GetSentenzaInputSchema } from '../types.js';

describe('Giustizia Amministrativa types', () => {
  it('validates search input', () => {
    const result = SearchSentenzeInputSchema.safeParse({ organo: 'TAR' });
    expect(result.success).toBe(true);
  });

  it('validates get sentenza input', () => {
    const result = GetSentenzaInputSchema.safeParse({ id: '12345' });
    expect(result.success).toBe(true);
  });
});
