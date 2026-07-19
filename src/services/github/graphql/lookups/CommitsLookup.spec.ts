import { describe, expect, it } from 'vitest';
import { Fragment, FragmentFactory } from '../fragments/Fragment';
import { CommitsLookup } from './CommitsLookup';

class FakeCommitFragment implements Fragment {
  readonly alias = 'CommitFragment';
  readonly fragments: Fragment[] = [];
  toString(): string {
    return 'fragment CommitFragment on Commit { id }';
  }
  parse(data: any): any {
    return { id: data.id, committed_date: new Date(data.committedDate) };
  }
}

const factory: FragmentFactory = { create: () => new FakeCommitFragment() as any };

function history(nodes: any[], hasNextPage = false, endCursor: string | null = null) {
  return {
    defaultBranchRef: { target: { history: { pageInfo: { hasNextPage, endCursor }, nodes } } }
  };
}

describe('CommitsLookup', () => {
  const lookup = new CommitsLookup({ id: 'R_1', factory });

  describe('toString', () => {
    it('should walk the default branch commit history', () => {
      const query = lookup.toString();
      expect(query).toContain('... on Repository');
      expect(query).toContain('defaultBranchRef');
      expect(query).toContain('... on Commit');
      expect(query).toContain('history(first: 100)');
    });

    it('should widen the since/until window by one second on each side', () => {
      const query = new CommitsLookup({
        id: 'R_1',
        factory,
        since: new Date('2020-01-01T00:00:10Z'),
        until: new Date('2020-01-02T00:00:10Z')
      }).toString();
      expect(query).toContain('since: "2020-01-01T00:00:11.000Z"');
      expect(query).toContain('until: "2020-01-02T00:00:09.000Z"');
    });
  });

  describe('parse', () => {
    it('should extract commits from the default branch history', () => {
      const res = lookup.parse(history([{ id: 'C_1', committedDate: '2020-01-01T00:00:00Z' }], false, 'cur'));
      expect(res.data).toEqual([{ id: 'C_1', committed_date: new Date('2020-01-01T00:00:00Z') }]);
      expect(res.params.cursor).toBe('cur');
    });

    it('should report the resume window from the first and last parsed commits', () => {
      const res = lookup.parse(
        history([
          { id: 'C_1', committedDate: '2020-01-01T00:00:00Z' },
          { id: 'C_2', committedDate: '2020-01-05T00:00:00Z' }
        ])
      );
      expect(res.params.until).toEqual(new Date('2020-01-01T00:00:00Z'));
      expect(res.params.since).toEqual(new Date('2020-01-05T00:00:00Z'));
    });

    it('should yield an empty page when the repository has no default branch', () => {
      const res = lookup.parse({});
      expect(res.data).toEqual([]);
      expect(res.next).toBeUndefined();
    });
  });
});
