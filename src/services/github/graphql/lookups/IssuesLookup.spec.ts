import { describe, expect, it } from 'vitest';
import { Fragment, FragmentFactory } from '../fragments/Fragment';
import { IssuesLookup } from './IssuesLookup';

class FakeFragment implements Fragment {
  readonly alias = 'IssueFrag';
  readonly fragments: Fragment[] = [];
  toString(): string {
    return 'fragment IssueFrag on Issue { id }';
  }
  parse(data: any): any {
    return { parsed: data.id };
  }
}

const factory: FragmentFactory = { create: () => new FakeFragment() as any };

function page(nodes: any[], hasNextPage = false, endCursor: string | null = null) {
  return { issues: { pageInfo: { hasNextPage, endCursor }, nodes } };
}

describe('IssuesLookup', () => {
  const lookup = new IssuesLookup({ id: 'R_1', factory, per_page: 2 });

  it('should select the repository issues connection ordered by update date', () => {
    const query = lookup.toString();
    expect(query).toContain('node(id: "R_1")');
    expect(query).toContain('... on Repository');
    expect(query).toContain('issues(first: 2, orderBy: { field: UPDATED_AT direction: ASC })');
  });

  it('should map each issue node through the fragment', () => {
    const res = lookup.parse(page([{ id: 'a' }, { id: 'b' }], false, 'cur'));
    expect(res.data).toEqual([{ parsed: 'a' }, { parsed: 'b' }]);
    expect(res.params.cursor).toBe('cur');
  });

  it('should continue while the connection reports another page', () => {
    const res = lookup.parse(page([{ id: 'a' }], true, 'cur-1'));
    expect(res.next).toBeInstanceOf(IssuesLookup);
    expect(res.next?.params.cursor).toBe('cur-1');
  });

  it('should throw the declared error when the connection is missing', () => {
    expect(() => lookup.parse({ issues: undefined })).toThrowError('Failed to parse tags.');
  });
});
