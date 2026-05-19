import express, { type Request, type Response } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { getServerFactory, listServers } from './server-registry.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

app.use(express.json());

/**
 * Health check endpoint — lists all registered servers and their status.
 */
app.get('/health', (_req: Request, res: Response) => {
  const servers = listServers();
  res.json({
    status: 'ok',
    servers: servers.length,
    serverNames: servers.map((s) => s.name),
    endpoints: servers.map((s) => `/${s.path}/mcp`),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Root endpoint — service info.
 */
app.get('/', (_req: Request, res: Response) => {
  const servers = listServers();
  res.json({
    name: 'BetterCallClaude Italia MCP Aggregator',
    version: '1.0.0',
    description: 'Aggregatore HTTP per i server MCP del diritto italiano',
    endpoint_pattern: '/<server>/mcp',
    servers: servers.map((s) => ({
      name: s.name,
      description: s.description,
      endpoint: `/${s.path}/mcp`,
    })),
    health: '/health',
    documentation: 'https://github.com/fedec65/BetterCallClaudeMCP_Italy',
  });
});

/**
 * MCP Streamable HTTP endpoint for each registered server.
 */
app.post('/:serverName/mcp', async (req: Request, res: Response) => {
  const serverName = req.params.serverName;
  if (!serverName) {
    res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32600,
        message: 'Nome server mancante',
      },
      id: null,
    });
    return;
  }

  const factory = getServerFactory(serverName);
  if (!factory) {
    res.status(404).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: `Server non trovato: ${serverName}`,
      },
      id: null,
    });
    return;
  }

  try {
    const server = factory();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless mode
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error(`Errore MCP [${serverName}]:`, error);

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : 'Errore interno del server',
        },
        id: null,
      });
    }
  }
});

/**
 * 405 for GET on MCP endpoints (stateless mode does not use SSE).
 */
app.get('/:serverName/mcp', (_req: Request, res: Response) => {
  res.status(405).set('Allow', 'POST').json({
    error: 'Method Not Allowed',
    message: 'Usare POST per le richieste MCP Streamable HTTP',
  });
});

// Start server
app.listen(PORT, () => {
  console.error(
    `BetterCallClaude Italia MCP Aggregator running on port ${PORT}`
  );
  console.error(`Health check: http://localhost:${PORT}/health`);

  const servers = listServers();
  if (servers.length === 0) {
    console.error('[WARN] Nessun server MCP registrato.');
  } else {
    servers.forEach((s) => {
      console.error(`  - /${s.path}/mcp -> ${s.name}`);
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.error('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.error('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});
