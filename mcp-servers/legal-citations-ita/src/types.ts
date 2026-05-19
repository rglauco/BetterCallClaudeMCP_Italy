import { z } from 'zod';

export const ValidateCitationInputSchema = z.object({
  citation: z.string().min(1).describe('Citazione normativa da validare (es. "D.Lgs. 231/2001")'),
});

export type ValidateCitationInput = z.infer<typeof ValidateCitationInputSchema>;

export const ParseCitationInputSchema = z.object({
  citation: z.string().min(1).describe('Citazione da parsare'),
});

export type ParseCitationInput = z.infer<typeof ParseCitationInputSchema>;

export const FormatCitationInputSchema = z.object({
  tipo: z.string().describe('Tipo atto (es. decreto legislativo, legge)'),
  numero: z.string(),
  anno: z.number().int(),
  formato: z.enum(['breve', 'completo']).optional(),
});

export type FormatCitationInput = z.infer<typeof FormatCitationInputSchema>;
