import type { ValidateCitationInput } from '../types.js';

const KNOWN_PATTERNS = [
  /^(D\.Lgs\.?|Decreto Legislativo)\s*\d+\/\d{4}$/i,
  /^(L\.?|Legge)\s*\d+\/\d{4}$/i,
  /^(D\.L\.?|Decreto Legge)\s*\d+\/\d{4}$/i,
  /^(D\.P\.R\.?|Decreto del Presidente della Repubblica)\s*\d+\/\d{4}$/i,
  /^(Reg\.?|Regolamento)\s*(UE|CE)\s*\d+\/\d{4}$/i,
  /^(art\.?|articolo)\s*\d+.*(D\.Lgs\.?|Legge|D\.L\.?)\s*\d+\/\d{4}$/i,
];

export async function validateCitation(input: ValidateCitationInput): Promise<{
  valid: boolean;
  pattern?: string;
}> {
  for (const pattern of KNOWN_PATTERNS) {
    if (pattern.test(input.citation.trim())) {
      return { valid: true, pattern: pattern.source };
    }
  }
  return { valid: false };
}
