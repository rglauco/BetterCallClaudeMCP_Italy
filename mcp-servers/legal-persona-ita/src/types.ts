import { z } from 'zod';

export const DraftDocumentInputSchema = z.object({
  tipo: z.enum([
    'contratto',
    'ricorso',
    'parere',
    'lettera_formale',
    'memoria_difensiva',
    'atto_di_citazione',
  ]).describe('Tipo di documento da redigere'),
  parti: z.array(z.string()).optional().describe('Nomi delle parti coinvolte'),
  oggetto: z.string().min(1).describe('Oggetto del documento'),
  puntiChiave: z.array(z.string()).optional().describe('Punti chiave da trattare'),
  datiAggiuntivi: z.record(z.string()).optional().describe('Dati aggiuntivi (es. importo, termini)'),
});

export type DraftDocumentInput = z.infer<typeof DraftDocumentInputSchema>;
