import { describe, expect, it } from 'vitest';
import { Fragment, FragmentFactory } from '../fragments/Fragment';
import { TimelineItemsLookup } from './TimelineItemsLookup';

class FakeFragment implements Fragment {
  readonly fragments: Fragment[] = [];
  constructor(readonly alias: string) {}
  toString(): string {
    return `fragment ${this.alias} on TimelineItem { __typename }`;
  }
  parse(data: any): any {
    return { parsed: data.id };
  }
}

const factory: FragmentFactory = { create: (Ref: any) => new FakeFragment(Ref.name) as any };

function page(nodes: any[], hasNextPage = false, endCursor: string | null = null) {
  return { timelineItems: { pageInfo: { hasNextPage, endCursor }, nodes } };
}

describe('TimelineItemsLookup', () => {
  it('should cast the node to Issue and use the issue timeline fragment by default', () => {
    const lookup = new TimelineItemsLookup({ id: 'I_1', factory });
    const query = lookup.toString();
    expect(query).toContain('... on Issue');
    expect(query).toContain('IssueTimelineItemFragment');
  });

  it('should cast the node to PullRequest and use the pull request timeline fragment', () => {
    const lookup = new TimelineItemsLookup({ id: 'PR_1', factory, type: 'PullRequest' });
    const query = lookup.toString();
    expect(query).toContain('... on PullRequest');
    expect(query).toContain('PullRequestTimelineItemFragment');
  });

  it('should map each timeline node through the fragment', () => {
    const lookup = new TimelineItemsLookup({ id: 'I_1', factory });
    const res = lookup.parse(page([{ id: 'a' }, { id: 'b' }]));
    expect(res.data).toEqual([{ parsed: 'a' }, { parsed: 'b' }]);
  });

  it('should throw the declared error when the connection is missing', () => {
    const lookup = new TimelineItemsLookup({ id: 'I_1', factory });
    expect(() => lookup.parse({ timelineItems: undefined })).toThrowError('Failed to parse timeline items.');
  });
});
