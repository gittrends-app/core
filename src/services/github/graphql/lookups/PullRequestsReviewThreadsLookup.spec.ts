import { describe, expect, it } from 'vitest';
import { Fragment, FragmentFactory } from '../fragments/Fragment';
import { PullRequestsReviewThreadsLookup } from './PullRequestsReviewThreadsLookup';

class FakeFragment implements Fragment {
  readonly fragments: Fragment[] = [];
  constructor(readonly alias: string) {}
  toString(): string {
    return `fragment ${this.alias} on Node { id }`;
  }
  parse(data: any): any {
    return { id: data.id, __typename: 'User' };
  }
}

const factory: FragmentFactory = { create: (Ref: any) => new FakeFragment(Ref.name) as any };

function node(overrides: Partial<Record<string, any>> = {}) {
  return {
    id: 'RT_1',
    __typename: 'PullRequestReviewThread',
    comments: { totalCount: 0, nodes: [] },
    diffSide: 'RIGHT',
    isCollapsed: false,
    isOutdated: false,
    isResolved: true,
    line: 12,
    originalLine: 10,
    originalStartLine: null,
    path: 'src/index.ts',
    resolvedBy: null,
    startDiffSide: null,
    startLine: null,
    subjectType: 'LINE',
    ...overrides
  };
}

function page(nodes: any[], hasNextPage = false, endCursor: string | null = null) {
  return { reviewThreads: { pageInfo: { hasNextPage, endCursor }, nodes } };
}

describe('PullRequestsReviewThreadsLookup', () => {
  const lookup = new PullRequestsReviewThreadsLookup({ id: 'PR_1', factory });

  it('should select the reviewThreads connection on a PullRequest node', () => {
    const query = lookup.toString();
    expect(query).toContain('... on PullRequest');
    expect(query).toContain('reviewThreads(first: 100)');
  });

  it('should map a review thread node to the PullRequestReviewThread entity', () => {
    const res = lookup.parse(page([node()], false, 'cur'));
    expect(res.data[0]).toMatchObject({
      id: 'RT_1',
      __typename: 'PullRequestReviewThread',
      comments_count: 0,
      diff_side: 'RIGHT',
      is_resolved: true,
      line: 12,
      original_line: 10,
      path: 'src/index.ts',
      subject_type: 'LINE'
    });
    expect(res.params.cursor).toBe('cur');
  });

  it('should continue while the connection reports another page', () => {
    const res = lookup.parse(page([node()], true, 'cur-1'));
    expect(res.next).toBeInstanceOf(PullRequestsReviewThreadsLookup);
    expect(res.next?.params.cursor).toBe('cur-1');
  });

  it('should throw when the reviewThreads connection is missing', () => {
    expect(() => lookup.parse({ reviewThreads: undefined })).toThrowError('Failed to parse data.');
  });
});
