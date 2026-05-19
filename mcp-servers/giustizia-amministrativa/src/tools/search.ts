import * as cheerio from 'cheerio';
import { fetchWithRetry, parseApiError } from '@bettercallclaude-italia/shared';
import type { SearchSentenzeInput } from '../types.js';

export async function searchGiustiziaAmministrativa(input: SearchSentenzeInput): Promise<{
  sentenze: Array<{
    id?: string;
    estremi?: string;
    oggetto?: string;
    url?: string;
  }>;
  totali: number;
  urlRicerca: string;
}> {
  const params = new URLSearchParams();
  params.set('tipoRicerca', 'Provvedimenti');
  if (input.parolaChiave) params.set('testo', input.parolaChiave);
  if (input.organo) params.set('organo', input.organo);

  const url = `https://www.giustizia-amministrativa.it/cdsintra/cdsintra/AmministrazionePortale/Ricerca/index.html?${params.toString()}`;

  try {
    const html = await fetchWithRetry(
      'giustiziaamministrativa',
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
    const sentenze: Array<Record<string, string | undefined>> = [];

    $('.risultato, .provvedimento, table tr').each((_i, el) => {
      const text = $(el).text().trim();
      const link = $(el).find('a').attr('href');
      if (text && text.length > 20) {
        sentenze.push({
          estremi: text.substring(0, 150),
          oggetto: text.substring(0, 300),
          url: link ? (link.startsWith('http') ? link : `https://www.giustizia-amministrativa.it${link}`) : undefined,
        });
      }
    });

    return {
      sentenze: sentenze.slice(0, input.pageSize ?? 20),
      totali: sentenze.length,
      urlRicerca: url,
    };
  } catch (error) {
    const parsed = parseApiError(error);
    return {
      sentenze: [],
      totali: 0,
      urlRicerca: url,
      note: `${parsed.code}: ${parsed.message}. Usare l'URL di ricerca fornito.`,
    } as unknown as { sentenze: Array<{ id?: string; estremi?: string; oggetto?: string; url?: string }>; totali: number; urlRicerca: string };
  }
}
