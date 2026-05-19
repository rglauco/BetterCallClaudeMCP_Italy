import { z } from 'zod';

export const SearchMassimeInputSchema = z.object({
  query: z.string().min(1).describe('Parole chiave'),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(50).optional(),
});

export type SearchMassimeInput = z.infer<typeof SearchMassimeInputSchema>;

export const GetSentenzaInputSchema = z.object({
  id: z.string().describe('Identificativo sentenza'),
});

export type GetSentenzaInput = z.infer<typeof GetSentenzaInputSchema>;
