import { fetchWithRetry, parseApiError } from '@bettercallclaude-italia/shared';
import type { SearchEurLexInput } from '../types.js';

const SPARQL_ENDPOINT = 'https://publications.europa.eu/webapi/rdf/sparql';

const TYPE_MAP: Record<string, string> = {
  REG: 'http://publications.europa.eu/resource/authority/resource-type/REG',
  DIR: 'http://publications.europa.eu/resource/authority/resource-type/DIR',
  DIR_IMPL: 'http://publications.europa.eu/resource/authority/resource-type/DIR_IMPL',
  DEC: 'http://publications.europa.eu/resource/authority/resource-type/DEC',
  REC: 'http://publications.europa.eu/resource/authority/resource-type/REC',
};

function buildSparqlQuery(input: SearchEurLexInput): string {
  const limit = input.pageSize ?? 20;
  const offset = ((input.page ?? 1) - 1) * limit;

  const filters: string[] = [];

  if (input.tipoAtto && input.tipoAtto !== 'ANY') {
    filters.push(`?work cdm:work_has_resource-type <${TYPE_MAP[input.tipoAtto]}> .`);
  } else {
    filters.push(`?work cdm:work_has_resource-type ?rtype .`);
    filters.push(`FILTER (?rtype IN (<http://publications.europa.eu/resource/authority/resource-type/REG>, <http://publications.europa.eu/resource/authority/resource-type/DIR>, <http://publications.europa.eu/resource/authority/resource-type/DIR_IMPL>, <http://publications.europa.eu/resource/authority/resource-type/DEC>, <http://publications.europa.eu/resource/authority/resource-type/REC>))`);
  }

  if (input.celex) {
    filters.push(`?work cdm:resource_legal_id_celex "${input.celex}"^^xsd:string .`);
  } else {
    filters.push(`?work cdm:resource_legal_id_celex ?celex .`);
  }

  filters.push(`?work cdm:work_date_document ?date .`);

  if (input.anno) {
    filters.push(`FILTER (YEAR(?date) = ${input.anno})`);
  }

  const keywordFilter = input.query
    ? `FILTER (CONTAINS(LCASE(STR(COALESCE(?titleIt, ?titleEn, ""))), "${input.query.toLowerCase()}"))`
    : '';

  return `PREFIX cdm: <http://publications.europa.eu/ontology/cdm#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
SELECT DISTINCT ?celex ?title ?date ?rtypeLabel
WHERE {
  ${filters.join('\n  ')}
  OPTIONAL {
    ?work cdm:work_has_expression ?exprIt .
    ?exprIt cdm:expression_uses_language <http://publications.europa.eu/resource/authority/language/ITA> .
    ?exprIt cdm:expression_title ?titleIt .
  }
  OPTIONAL {
    ?work cdm:work_has_expression ?exprEn .
    ?exprEn cdm:expression_uses_language <http://publications.europa.eu/resource/authority/language/ENG> .
    ?exprEn cdm:expression_title ?titleEn .
  }
  BIND(COALESCE(?titleIt, ?titleEn) AS ?title)
  OPTIONAL {
    ?work cdm:work_has_resource-type ?rtype .
    ?rtype <http://www.w3.org/2004/02/skos/core#prefLabel> ?rtypeLabel .
    FILTER (LANG(?rtypeLabel) = "it" || LANG(?rtypeLabel) = "en")
  }
  ${keywordFilter}
}
ORDER BY DESC(?date)
LIMIT ${limit}
OFFSET ${offset}`;
}

export async function searchEurLex(input: SearchEurLexInput): Promise<{
  atti: Array<{
    celex: string;
    title: string;
    date: string;
    tipo?: string;
    url?: string;
  }>;
  totali: number;
}> {
  const query = buildSparqlQuery(input);

  try {
    const response = (await fetchWithRetry(
      'eurlex',
      () =>
        fetch(SPARQL_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/sparql-results+json',
          },
          body: new URLSearchParams({ query }),
        }).then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
          }
          return res.json() as Promise<{
            results?: { bindings?: Array<Record<string, { value: string }>> };
          }>;
        }),
      { retries: 3 }
    ));

    const bindings = response.results?.bindings ?? [];

    return {
      atti: bindings.map((b) => ({
        celex: b.celex?.value ?? '',
        title: b.title?.value ?? '(titolo non disponibile)',
        date: b.date?.value ?? '',
        tipo: b.rtypeLabel?.value ?? '',
        url: b.celex?.value
          ? `https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:${b.celex.value}`
          : undefined,
      })),
      totali: bindings.length,
    };
  } catch (error) {
    const parsed = parseApiError(error);
    throw new Error(`[eur-lex-ita:search] ${parsed.code}: ${parsed.message}`);
  }
}
