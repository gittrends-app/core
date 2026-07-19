import type { Fetch } from '@octokit/types';
import { describe, expect, it, vi } from 'vitest';
import { GithubClient } from './GithubClient';

function response(data: unknown): Response {
  return new Response(JSON.stringify({ data }), {
    headers: { 'content-type': 'application/json' },
    status: 200
  });
}

describe('GithubClient', () => {
  it.each(['timeout', 'maxConcurrentRequests'])('rejects invalid %s values', (option) => {
    expect(() => new GithubClient('https://example.com', { [option]: 0 })).toThrow();
  });

  it('aborts requests that exceed the configured timeout', async () => {
    const fetcher = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(init.signal?.reason));
      });
    });
    const client = new GithubClient('https://example.com', { fetcher: fetcher as unknown as Fetch, timeout: 10 });

    await expect(client.graphql('{ viewer { login } }')).rejects.toThrow('timed out after 10ms');
    expect(fetcher).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('does not add an abort signal when no timeout is configured', async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => {
      return response({ viewer: { login: 'octocat' } });
    });
    const client = new GithubClient('https://example.com', { fetcher: fetcher as unknown as Fetch });

    await expect(client.graphql('{ viewer { login } }')).resolves.toMatchObject({ viewer: { login: 'octocat' } });
    expect(fetcher.mock.calls[0][1]?.signal).toBeUndefined();
  });

  it('limits concurrent requests to the configured maximum', async () => {
    let active = 0;
    let maximum = 0;
    const fetcher = vi.fn(async () => {
      active++;
      maximum = Math.max(maximum, active);
      await Promise.resolve();
      active--;
      return response({ viewer: { login: 'octocat' } });
    });
    const client = new GithubClient('https://example.com', {
      fetcher: fetcher as unknown as Fetch,
      maxConcurrentRequests: 1
    });

    await Promise.all([client.graphql('{ viewer { login } }'), client.graphql('{ viewer { login } }')]);

    expect(maximum).toBe(1);
  });
});
