# Changelog

Tutte le modifiche significative a questo progetto saranno documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.0.0/),
e questo progetto aderisce a [Semantic Versioning](https://semver.org/lang/it/).

## [1.0.0] - 2026-05-19

### Aggiunto

- **7 MCP servers** per la ricerca giuridica italiana:
  - `normattiva` — ricerca atti legislativi via API Open Data ufficiale
  - `eur-lex-ita` — ricerca atti UE via SPARQL CELLAR con filtri avanzati
  - `corte-costituzionale` — ricerca sentenze Corte Costituzionale (con fallback URL)
  - `giustizia-amministrativa` — ricerca provvedimenti giustizia amministrativa
  - `cassazione` — ricerca massime e sentenze Cassazione (con fallback ItalGiure)
  - `legal-citations-ita` — validazione, parsing e formattazione citazioni giuridiche
  - `legal-persona-ita` — redazione documenti legali con template

- **HTTP Aggregator** — server Express unico che espone tutti i 7 endpoint MCP via `StreamableHTTPServerTransport` (protocollo MCP 2025-06-18)

- **Shared utilities** — cache LRU, rate limiter (bottleneck), HTTP client con retry (p-retry), parser errori standardizzato

- **Docker** — multi-stage build (`node:20-alpine`) con healthcheck

- **Railway deployment** — configurato via `railway.toml`, endpoint: `https://mcp-italia.bettercallclaude.ch`

- **CI/CD GitHub Actions** — test su Node 20.x/22.x, lint TypeScript, build Docker con healthcheck verification

- **Documentazione**:
  - `docs/01-ARCHITECTURE.md` — architettura e moduli
  - `docs/02-TOOL-SPECIFICATIONS.md` — specifiche tool per server
  - `docs/03-API-INTEGRATION-GUIDE.md` — guida integrazione API esterne
  - `docs/04-DEPLOYMENT-GUIDE.md` — guida deploy Railway/Docker

### Tecnologie

- Node.js ≥20, TypeScript 5.5+, ESM modules
- npm 10+ workspaces (9 package)
- Vitest 4.1.6 per i test (29 test su 11 file)
- MCP SDK 1.12.0
- AGPL-3.0-or-later license

[1.0.0]: https://github.com/fedec65/BetterCallClaudeMCP_Italy/releases/tag/v1.0.0
