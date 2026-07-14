import { graphql } from '@octokit/graphql';
import { Fetch } from '@octokit/types';
import throttler from '../../helpers/throttler';

export type GithubClientOptions = {
  apiToken?: string;
  fetcher?: Fetch;
  timeout?: number;
  maxConcurrentRequests?: number;
};

/**
 * GithubClient is a wrapper around the Github API client.
 */
export class GithubClient {
  private readonly baseUrl: string;
  private readonly apiToken?: string;
  private readonly fetcher?: Fetch;

  /**
   * Creates a new GithubClient.
   * @param baseUrl The GitHub GraphQL API base URL.
   * @param opts The client transport options.
   * @param opts.timeout The request timeout in milliseconds.
   * @param opts.maxConcurrentRequests The maximum number of in-flight requests.
   */
  constructor(baseUrl: string = 'https://api.github.com', opts?: GithubClientOptions) {
    this.baseUrl = baseUrl;
    this.apiToken = opts?.apiToken;

    const timeout = opts?.timeout;
    if (timeout !== undefined && (!Number.isInteger(timeout) || timeout <= 0)) {
      throw new Error('Timeout must be a positive integer.');
    }

    const maxConcurrentRequests = opts?.maxConcurrentRequests ?? 2;
    if (!Number.isInteger(maxConcurrentRequests) || maxConcurrentRequests <= 0) {
      throw new Error('Maximum concurrent requests must be a positive integer.');
    }

    const fetcher = opts?.fetcher || fetch;
    this.fetcher = throttler(withTimeout(fetcher, timeout), maxConcurrentRequests);
  }

  /**
   * Returns a graphql client.
   */
  get graphql(): typeof graphql {
    return graphql.defaults({
      request: { fetch: this.fetcher },
      baseUrl: this.baseUrl,
      mediaType: { previews: ['starfox'] },
      headers: { authorization: `bearer ${this.apiToken}` }
    });
  }
}

function withTimeout(fetcher: Fetch, timeout?: number): Fetch {
  if (timeout === undefined) return fetcher;

  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const controller = new AbortController();
    const timeoutError = new Error(`GitHub request timed out after ${timeout}ms.`);
    const timer = setTimeout(() => controller.abort(timeoutError), timeout);
    const signal = init?.signal;

    if (signal?.aborted) controller.abort(signal.reason);
    else signal?.addEventListener('abort', () => controller.abort(signal.reason), { once: true });

    try {
      return await fetcher(input, { ...init, signal: controller.signal });
    } catch (error) {
      if (controller.signal.reason === timeoutError) {
        Object.assign(timeoutError, { cause: error });
        throw timeoutError;
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }) as Fetch;
}
