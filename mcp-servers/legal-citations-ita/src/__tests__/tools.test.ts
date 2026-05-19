import { describe, it, expect } from 'vitest';
import { validateCitation } from '../tools/validate-citation.js';
import { parseCitation } from '../tools/parse-citation.js';
import { formatCitation } from '../tools/format-citation.js';

describe('Legal Citations tools', () => {
  it('validates D.Lgs. citation', async () => {
    const result = await validateCitation({ citation: 'D.Lgs. 231/2001' });
    expect(result.valid).toBe(true);
  });

  it('rejects invalid citation', async () => {
    const result = await validateCitation({ citation: 'foo bar' });
    expect(result.valid).toBe(false);
  });

  it('parses D.Lgs. citation', async () => {
    const result = await parseCitation({ citation: 'D.Lgs. 231/2001' });
    expect(result.tipo).toBe('Decreto Legislativo');
    expect(result.numero).toBe('231');
    expect(result.anno).toBe(2001);
  });

  it('formats citation', async () => {
    const result = await formatCitation({ tipo: 'decreto legislativo', numero: '231', anno: 2001 });
    expect(result.breve).toBe('D.Lgs. 231/2001');
  });
});
