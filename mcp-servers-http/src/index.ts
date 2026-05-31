import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { getServerFactory, listServers } from './server-registry.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

/**
 * CORS whitelist — restrict to known origins.
 */
const allowedOrigins = [
  /^https:\/\/[^/]+\.bettercallclaude\.ch$/,
  /^https:\/\/[^/]+\.bettercallclaude\.it$/,
  /^https:\/\/bettercallclaude\.ch$/,
  /^https:\/\/bettercallclaude\.it$/,
  /^http:\/\/localhost:\d+$/,
];

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true; // allow non-browser clients (curl, server-to-server)
  return allowedOrigins.some((pattern) => pattern.test(origin));
}

/**
 * Security middleware
 */
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS non consentito per questa origine'));
      }
    },
  })
);
app.use(express.json());

/**
 * General rate limiter for all routes.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Troppe richieste. Attendi prima di riprovare.',
    });
  },
});
app.use(generalLimiter);

/**
 * Stricter rate limiter for MCP tool calls.
 */
const mcpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Troppe richieste MCP. Attendi prima di riprovare.',
    });
  },
});

/**
 * Health check rate limiter.
 */
const healthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Troppe richieste di health check. Attendi prima di riprovare.',
    });
  },
});

/**
 * Health check endpoint — minimal info to reduce information disclosure.
 */
app.get('/health', healthLimiter, (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
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
 * security.txt endpoint (RFC 9116).
 */
app.get('/.well-known/security.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send(
    'Contact: security@bettercallclaude.ch\n' +
    'Acknowledgments: https://bettercallclaude.ch/security\n' +
    'Policy: https://bettercallclaude.ch/security-policy\n'
  );
});

/**
 * MCP Streamable HTTP endpoint for each registered server.
 */
app.post('/:serverName/mcp', mcpLimiter, async (req: Request, res: Response) => {
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

// Start server — bind to 0.0.0.0 to accept connections from outside the container
app.listen(PORT, '0.0.0.0', () => {
  console.error(
    `BetterCallClaude Italia MCP Aggregator running on port ${PORT}`
  );
  console.error(`Health check: http://0.0.0.0:${PORT}/health`);

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
