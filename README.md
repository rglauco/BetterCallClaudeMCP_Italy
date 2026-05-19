# BetterCallClaude Italia — MCP Servers

> Estensione italiana del framework open-source di ricerca giuridica AI [BetterCallClaude](https://bettercallclaude.ch).

## Visione

BetterCallClaude Italia espone un insieme di **MCP server** (Model Context Protocol) che consentono ai modelli linguistici di grande dimensione — in particolare Claude di Anthropic — di interrogare in modo strutturato le principali fonti giuridiche italiane gratuite e aperte.

## Endpoint di produzione

```
https://mcp-italia.bettercallclaude.ch
```

## Server disponibili

| Server | Fonte | Endpoint |
|---|---|---|
| `normattiva` | Legislazione italiana (1861–oggi) | `/normattiva/mcp` |
| `corte-costituzionale` | Sentenze Corte Costituzionale | `/corte-costituzionale/mcp` |
| `giustizia-amministrativa` | TAR e Consiglio di Stato | `/giustizia-amministrativa/mcp` |
| `cassazione` | Giurisprudenza Corte di Cassazione | `/cassazione/mcp` |
| `eur-lex-ita` | Diritto UE in lingua italiana | `/eur-lex-ita/mcp` |
| `legal-citations-ita` | Validazione citazioni normative italiane | `/legal-citations-ita/mcp` |
| `legal-persona-ita` | Drafting documenti giuridici italiani | `/legal-persona-ita/mcp` |

## Configurazione plugin BetterCallClaude

Aggiungi al tuo `.mcp.json`:

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

## Sviluppo locale

```bash
# Installazione dipendenze
npm install

# Build tutti i workspace
npm run build

# Avvio aggregatore HTTP
npm start

# Test
npm test
```

## Struttura del repository

```
mcp-servers/
├── normattiva/
├── corte-costituzionale/
├── giustizia-amministrativa/
├── cassazione/
├── eur-lex-ita/
├── legal-citations-ita/
├── legal-persona-ita/
└── shared/           # Utilità condivise

mcp-servers-http/     # Aggregatore HTTP Express
docs/                 # Documentazione
```

## Licenza

GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)

---

*Progetto BetterCallClaude Associazione (Art. 60 CC svizzero)*
