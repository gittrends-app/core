import type { Fetch } from '@octokit/types';
import { describe, expect, it, vi } from 'vitest';
import { GithubClient } from './GithubClient';

function getFetcher(client: GithubClient): Fetch {
  return (client as unknown as { fetcher: Fetch }).fetcher;
}

describe('GithubClient', () => {
  it.each(['timeout', 'maxConcurrentRequests'])('rejects invalid %s values', (option) => {
    const value = option === 'timeout' ? 0 : 0;

    expect(() => new GithubClient('https://example.com', { [option]: value })).toThrow();
  });

  it('aborts requests that exceed the configured timeout', async () => {
    const fetcher = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(init.signal?.reason));
      });
    });
    const client = new GithubClient('https://example.com', { fetcher: fetcher as unknown as Fetch, timeout: 10 });

    await expect(getFetcher(client)('https://example.com')).rejects.toThrow('timed out after 10ms');
    expect(fetcher).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('does not add an abort signal when no timeout is configured', async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      return new Response(init?.signal ? 'signal' : 'no-signal');
    });
    const client = new GithubClient('https://example.com', { fetcher: fetcher as unknown as Fetch });

    await expect(getFetcher(client)('https://example.com')).resolves.toMatchObject({ status: 200 });
    expect(fetcher).toHaveBeenCalledWith('https://example.com');
  });

  it('limits custom fetchers to the configured concurrency', async () => {
    let active = 0;
    let maximum = 0;
    const fetcher = vi.fn(async () => {
      active++;
      maximum = Math.max(maximum, active);
      await Promise.resolve();
      active--;
      return new Response('ok');
    });
    const client = new GithubClient('https://example.com', {
      fetcher: fetcher as unknown as Fetch,
      maxConcurrentRequests: 1
    });
    const limitedFetch = getFetcher(client);

    await Promise.all([limitedFetch('https://example.com/1'), limitedFetch('https://example.com/2')]);

    expect(maximum).toBe(1);
  });
});
