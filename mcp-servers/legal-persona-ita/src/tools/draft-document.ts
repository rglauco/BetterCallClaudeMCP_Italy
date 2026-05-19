import type { DraftDocumentInput } from '../types.js';

const TEMPLATES: Record<string, (d: DraftDocumentInput) => string> = {
  contratto: (d) => {
    const [p1, p2] = d.parti ?? ['Parte A', 'Parte B'];
    return `CONTRATTO

Tra
${p1}
e
${p2}

Oggetto: ${d.oggetto}

${(d.puntiChiave ?? []).map((p) => `- ${p}`).join('\n')}

${Object.entries(d.datiAggiuntivi ?? {})
  .map(([k, v]) => `${k}: ${v}`)
  .join('\n')}

Fatto in duplice copia.`;
  },
  ricorso: (d) => {
    return `RICORSO

Il/La sottoscritto/a ${d.parti?.[0] ?? '[RICORRENTE]'}

VISTO ${d.oggetto}

ESPOSTO CHE:
${(d.puntiChiave ?? []).map((p, i) => `${i + 1}. ${p}`).join('\n\n')}

In virtù di quanto sopra,
RICORRE

Il/La sottoscritto/a`;
  },
  parere: (d) => {
    return `PARERE

Oggetto: ${d.oggetto}

PREMESSO CHE:
${(d.puntiChiave ?? []).map((p, i) => `${i + 1}. ${p}`).join('\n\n')}

PARERE:
Sulla base delle norme e della giurisprudenza vigente, si ritiene che...`;
  },
  lettera_formale: (d) => {
    return `LETTERA FORMALE

Spett.le ${d.parti?.[0] ?? '[DESTINATARIO]'}

Oggetto: ${d.oggetto}

${(d.puntiChiave ?? []).map((p) => `${p}`).join('\n\n')}

Cordiali saluti.`;
  },
  memoria_difensiva: (d) => {
    return `MEMORIA DIFENSIVA

Nel procedimento concernente ${d.oggetto}

Il/La sottoscritto/a ${d.parti?.[0] ?? '[DIFENSORE]'}

ESPOSTO CHE:
${(d.puntiChiave ?? []).map((p, i) => `${i + 1}. ${p}`).join('\n\n')}

CHIEDE:
si rigettino le domande avversarie.`;
  },
  atto_di_citazione: (d) => {
    return `ATTO DI CITAZIONE

Il/La sottoscritto/a ${d.parti?.[0] ?? '[ATTORE]'}

convenendo in giudizio
${d.parti?.[1] ?? '[CONVENUTO]'}

per la seguente
CAUSA: ${d.oggetto}

${(d.puntiChiave ?? []).map((p, i) => `${i + 1}. ${p}`).join('\n\n')}

CHIEDE:
si condanni il convenuto...`;
  },
};

export async function draftDocument(input: DraftDocumentInput): Promise<{
  tipo: string;
  oggetto: string;
  bozza: string;
}> {
  const template = TEMPLATES[input.tipo];
  if (!template) {
    throw new Error(`Tipo documento non supportato: ${input.tipo}`);
  }
  return {
    tipo: input.tipo,
    oggetto: input.oggetto,
    bozza: template(input),
  };
}
