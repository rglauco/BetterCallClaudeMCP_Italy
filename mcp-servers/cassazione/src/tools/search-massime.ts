import * as cheerio from 'cheerio';
import { fetchWithRetry, parseApiError, buildSearchEngineUrls, extractEstremi, buildEcliUrlCassazione } from '@bettercallclaude-italia/shared';
import type { SearchMassimeInput } from '../types.js';

/**
 * Search Cassation Court decisions and maxims.
 * The main portal (cortedicassazione.it) has strict access controls.
 * We attempt public access and provide fallback URLs.
 */
export async function searchMassime(input: SearchMassimeInput): Promise<{
  massime: Array<{
    estremi?: string;
    massima?: string;
    url?: string;
  }>;
  totali: number;
  urlRicerca: string;
  urlItalgiure: string;
  urlEcli?: string;
  urlGoogle: string;
  urlDuckDuckGo: string;
  note: string;
}> {
  // Try the public search page
  const params = new URLSearchParams();
  params.set('q', input.query);
  const urlRicerca = `https://www.cortedicassazione.it/corte-di-cassazione/it/sentenzeW.html?${params.toString()}`;

  // ItalGiure search URL (requires institutional access for full text)
  const urlItalgiure = `https://www.italgiure.giustizia.it/sncass/sncass.php?` +
    new URLSearchParams({ q: input.query, tipo: 'massime' }).toString();

  // Extract numero/anno from query for ECLI fallback
  const estremi = extractEstremi(input.query);
  const urlEcli = estremi ? buildEcliUrlCassazione(estremi.anno, estremi.numero) : undefined;

  // Search engine fallback URLs
  const { google, duckduckgo } = buildSearchEngineUrls('cortedicassazione.it', [
    input.query,
    'sentenza',
  ]);

  try {
    const html = await fetchWithRetry(
      'cassazione',
      () =>
        fetch(urlRicerca, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (BetterCallClaude-MCP/1.0)',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'it-IT,it;q=0.9',
          },
        }).then(async (res) => {
          if (res.status === 403) throw new Error('HTTP 403 - Accesso negato dal portale');
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.text();
        }),
      { retries: 1 }
    );

    // Check for bot protection or access denied
    if (html.includes('403') || html.includes('Forbidden') || html.includes('security') || html.length < 500) {
      return {
        massime: [],
        totali: 0,
        urlRicerca,
        urlItalgiure,
        urlEcli,
        urlGoogle: google,
        urlDuckDuckGo: duckduckgo,
        note: 'Il portale della Corte di Cassazione ha attivato protezione anti-bot. Prova: 1) Google site-search, 2) ECLI diretto (se disponibile), 3) ItalGiure (operatori del diritto).',
      };
    }

    const $ = cheerio.load(html);
    const massime: Array<Record<string, string | undefined>> = [];

    $('table tr, .sentenza, .risultato, .massima, .decisione').each((_i, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      const link = $el.find('a').attr('href');
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
      urlRicerca,
      urlItalgiure,
      urlEcli,
      urlGoogle: google,
      urlDuckDuckGo: duckduckgo,
      note: massime.length > 0
        ? 'Risultati estratti dalla porzione pubblica. Accesso completo riservato agli operatori giuridici su ItalGiure.'
        : 'Nessun risultato estratto. Consultare direttamente il portale, ItalGiure (operatori del diritto), o usare i motori di ricerca forniti.',
    };
  } catch (error) {
    const parsed = parseApiError(error);
    return {
      massime: [],
      totali: 0,
      urlRicerca,
      urlItalgiure,
      urlEcli,
      urlGoogle: google,
      urlDuckDuckGo: duckduckgo,
      note: `${parsed.code}: ${parsed.message}. Il portale blocca sistematicamente. Prova: 1) Google site-search (${google}), 2) ECLI diretto, 3) ItalGiure per operatori del diritto (${urlItalgiure}).`,
    };
  }
}
