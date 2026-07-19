import type { Fetch } from '@octokit/types';
import { describe, expect, it } from 'vitest';
import { GithubClient } from '../GithubClient';
import { BaseFragmentFactory } from '../graphql/fragments/Fragment';
import discussions from './discussions';

const factory = new BaseFragmentFactory();

function response(data: unknown): Response {
  return new Response(JSON.stringify({ data }), {
    headers: { 'content-type': 'application/json' },
    status: 200
  });
}

function discussion(id: string) {
  return {
    __typename: 'Discussion',
    id,
    databaseId: 10,
    activeLockReason: null,
    answer: null,
    answerChosenAt: null,
    answerChosenBy: null,
    author: { __typename: 'User', id: 'U_1', login: 'octocat', avatarUrl: 'https://example.com/a.png' },
    authorAssociation: 'OWNER',
    body: 'hello',
    category: { name: 'General' },
    closed: false,
    closedAt: null,
    comments: { totalCount: 0 },
    createdAt: '2020-01-01T00:00:00Z',
    createdViaEmail: false,
    editor: null,
    includesCreatedEdit: false,
    isAnswered: false,
    labels: { nodes: [] },
    lastEditedAt: null,
    locked: false,
    number: 1,
    publishedAt: '2020-01-01T00:00:00Z',
    reactions: { totalCount: 0 },
    stateReason: null,
    title: id,
    updatedAt: '2020-01-02T00:00:00Z',
    upvoteCount: 2
  };
}

describe('discussions resource', () => {
  it('yields discussions in source order without enrichment when counts are zero', async () => {
    let requests = 0;
    const fetcher = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      requests += 1;
      const query = JSON.parse(String(init?.body)).query as string;
      expect(query).toContain('discussions(');
      return response({
        R1: {
          discussions: {
            nodes: [discussion('D_1'), discussion('D_2')],
            pageInfo: { endCursor: null, hasNextPage: false }
          }
        }
      });
    }) as Fetch;
    const client = new GithubClient('https://example.com', { fetcher });
    const pages = [];

    for await (const page of discussions(client, { id: 'R_1', factory })) pages.push(page);

    expect(requests).toBe(1);
    expect(pages[0].data.map((item: { id: string }) => item.id)).toEqual(['D_1', 'D_2']);
    expect(pages[0].data[0]).toMatchObject({ repository: 'R_1', category: 'General', comments_count: 0 });
  });
});
