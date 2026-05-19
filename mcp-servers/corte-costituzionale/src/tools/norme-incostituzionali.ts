import * as cheerio from 'cheerio';
import { fetchWithRetry, parseApiError } from '@bettercallclaude-italia/shared';
import type { NormeIncostituzionaliInput } from '../types.js';

export async function normeIncostituzionali(input: NormeIncostituzionaliInput): Promise<{
  norme: Array<{ testo: string; sentenza: string; url?: string }>;
  totali: number;
}> {
  const url = 'https://www.cortecostituzionale.it/actionPronuncia.do';

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
    const norme: Array<{ testo: string; sentenza: string; url?: string }> = [];

    // Heuristic extraction
    $('table tr, .risultati li').each((_i, el) => {
      const text = $(el).text().trim();
      const link = $(el).find('a').attr('href');
      if (text.includes('incostituzionale') || text.includes('dichiarazione')) {
        norme.push({
          testo: text.substring(0, 300),
          sentenza: 'da verificare sul portale',
          url: link ? (link.startsWith('http') ? link : `https://www.cortecostituzionale.it${link}`) : undefined,
        });
      }
    });

    return { norme, totali: norme.length };
  } catch (error) {
    const parsed = parseApiError(error);
    throw new Error(`[corte-costituzionale:norme_incostituzionali] ${parsed.code}: ${parsed.message}`);
  }
}
