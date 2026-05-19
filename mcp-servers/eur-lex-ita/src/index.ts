#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { SearchEurLexInputSchema, GetAttoCelexInputSchema } from './types.js';
import { searchEurLex } from './tools/search-eurlex.js';
import { getAttoCelex } from './tools/get-atto-celex.js';

const tools: Tool[] = [
  {
    name: 'eur-lex-ita:search',
    description: `Ricerca atti UE in lingua italiana tramite EUR-Lex.

Parametri:
- query (obbligatorio): parole chiave
- tipoAtto: tipo atto (REGULATION, DIRECTIVE, ecc.)
- numero: numero atto
- anno: anno atto
- materia: materia
- page / pageSize: paginazione`,
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        tipoAtto: { type: 'string' },
        numero: { type: 'string' },
        anno: { type: 'number' },
        materia: { type: 'string' },
        page: { type: 'number', minimum: 1 },
        pageSize: { type: 'number', minimum: 1, maximum: 50 },
      },
      required: ['query'],
    },
  },
  {
    name: 'eur-lex-ita:get_atto_celex',
    description: `Recupera un atto UE tramite codice CELEX.

Parametri:
- celex (obbligatorio): codice CELEX (es. 32016R0679)`,
    inputSchema: {
      type: 'object',
      properties: {
        celex: { type: 'string' },
      },
      required: ['celex'],
    },
  },
];

export function createEurLexItaServer(): Server {
  const server = new Server(
    { name: 'eur-lex-ita', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      switch (name) {
        case 'eur-lex-ita:search': {
          const input = SearchEurLexInputSchema.parse(args);
          const result = await searchEurLex(input);
          return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: result }, null, 2) }] };
        }
        case 'eur-lex-ita:get_atto_celex': {
          const input = GetAttoCelexInputSchema.parse(args);
          const result = await getAttoCelex(input);
          return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: result }, null, 2) }] };
        }
        default:
          throw new Error(`Tool sconosciuto: ${name}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: message }, null, 2) }], isError: true };
    }
  });

  return server;
}

async function main(): Promise<void> {
  const server = createEurLexItaServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('EUR-Lex Italia MCP server running on stdio');
  process.on('SIGINT', async () => { await server.close(); process.exit(0); });
  process.on('SIGTERM', async () => { await server.close(); process.exit(0); });
}

main().catch((err) => { console.error('Fatal error:', err); process.exit(1); });
