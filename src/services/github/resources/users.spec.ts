import type { Fetch } from '@octokit/types';
import { describe, expect, it } from 'vitest';
import { GithubClient } from '../GithubClient';
import { BaseFragmentFactory } from '../graphql/fragments/Fragment';
import users from './users';

const factory = new BaseFragmentFactory();

function userNode(id: string) {
  return { __typename: 'User', id, login: id, avatarUrl: 'https://example.com/a.png' };
}

function response(data: unknown): Response {
  return new Response(JSON.stringify({ data }), {
    headers: { 'content-type': 'application/json' },
    status: 200
  });
}

function alias(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, '');
}

function nodesFor(ids: string[]): Record<string, unknown> {
  return Object.fromEntries(ids.map((id) => [alias(id), userNode(id)]));
}

describe('users resource', () => {
  it('returns a single actor when given a scalar id', async () => {
    const fetcher = (async () => response(nodesFor(['U_1']))) as Fetch;
    const client = new GithubClient('https://example.com', { fetcher });

    const result = await users('U_1', { client, factory });

    expect(Array.isArray(result)).toBe(false);
    expect(result).toMatchObject({ __typename: 'User', id: 'U_1', login: 'U_1' });
  });

  it('returns actors in input order when given an array of ids', async () => {
    const fetcher = (async () => response(nodesFor(['U_1', 'U_2', 'U_3']))) as Fetch;
    const client = new GithubClient('https://example.com', { fetcher });

    const result = await users(['U_1', 'U_2', 'U_3'], { client, factory });

    expect(result.map((r: { id: string } | null) => r?.id)).toEqual(['U_1', 'U_2', 'U_3']);
  });

  it('splits requests into batches of ten preserving order across batches', async () => {
    const ids = Array.from({ length: 11 }, (_, i) => `U_${i + 1}`);
    let requestCount = 0;
    const fetcher = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      requestCount += 1;
      const query = JSON.parse(String(init?.body)).query as string;
      const requested = ids.filter((id) => query.includes(`node(id: "${id}")`));
      return response(nodesFor(requested));
    }) as Fetch;
    const client = new GithubClient('https://example.com', { fetcher });

    const result = await users(ids, { client, factory });

    expect(requestCount).toBe(2);
    expect(result.map((r: { id: string } | null) => r?.id)).toEqual(ids);
  });

  it('yields null for a missing user', async () => {
    const fetcher = (async () => response({ [alias('missing')]: null })) as Fetch;
    const client = new GithubClient('https://example.com', { fetcher });

    const result = await users('missing', { client, factory });

    expect(result).toBeNull();
  });

  it('returns an empty array for an empty id list', async () => {
    let called = false;
    const fetcher = (async () => {
      called = true;
      return response({});
    }) as Fetch;
    const client = new GithubClient('https://example.com', { fetcher });

    const result = await users([], { client, factory });

    expect(result).toEqual([]);
    expect(called).toBe(false);
  });
});
