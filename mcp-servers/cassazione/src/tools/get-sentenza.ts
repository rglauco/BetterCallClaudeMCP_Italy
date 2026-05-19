import { fetchWithRetry, parseApiError } from '@bettercallclaude-italia/shared';
import type { GetSentenzaInput } from '../types.js';

export async function getSentenzaCassazione(input: GetSentenzaInput): Promise<{
  id: string;
  url?: string;
  testo?: string;
  note: string;
}> {
  const url = `https://www.cortedicassazione.it/corte-di-cassazione/it/sentenzeW.html?id=${encodeURIComponent(input.id)}`;

  try {
    const html = await fetchWithRetry(
      'cassazione',
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
      id: input.id,
      url,
      testo: html.substring(0, 5000),
      note: 'Porzione pubblica. Per massime complete consultare ItalGiure.',
    };
  } catch (error) {
    const parsed = parseApiError(error);
    return {
      id: input.id,
      url,
      testo: `Errore: ${parsed.message}.`,
      note: 'Accesso completo riservato agli operatori giuridici su ItalGiure.',
    };
  }
}
