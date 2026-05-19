import axios, { AxiosInstance, AxiosError } from 'axios';
import pRetry from 'p-retry';
import { withRateLimit } from './rate-limiter.js';

export interface HttpClientOptions {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Create a configured HTTP client for Italian legal APIs.
 */
export function createHttpClient(options: HttpClientOptions = {}): AxiosInstance {
  return axios.create({
    timeout: options.timeout ?? 30000,
    headers: {
      Accept: 'application/json',
      'User-Agent': 'BetterCallClaude-Italia-MCP/1.0.0 (Italian Legal Intelligence)',
      ...options.headers,
    },
    ...options,
  });
}

/**
 * Execute an HTTP request with retry logic and rate limiting.
 */
export async function fetchWithRetry<T>(
  api: string,
  fn: () => Promise<T>,
  options: { retries?: number; onRetry?: (error: Error, attempt: number) => void } = {}
): Promise<T> {
  const { retries = 3, onRetry } = options;

  return pRetry(
    () => withRateLimit(api, fn),
    {
      retries,
      onFailedAttempt: (error) => {
        if (onRetry) {
          onRetry(error, error.attemptNumber);
        }
        console.error(
          `API ${api} request failed (attempt ${error.attemptNumber}/${retries + 1}):`,
          error.message
        );
      },
      shouldRetry: (error) => {
        if (error instanceof AxiosError) {
          const status = error.response?.status;
          return !status || status >= 500 || status === 429;
        }
        return true;
      },
    }
  );
}

/**
 * Parse an API error into a standardized format.
 */
export function parseApiError(error: unknown): {
  code: string;
  message: string;
  retryable: boolean;
} {
  if (error instanceof AxiosError) {
    const status = error.response?.status;

    if (status === 429) {
      return {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Limite di richieste superato. Riprova più tardi.',
        retryable: true,
      };
    }

    if (status === 408 || error.code === 'ECONNABORTED') {
      return {
        code: 'API_TIMEOUT',
        message: 'Timeout nella richiesta all\'API. Riprova.',
        retryable: true,
      };
    }

    if (!status || status >= 500) {
      return {
        code: 'API_UNAVAILABLE',
        message: `Servizio non disponibile: ${error.message}`,
        retryable: true,
      };
    }

    return {
      code: 'API_ERROR',
      message: error.message,
      retryable: false,
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: error instanceof Error ? error.message : 'Errore sconosciuto',
    retryable: false,
  };
}

// Pre-configured clients
export const normattivaClient = createHttpClient({
  baseURL: 'https://api.normattiva.it/t/normattiva.api',
  timeout: 30000,
});

export const eurLexClient = createHttpClient({
  baseURL: 'https://eur-lex.europa.eu',
  timeout: 45000,
  headers: {
    Accept: 'application/sparql-results+json, application/json',
  },
});
