import type { FormatCitationInput } from '../types.js';

const ABBREV_MAP: Record<string, string> = {
  'decreto legislativo': 'D.Lgs.',
  legge: 'L.',
  'decreto legge': 'D.L.',
  'decreto del presidente della repubblica': 'D.P.R.',
  'regolamento ue': 'Reg. UE',
};

export async function formatCitation(input: FormatCitationInput): Promise<{
  breve: string;
  completa: string;
}> {
  const abbrev = ABBREV_MAP[input.tipo.toLowerCase()] || input.tipo;
  const breve = `${abbrev} ${input.numero}/${input.anno}`;
  const completa = `${input.tipo} ${input.numero} del ${input.anno}`;

  return {
    breve: input.formato === 'completo' ? completa : breve,
    completa,
  };
}
