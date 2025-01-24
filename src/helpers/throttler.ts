import pLimit from 'p-limit';

/**
 * Limit the number of concurrent requests.
 */
export default function (fetch: typeof global.fetch, limit: number) {
  const limiter = pLimit(limit);
  return (...args: Parameters<typeof fetch>) => limiter(() => fetch(...args));
}
