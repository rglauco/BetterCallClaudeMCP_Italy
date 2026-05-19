import { z } from 'zod';

export const SearchEurLexInputSchema = z.object({
  query: z.string().optional().describe('Parole chiave nel titolo'),
  tipoAtto: z.enum(['REG', 'DIR', 'DIR_IMPL', 'DEC', 'REC', 'ANY']).optional().describe('Tipo atto UE'),
  numero: z.string().optional(),
  anno: z.number().int().optional(),
  celex: z.string().optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(50).optional(),
});

export type SearchEurLexInput = z.infer<typeof SearchEurLexInputSchema>;

export const GetAttoCelexInputSchema = z.object({
  celex: z.string().min(1).describe('Codice CELEX (es. 32016R0679)'),
});

export type GetAttoCelexInput = z.infer<typeof GetAttoCelexInputSchema>;
