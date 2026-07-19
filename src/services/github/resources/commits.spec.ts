import type { Fetch } from '@octokit/types';
import { describe, expect, it } from 'vitest';
import { GithubClient } from '../GithubClient';
import { BaseFragmentFactory } from '../graphql/fragments/Fragment';
import commits from './commits';

const factory = new BaseFragmentFactory();

function response(data: unknown): Response {
  return new Response(JSON.stringify({ data }), {
    headers: { 'content-type': 'application/json' },
    status: 200
  });
}

function commit(id: string, date: string) {
  return {
    __typename: 'Commit',
    additions: 3,
    author: { date, email: 'author@example.com', name: 'Author', user: null },
    authoredByCommitter: true,
    authoredDate: date,
    changedFilesIfAvailable: 2,
    comments: { totalCount: 0 },
    committedDate: date,
    committedViaWeb: false,
    committer: { date, email: 'committer@example.com', name: 'Committer', user: null },
    deletions: 1,
    deployments: { totalCount: 0 },
    id,
    message: 'message',
    messageBody: 'body',
    messageHeadline: 'headline',
    oid: `${id}-oid`,
    parents: { nodes: [] },
    repository: { id: 'R_1' },
    status: { state: 'SUCCESS' }
  };
}

describe('commits resource', () => {
  it('yields commits and threads the date window between pages', async () => {
    let request = 0;
    const fetcher = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      request += 1;
      const query = JSON.parse(String(init?.body)).query as string;
      if (request === 1) {
        expect(query).toContain('history(first: 1');
        return response({
          R1: {
            defaultBranchRef: {
              target: {
                history: {
                  nodes: [commit('C_1', '2020-01-01T00:00:00Z')],
                  pageInfo: { endCursor: 'cursor-1', hasNextPage: true }
                }
              }
            }
          }
        });
      }

      expect(query).toContain('after: "cursor-1"');
      return response({
        R1: {
          defaultBranchRef: {
            target: {
              history: {
                nodes: [commit('C_2', '2020-01-02T00:00:00Z')],
                pageInfo: { endCursor: null, hasNextPage: false }
              }
            }
          }
        }
      });
    }) as Fetch;
    const client = new GithubClient('https://example.com', { fetcher });
    const pages = [];

    for await (const page of commits(client, { id: 'R_1', factory, per_page: 1 })) pages.push(page);

    expect(pages).toHaveLength(2);
    expect(pages[0].data[0]).toMatchObject({ id: 'C_1', repository: 'R_1' });
    expect(pages[1].data[0]).toMatchObject({ id: 'C_2', repository: 'R_1' });
    expect(pages[0].metadata.since).toEqual(new Date('2020-01-01T00:00:00Z'));
    expect(pages[1].metadata.since).toEqual(new Date('2020-01-02T00:00:00Z'));
  });
});
