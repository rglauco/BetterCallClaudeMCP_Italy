# AGENTS.md — BetterCallClaude Italia

Quick reference per agenti di coding che lavorano su questo repository.

## Stack

- **Runtime:** Node.js ≥ 20, TypeScript 5.5+
- **Modules:** ES Modules (`"type": "module"`), import con estensione `.js`
- **Monorepo:** npm workspaces (`mcp-servers/*`, `mcp-servers-http`)
- **Build:** `tsc` per server, `npm run build` in root fa build di tutti i workspace
- **Test:** vitest
- **HTTP:** Express 4.x + `@modelcontextprotocol/sdk` StreamableHTTP
- **Protocollo MCP:** `2025-06-18`

## Convenzioni

1. **Import extensions:** `import { foo } from './bar.js'` (anche per file `.ts`)
2. **Naming tool:** `<server>:<azione>` (es. `normattiva:search`, `normattiva:get_atto`)
3. **Risposte MCP:** JSON stringify con envelope `{ success, data, metadata }` o `{ success, error, metadata }`
4. **Metadata:** `requestId`, `timestamp`, `tool`, `processingTime`, `cached`
5. **Lingua:** descrizioni tool ed errori user-facing in **italiano**
6. **Logging:** `console.error` per log operativi, niente `console.log` in produzione
7. **Rate limiting:** sempre usare `bottleneck` da `@bettercallclaude-italia/shared`
8. **HTTP client:** sempre usare `createHttpClient` + `fetchWithRetry` da `shared`

## Comandi utili

```bash
npm install              # installa tutti i workspace
npm run build            # build tutti i workspace
npm run typecheck        # typecheck tutti i workspace
npm test                 # vitest watch mode
npm run test:run         # vitest singola run
npm start                # avvia aggregatore HTTP
```

## Struttura di un server MCP

Ogni server in `mcp-servers/<nome>/src/`:

```
index.ts       # Factory create<Nome>Server(): Server + stdio entry point
types.ts       # Zod schemas + TypeScript types
tools/
  *.ts         # Implementazioni tool
__tests__/
  *.test.ts    # Test vitest
```

L'aggregatore in `mcp-servers-http/src/server-registry.ts` importa la factory di ogni server e lo monta su `POST /<nome>/mcp`.

## Fonti dati

| Server | Fonte | Tipo accesso |
|---|---|---|
| normattiva | dati.normattiva.it | Open Data API |
| corte-costituzionale | cortecostituzionale.it | Open (web/API) |
| giustizia-amministrativa | giustizia-amministrativa.it | Open (web/API) |
| cassazione | italgiure.giustizia.it | Porzione pubblica |
| eur-lex-ita | eur-lex.europa.eu | Open + API + SPARQL |
| legal-citations-ita | Logica interna | — |
| legal-persona-ita | Logica interna | — |

## Branching

- `main` → produzione, auto-deploy Railway
- `dev` → integrazione, PR target
- `feat/<nome>` → feature branches
