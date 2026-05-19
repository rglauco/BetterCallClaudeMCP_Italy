export { LegalCache, searchCache, citationCache, statuteCache } from './cache.js';
export { withRateLimit, configureRateLimit } from './rate-limiter.js';
export {
  createHttpClient,
  fetchWithRetry,
  parseApiError,
  normattivaClient,
  eurLexClient,
} from './http-client.js';
export type { HttpClientOptions } from './http-client.js';
