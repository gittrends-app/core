import type { Fetch } from '@octokit/types';
import { describe, expect, it } from 'vitest';
import { GithubClient } from '../GithubClient';
import { BaseFragmentFactory } from '../graphql/fragments/Fragment';
import releases from './releases';

const factory = new BaseFragmentFactory();

function response(data: unknown): Response {
  return new Response(JSON.stringify({ data }), {
    headers: { 'content-type': 'application/json' },
    status: 200
  });
}

function release() {
  return {
    __typename: 'Release',
    author: { __typename: 'User', id: 'U_1', login: 'octocat', avatarUrl: 'https://example.com/a.png' },
    createdAt: '2020-01-01T00:00:00Z',
    databaseId: 7,
    id: 'REL_1',
    immutable: false,
    isDraft: false,
    isPrerelease: false,
    name: 'v1.0.0',
    publishedAt: '2020-01-02T00:00:00Z',
    reactions: { totalCount: 1 },
    repository: { id: 'R_1' },
    tagCommit: { id: 'C_1' },
    tagName: 'v1.0.0',
    updatedAt: '2020-01-03T00:00:00Z'
  };
}

describe('releases resource', () => {
  it('enriches releases that have reactions and yields the release page', async () => {
    const fetcher = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      const query = JSON.parse(String(init?.body)).query as string;
      if (query.includes('releases(')) {
        return response({
          R1: { releases: { nodes: [release()], pageInfo: { endCursor: null, hasNextPage: false } } }
        });
      }

      expect(query).toContain('reactions(');
      return response({ REL1: { reactions: { nodes: [], pageInfo: { endCursor: null, hasNextPage: false } } } });
    }) as Fetch;
    const client = new GithubClient('https://example.com', { fetcher });
    const pages = [];

    for await (const page of releases(client, { id: 'R_1', factory })) pages.push(page);

    expect(pages).toHaveLength(1);
    expect(pages[0].data[0]).toMatchObject({
      id: 'REL_1',
      repository: 'R_1',
      tag_name: 'v1.0.0',
      reactions: []
    });
  });
});
