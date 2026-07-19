import type { Fetch } from '@octokit/types';
import { describe, expect, it } from 'vitest';
import { GithubClient } from '../GithubClient';
import { Fragment, FragmentFactory } from '../graphql/fragments/Fragment';
import pullRequests from './pull_requests';

class FakePullRequestFragment implements Fragment {
  readonly alias = 'PullRequestFragment';
  readonly fragments: Fragment[] = [];
  toString(): string {
    return 'fragment PullRequestFragment on PullRequest { id }';
  }
  parse(data: any): any {
    return { id: data.id, reactions_count: 0, timeline_items_count: 0 };
  }
}

const factory: FragmentFactory = { create: () => new FakePullRequestFragment() as any };

function response(data: unknown): Response {
  return new Response(JSON.stringify({ data }), {
    headers: { 'content-type': 'application/json' },
    status: 200
  });
}

describe('pull requests resource', () => {
  it('yields pull requests after running per-item enrichment', async () => {
    const fetcher = (async () =>
      response({
        R1: {
          pullRequests: {
            nodes: [{ id: 'PR_1' }, { id: 'PR_2' }],
            pageInfo: { endCursor: null, hasNextPage: false }
          }
        }
      })) as Fetch;
    const client = new GithubClient('https://example.com', { fetcher });
    const pages = [];

    for await (const page of pullRequests(client, { id: 'R_1', factory })) pages.push(page);

    expect(pages).toHaveLength(1);
    expect(pages[0].data).toEqual([
      { id: 'PR_1', reactions_count: 0, timeline_items_count: 0 },
      { id: 'PR_2', reactions_count: 0, timeline_items_count: 0 }
    ]);
  });
});
