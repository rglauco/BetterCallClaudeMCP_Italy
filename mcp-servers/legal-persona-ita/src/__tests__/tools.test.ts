import { describe, it, expect } from 'vitest';
import { draftDocument } from '../tools/draft-document.js';

describe('Legal Persona tools', () => {
  it('drafts a contract', async () => {
    const result = await draftDocument({
      tipo: 'contratto',
      oggetto: 'Locazione appartamento',
      parti: ['Mario Rossi', 'Luigi Bianchi'],
      puntiChiave: ['Canone mensile 800€', 'Durata 4+4'],
    });
    expect(result.bozza).toContain('CONTRATTO');
    expect(result.bozza).toContain('Mario Rossi');
    expect(result.bozza).toContain('Luigi Bianchi');
  });

  it('drafts a ricorso', async () => {
    const result = await draftDocument({
      tipo: 'ricorso',
      oggetto: 'Ricorso al TAR',
      puntiChiave: ['Illegittimità del provvedimento'],
    });
    expect(result.bozza).toContain('RICORSO');
  });
});
