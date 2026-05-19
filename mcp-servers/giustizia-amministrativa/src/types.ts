import { z } from 'zod';

export const SearchSentenzeInputSchema = z.object({
  parolaChiave: z.string().optional(),
  sezione: z.string().optional(),
  organo: z.enum(['TAR', 'CONSIGLIO_DI_STATO']).optional(),
  dataDa: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dataA: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(50).optional(),
});

export type SearchSentenzeInput = z.infer<typeof SearchSentenzeInputSchema>;

export const GetSentenzaInputSchema = z.object({
  id: z.string().describe('Identificativo sentenza'),
});

export type GetSentenzaInput = z.infer<typeof GetSentenzaInputSchema>;
