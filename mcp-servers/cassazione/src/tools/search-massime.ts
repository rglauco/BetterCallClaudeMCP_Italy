import * as cheerio from 'cheerio';
import { fetchWithRetry, parseApiError } from '@bettercallclaude-italia/shared';
import type { SearchMassimeInput } from '../types.js';

export async function searchMassime(input: SearchMassimeInput): Promise<{
  massime: Array<{
    estremi?: string;
    massima?: string;
    url?: string;
  }>;
  totali: number;
  urlRicerca: string;
  note: string;
}> {
  const params = new URLSearchParams();
  params.set('q', input.query);

  // Try the public search on cortedicassazione.it
  const url = `https://www.cortedicassazione.it/corte-di-cassazione/it/sentenzeW.html?${params.toString()}`;

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

    const $ = cheerio.load(html);
    const massime: Array<Record<string, string | undefined>> = [];

    $('table tr, .sentenza, .risultato').each((_i, el) => {
      const text = $(el).text().trim();
      const link = $(el).find('a').attr('href');
      if (text && text.length > 20) {
        massime.push({
          estremi: text.substring(0, 150),
          massima: text.substring(0, 400),
          url: link ? (link.startsWith('http') ? link : `https://www.cortedicassazione.it${link}`) : undefined,
        });
      }
    });

    return {
      massime: massime.slice(0, input.pageSize ?? 20),
      totali: massime.length,
      urlRicerca: url,
      note: 'Accesso alla porzione pubblica delle sentenze della Cassazione (ultimi 5 anni).',
    };
  } catch (error) {
    const parsed = parseApiError(error);
    return {
      massime: [],
      totali: 0,
      urlRicerca: url,
      note: `${parsed.code}: ${parsed.message}. Accesso completo riservato agli operatori giuridici su ItalGiure.`,
    };
  }
}
