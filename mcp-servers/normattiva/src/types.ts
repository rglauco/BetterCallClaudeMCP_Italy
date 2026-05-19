import { z } from 'zod';

export const SearchInputSchema = z.object({
  query: z.string().min(1).describe('Parole chiave da cercare nel titolo e/o testo'),
  orderType: z.enum(['recente', 'vecchio']).optional().describe('Ordine risultati'),
  page: z.number().int().min(1).optional().describe('Numero pagina (default 1)'),
  pageSize: z.number().int().min(1).max(50).optional().describe('Risultati per pagina (default 20, max 50)'),
  annoProvvedimento: z.number().int().optional().describe('Anno del provvedimento'),
  codiceTipoProvvedimento: z.string().optional().describe('Codice tipo provvedimento (da elenco_tipi)'),
});

export type SearchInput = z.infer<typeof SearchInputSchema>;

export const SearchAdvancedInputSchema = z.object({
  testoRicerca: z.string().optional().describe('Parole nel testo'),
  titoloRicerca: z.string().optional().describe('Parole nel titolo'),
  dataInizioEmanazione: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Data emanazione da (YYYY-MM-DD)'),
  dataFineEmanazione: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Data emanazione a (YYYY-MM-DD)'),
  dataInizioPubblicazione: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Data pubblicazione da (YYYY-MM-DD)'),
  dataFinePubblicazione: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Data pubblicazione a (YYYY-MM-DD)'),
  vigenza: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Data di vigenza (YYYY-MM-DD)'),
  classeProvvedimento: z.string().optional().describe('ID classe provvedimento (1=senza aggiornamenti, 2=aggiornato, 3=abrogato)'),
  denominazioneAtto: z.string().optional().describe('Denominazione atto (es. DECRETO LEGISLATIVO)'),
  annoProvvedimento: z.number().int().optional(),
  numeroProvvedimento: z.string().optional(),
  orderType: z.enum(['recente', 'vecchio']).optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(50).optional(),
});

export type SearchAdvancedInput = z.infer<typeof SearchAdvancedInputSchema>;

export const GetAttoInputSchema = z.object({
  codiceRedazionale: z.string().min(1).describe('Codice redazionale dell\'atto (es. 24G00010)'),
  dataGU: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Data pubblicazione GU (YYYY-MM-DD)'),
});

export type GetAttoInput = z.infer<typeof GetAttoInputSchema>;

export const ElencoTipiInputSchema = z.object({
  tipo: z.enum(['classe', 'denominazione', 'estensioni']).describe('Tipologia da elencare'),
});

export type ElencoTipiInput = z.infer<typeof ElencoTipiInputSchema>;

// Response types
export interface NormattivaAtto {
  codiceRedazionale: string;
  dataGU: string;
  numeroGU: string;
  titoloAtto: string;
  denominazioneAtto: string;
  numeroAtto: string;
  annoProvvedimento: number;
  dataEmanazione?: string;
  descrizioneAtto?: string;
  urlNormattiva?: string;
}

export interface SearchResult {
  atti: NormattivaAtto[];
  totali: number;
  pagina: number;
  pageSize: number;
}
