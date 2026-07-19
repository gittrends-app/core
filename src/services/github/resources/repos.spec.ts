import type { Fetch } from '@octokit/types';
import { describe, expect, it } from 'vitest';
import { GithubClient } from '../GithubClient';
import { BaseFragmentFactory } from '../graphql/fragments/Fragment';
import repos from './repos';

const factory = new BaseFragmentFactory(true);

function repositoryNode(id: string) {
  return {
    __typename: 'Repository',
    databaseId: 100,
    description: 'desc',
    id,
    name: 'repo',
    nameWithOwner: `owner/${id}`,
    owner: { __typename: 'User', id: 'owner-id', login: 'owner', avatarUrl: 'https://example.com/a.png' },
    primaryLanguage: { name: 'TypeScript' },
    stargazerCount: 42,
    forkCount: 7,
    defaultBranchRef: { name: 'main', target: { history: { totalCount: 500 } } },
    branches: { totalCount: 3 },
    tags: { totalCount: 9 }
  };
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

describe('repos resource', () => {
  it('returns a single repository entity when given a scalar id', async () => {
    const fetcher = (async () => response({ [alias('repo-1')]: repositoryNode('repo-1') })) as Fetch;
    const client = new GithubClient('https://example.com', { fetcher });

    const result = await repos('repo-1', { client, factory });

    expect(Array.isArray(result)).toBe(false);
    expect(result).toMatchObject({ __typename: 'Repository', id: 'repo-1', name_with_owner: 'owner/repo-1' });
  });

  it('returns an array preserving input order when given an array of ids', async () => {
    const fetcher = (async () =>
      response({
        [alias('repo-1')]: repositoryNode('repo-1'),
        [alias('repo-2')]: repositoryNode('repo-2')
      })) as Fetch;
    const client = new GithubClient('https://example.com', { fetcher });

    const result = await repos(['repo-1', 'repo-2'], { client, factory });

    expect(Array.isArray(result)).toBe(true);
    expect(result.map((r: { id: string } | null) => r?.id)).toEqual(['repo-1', 'repo-2']);
  });

  it('yields null for a missing repository', async () => {
    const fetcher = (async () => response({ [alias('missing')]: null })) as Fetch;
    const client = new GithubClient('https://example.com', { fetcher });

    const result = await repos('missing', { client, factory });

    expect(result).toBeNull();
  });

  it('queries by owner/name when byName is set', async () => {
    let sentQuery = '';
    const fetcher = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      sentQuery = JSON.parse(String(init?.body)).query;
      return response({ [alias('owner/repo-1')]: repositoryNode('owner/repo-1') });
    }) as Fetch;
    const client = new GithubClient('https://example.com', { fetcher });

    const result = await repos('owner/repo-1', { client, factory, byName: true });

    expect(sentQuery).toContain('repository(owner: "owner", name: "repo-1")');
    expect(result).toMatchObject({ id: 'owner/repo-1' });
  });
});
