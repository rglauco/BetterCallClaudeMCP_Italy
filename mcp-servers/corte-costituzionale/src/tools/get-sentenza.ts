import { fetchWithRetry, parseApiError } from '@bettercallclaude-italia/shared';
import type { GetSentenzaInput } from '../types.js';

export async function getSentenza(input: GetSentenzaInput): Promise<{
  numero: string;
  anno: number;
  url?: string;
  testo?: string;
}> {
  const url = `https://www.cortecostituzionale.it/actionSchedaPronuncia.do?param_ecli=ECLI:IT:COST:${input.anno}:${input.numero}`;

  try {
    const html = await fetchWithRetry(
      'cortecostituzionale',
      () =>
        fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (BetterCallClaude-MCP/1.0)',
            Accept: 'text/html',
          },
        }).then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.text();
        }),
      { retries: 2 }
    );

    return {
      numero: input.numero,
      anno: input.anno,
      url,
      testo: html.substring(0, 5000),
    };
  } catch (error) {
    const parsed = parseApiError(error);
    return {
      numero: input.numero,
      anno: input.anno,
      url,
      testo: `Errore: ${parsed.message}. Consultare il link diretto.`,
    };
  }
}
