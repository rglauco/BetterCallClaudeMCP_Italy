import type { ParseCitationInput } from '../types.js';

export async function parseCitation(input: ParseCitationInput): Promise<{
  tipo?: string;
  numero?: string;
  anno?: number;
  articolo?: string;
  comma?: string;
}> {
  const text = input.citation.trim();

  // Articolo + atto
  const artMatch = text.match(/art\.?\s*(\d+)(?:\s*,\s*comma\s*(\d+))?\s*,?\s*(.+)/i);
  if (artMatch && artMatch[3]) {
    const attoPart = artMatch[3];
    const attoParsed = parseAtto(attoPart);
    return { ...attoParsed, articolo: artMatch[1], comma: artMatch[2] };
  }

  return parseAtto(text);
}

function parseAtto(text: string): { tipo?: string; numero?: string; anno?: number } {
  const match = text.match(/(D\.Lgs\.|Legge|D\.L\.|D\.P\.R\.|Regolamento UE)\s*(\d+)\/(\d{4})/i);
  if (!match) return {};

  const tipoMap: Record<string, string> = {
    'd.lgs.': 'Decreto Legislativo',
    legge: 'Legge',
    'd.l.': 'Decreto Legge',
    'd.p.r.': 'Decreto del Presidente della Repubblica',
    'regolamento ue': 'Regolamento UE',
  };

  const tipoKey = match[1]?.toLowerCase() ?? '';
  return {
    tipo: tipoMap[tipoKey] || match[1] || '',
    numero: match[2] || '',
    anno: match[3] ? parseInt(match[3], 10) : undefined,
  };
}
