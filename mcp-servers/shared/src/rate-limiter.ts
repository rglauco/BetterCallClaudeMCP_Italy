import Bottleneck from 'bottleneck';

const limiters = new Map<string, Bottleneck>();

const defaultConfigs: Record<string, { minTime: number; maxConcurrent: number }> = {
  normattiva: { minTime: 1000, maxConcurrent: 2 },
  eurlex: { minTime: 1500, maxConcurrent: 2 },
  cassazione: { minTime: 2000, maxConcurrent: 1 },
  cortecostituzionale: { minTime: 1500, maxConcurrent: 2 },
  giustiziaamministrativa: { minTime: 1500, maxConcurrent: 2 },
  default: { minTime: 1000, maxConcurrent: 5 },
};

function getLimiter(api: string): Bottleneck {
  if (!limiters.has(api)) {
    const config = defaultConfigs[api] ?? defaultConfigs.default;
    limiters.set(api, new Bottleneck(config));
  }
  return limiters.get(api)!;
}

/**
 * Execute a function under rate limiting for the given API.
 */
export async function withRateLimit<T>(api: string, fn: () => Promise<T>): Promise<T> {
  const limiter = getLimiter(api);
  return limiter.schedule(fn);
}

/**
 * Configure a custom rate limiter for an API.
 */
export function configureRateLimit(
  api: string,
  config: { minTime: number; maxConcurrent: number }
): void {
  limiters.set(api, new Bottleneck(config));
}
