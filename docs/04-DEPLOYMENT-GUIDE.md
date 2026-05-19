# Guida al Deployment

## Requisiti

- Node.js ≥ 20
- npm ≥ 10
- Docker (per build immagine)
- Account Railway (per deploy produzione)

## Sviluppo locale

```bash
# Installazione dipendenze
cd BetterCallClaudeMCP_Italy
npm install

# Build tutti i workspace
npm run build --workspaces

# Avvio aggregatore HTTP
npm start

# Test
npm run test:run

# Type check
npm run typecheck --workspaces
```

## Docker

```bash
# Build immagine
docker build -f mcp-servers-http/Dockerfile -t bcc-italia .

# Run container
docker run -p 8080:8080 bcc-italia

# Health check
curl http://localhost:8080/health
```

## Railway

### Configurazione

Il file `railway.toml` nella root del progetto configura il deploy:

```toml
[build]
builder = "dockerfile"
dockerfilePath = "mcp-servers-http/Dockerfile"

[deploy]
startCommand = "node mcp-servers-http/dist/index.js"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
healthcheckPath = "/health"
healthcheckTimeout = 100
```

### Setup Railway

1. Collegare il repository GitHub al progetto Railway
2. Impostare auto-deploy dal branch `main`
3. Aggiungere variabili d'ambiente se necessarie:
   - `NORMATTIVA_API_BASE` (default: `https://api.normattiva.it/t/normattiva.api`)
   - `PORT` (default: 8080, Railway lo imposta automaticamente)

### Branching strategy

- `main` → produzione, auto-deploy Railway
- `dev` → integrazione, PR target
- `feat/<nome>` → feature branches

## Health Check

```bash
GET https://mcp-italia.bettercallclaude.ch/health

{
  "status": "ok",
  "servers": 7,
  "serverNames": ["normattiva", "corte-costituzionale", ...],
  "endpoints": ["/normattiva/mcp", ...],
  "timestamp": "..."
}
```

## Variabili d'ambiente

| Variabile | Default | Descrizione |
|---|---|---|
| `PORT` | 8080 | Porta aggregatore HTTP |
| `NORMATTIVA_API_BASE` | `https://api.normattiva.it/t/normattiva.api` | Base URL API Normattiva |
| `NODE_ENV` | — | `production` o `development` |

## Configurazione Plugin BetterCallClaude

Aggiungere al `.mcp.json`:

```json
{
  "mcpServers": {
    "normattiva": { "type": "http", "url": "https://mcp-italia.bettercallclaude.ch/normattiva/mcp" },
    "corte-costituzionale": { "type": "http", "url": "https://mcp-italia.bettercallclaude.ch/corte-costituzionale/mcp" },
    "giustizia-amministrativa": { "type": "http", "url": "https://mcp-italia.bettercallclaude.ch/giustizia-amministrativa/mcp" },
    "cassazione": { "type": "http", "url": "https://mcp-italia.bettercallclaude.ch/cassazione/mcp" },
    "eur-lex-ita": { "type": "http", "url": "https://mcp-italia.bettercallclaude.ch/eur-lex-ita/mcp" },
    "legal-citations-ita": { "type": "http", "url": "https://mcp-italia.bettercallclaude.ch/legal-citations-ita/mcp" },
    "legal-persona-ita": { "type": "http", "url": "https://mcp-italia.bettercallclaude.ch/legal-persona-ita/mcp" }
  }
}
```
