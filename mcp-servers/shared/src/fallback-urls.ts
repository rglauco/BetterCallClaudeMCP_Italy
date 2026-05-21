/**
 * Build search engine fallback URLs for a given domain and query terms.
 * Used by scraper-based MCP servers when direct scraping fails.
 */
export function buildSearchEngineUrls(
  domain: string,
  queryTerms: string[]
): {
  google: string;
  duckduckgo: string;
} {
  const q = queryTerms
    .filter((t): t is string => typeof t === 'string' && t.length > 0)
    .join(' ');
  const encodedQ = encodeURIComponent(q);
  const encodedDomain = encodeURIComponent(domain);
  return {
    google: `https://www.google.com/search?q=site:${encodedDomain}+${encodedQ}`,
    duckduckgo: `https://duckduckgo.com/?q=site:${encodedDomain}+${encodedQ}`,
  };
}

/**
 * Build an ECLI URL for the Italian Constitutional Court.
 * ECLI format: ECLI:IT:COST:{anno}:{numero}
 */
export function buildEcliUrlCorteCostituzionale(
  anno: number,
  numero: string
): string {
  return `https://www.cortecostituzionale.it/actionSchedaPronuncia.do?param_ecli=ECLI:IT:COST:${anno}:${numero}`;
}

/**
 * Build an ECLI URL for the Italian Court of Cassation.
 * Note: the Cassation portal often blocks, but the ECLI URL is worth trying.
 */
export function buildEcliUrlCassazione(
  anno: number,
  numero: string
): string {
  return `https://www.cortedicassazione.it/corte-di-cassazione/it/sentenzeW.html?anno=${anno}&numero=${encodeURIComponent(numero)}`;
}

/**
 * Extract numero and anno from a free-text query string.
 * Recognizes patterns like:
 * - "n. 12345/2024"
 * - "sentenza 12345 del 2024"
 * - "12345/2024"
 * Returns null if no match.
 */
export function extractEstremi(query: string): { numero: string; anno: number } | null {
  // Pattern: optional prefix, then number, optional separator, then 4-digit year
  const match = query.match(/(?:n\.?\s*)?(\d{1,5})\s*(?:[\/-]|\s+del\s+)\s*(\d{4})/i);
  if (match && match[1] && match[2]) {
    return { numero: match[1], anno: parseInt(match[2], 10) };
  }
  // Alternative: year first, then number (e.g., "2024, 12345")
  const match2 = query.match(/(\d{4})\s*(?:[\/-]|\s+)\s*(\d{1,5})/);
  if (match2 && match2[1] && match2[2]) {
    return { numero: match2[2], anno: parseInt(match2[1], 10) };
  }
  return null;
}
