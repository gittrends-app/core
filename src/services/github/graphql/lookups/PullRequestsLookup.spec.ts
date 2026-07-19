import { describe, expect, it } from 'vitest';
import { Fragment, FragmentFactory } from '../fragments/Fragment';
import { PullRequestsLookup } from './PullRequestsLookup';

class FakeFragment implements Fragment {
  readonly alias = 'PullRequestFrag';
  readonly fragments: Fragment[] = [];
  toString(): string {
    return 'fragment PullRequestFrag on PullRequest { id }';
  }
  parse(data: any): any {
    return { parsed: data.id };
  }
}

const factory: FragmentFactory = { create: () => new FakeFragment() as any };

function page(nodes: any[], hasNextPage = false, endCursor: string | null = null) {
  return { pullRequests: { pageInfo: { hasNextPage, endCursor }, nodes } };
}

describe('PullRequestsLookup', () => {
  const lookup = new PullRequestsLookup({ id: 'R_1', factory, per_page: 5 });

  it('should select the repository pullRequests connection ordered by update date', () => {
    const query = lookup.toString();
    expect(query).toContain('... on Repository');
    expect(query).toContain('pullRequests(first: 5, orderBy: { field: UPDATED_AT direction: ASC })');
  });

  it('should map each pull request node through the fragment', () => {
    const res = lookup.parse(page([{ id: 'a' }, { id: 'b' }]));
    expect(res.data).toEqual([{ parsed: 'a' }, { parsed: 'b' }]);
  });

  it('should throw the declared error when the connection is missing', () => {
    expect(() => lookup.parse({ pullRequests: undefined })).toThrowError('Failed to parse pull requests.');
  });
});
