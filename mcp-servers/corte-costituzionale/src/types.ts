import { z } from 'zod';

export const SearchSentenzeInputSchema = z.object({
  numero: z.string().optional().describe('Numero sentenza'),
  anno: z.number().int().optional().describe('Anno sentenza'),
  materia: z.string().optional().describe('Materia o norma contestata'),
  parolaChiave: z.string().optional().describe('Parola chiave full-text'),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(50).optional(),
});

export type SearchSentenzeInput = z.infer<typeof SearchSentenzeInputSchema>;

export const GetSentenzaInputSchema = z.object({
  numero: z.string().describe('Numero sentenza'),
  anno: z.number().int().describe('Anno sentenza'),
});

export type GetSentenzaInput = z.infer<typeof GetSentenzaInputSchema>;

export const NormeIncostituzionaliInputSchema = z.object({
  anno: z.number().int().optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(50).optional(),
});

export type NormeIncostituzionaliInput = z.infer<typeof NormeIncostituzionaliInputSchema>;
