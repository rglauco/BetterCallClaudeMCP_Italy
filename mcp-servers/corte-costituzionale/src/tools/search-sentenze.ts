import * as cheerio from 'cheerio';
import { fetchWithRetry, parseApiError } from '@bettercallclaude-italia/shared';
import type { SearchSentenzeInput } from '../types.js';

export async function searchSentenze(input: SearchSentenzeInput): Promise<{
  sentenze: Array<{
    numero?: string;
    anno?: number;
    data?: string;
    oggetto?: string;
    url?: string;
  }>;
  totali: number;
  urlRicerca: string;
}> {
  const params = new URLSearchParams();
  if (input.numero) params.set('numero', input.numero);
  if (input.anno) params.set('anno', String(input.anno));

  const url = `https://www.cortecostituzionale.it/actionPronuncia.do?${params.toString()}`;

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

    const $ = cheerio.load(html);
    const sentenze: Array<Record<string, string | number | undefined>> = [];

    // Heuristic: look for table rows or list items containing sentence data
    $('table tr, .risultati li, .pronuncia').each((_i, el) => {
      const text = $(el).text().trim();
      const link = $(el).find('a').attr('href');
      if (text && (text.includes('Sentenza') || text.includes('Ordinanza'))) {
        const numMatch = text.match(/n\.?\s*(\d+)/i);
        const annoMatch = text.match(/(\d{4})/);
        sentenze.push({
          numero: numMatch?.[1],
          anno: annoMatch?.[1] ? parseInt(annoMatch[1], 10) : undefined,
          oggetto: text.substring(0, 200),
          url: link ? (link.startsWith('http') ? link : `https://www.cortecostituzionale.it${link}`) : undefined,
        });
      }
    });

    return {
      sentenze: sentenze.slice(0, input.pageSize ?? 20),
      totali: sentenze.length,
      urlRicerca: url,
    } as { sentenze: Array<{ numero?: string; anno?: number; data?: string; oggetto?: string; url?: string }>; totali: number; urlRicerca: string };
  } catch (error) {
    const parsed = parseApiError(error);
    // Fallback: return the search URL so the user can still access results
    return {
      sentenze: [],
      totali: 0,
      urlRicerca: url,
      note: `${parsed.code}: ${parsed.message}. Usare l'URL di ricerca fornito.`,
    } as unknown as { sentenze: Array<{ numero?: string; anno?: number; data?: string; oggetto?: string; url?: string }>; totali: number; urlRicerca: string };
  }
}
