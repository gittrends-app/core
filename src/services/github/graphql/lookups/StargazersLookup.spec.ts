import { describe, expect, it } from 'vitest';
import { Fragment, FragmentFactory } from '../fragments/Fragment';
import { StargazersLookup } from './StargazersLookup';

class FakeActorFragment implements Fragment {
  readonly alias = 'ActorFragment';
  readonly fragments: Fragment[] = [];
  toString(): string {
    return 'fragment ActorFragment on Actor { id }';
  }
  parse(data: any): any {
    return { id: data.id, __typename: 'User' };
  }
}

const factory: FragmentFactory = { create: () => new FakeActorFragment() as any };

function page(edges: any[], hasNextPage = false, endCursor: string | null = null) {
  return { stargazers: { pageInfo: { hasNextPage, endCursor }, edges } };
}

describe('StargazersLookup', () => {
  const lookup = new StargazersLookup({ id: 'R_1', factory });

  it('should select the stargazers connection ordered by starred date with edges', () => {
    const query = lookup.toString();
    expect(query).toContain('stargazers(first: 100, orderBy: { field: STARRED_AT, direction: ASC})');
    expect(query).toContain('edges {');
    expect(query).toContain('starredAt');
  });

  it('should read entries from edges and carry the starred date and repository', () => {
    const res = lookup.parse(page([{ starredAt: '2020-01-01T00:00:00Z', node: { id: 'U_1' } }]));
    expect(res.data).toEqual([
      {
        __typename: 'Stargazer',
        starred_at: new Date('2020-01-01T00:00:00Z'),
        user: { id: 'U_1', __typename: 'User' },
        repository: 'R_1'
      }
    ]);
  });

  it('should tolerate a connection with no edges', () => {
    const res = lookup.parse({ stargazers: { pageInfo: { hasNextPage: false, endCursor: null } } });
    expect(res.data).toEqual([]);
  });
});
