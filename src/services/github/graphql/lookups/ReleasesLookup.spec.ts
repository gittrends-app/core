import { describe, expect, it } from 'vitest';
import { Fragment, FragmentFactory } from '../fragments/Fragment';
import { ReleasesLookup } from './ReleasesLookup';

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

function node(overrides: Partial<Record<string, any>> = {}) {
  return {
    __typename: 'Release',
    author: { id: 'U_1' },
    createdAt: '2020-01-01T00:00:00Z',
    databaseId: 7,
    id: 'RE_1',
    immutable: false,
    isDraft: false,
    isPrerelease: true,
    name: 'v1.0',
    publishedAt: '2020-01-02T00:00:00Z',
    reactions: { totalCount: 3 },
    repository: { id: 'R_1' },
    tagCommit: { id: 'C_1' },
    tagName: 'v1.0.0',
    updatedAt: '2020-01-03T00:00:00Z',
    ...overrides
  };
}

function page(nodes: any[], hasNextPage = false, endCursor: string | null = null) {
  return { releases: { pageInfo: { hasNextPage, endCursor }, nodes } };
}

describe('ReleasesLookup', () => {
  const lookup = new ReleasesLookup({ id: 'R_1', factory });

  it('should select the releases connection ordered by creation date', () => {
    const query = lookup.toString();
    expect(query).toContain('releases(first: 100, orderBy: { field: CREATED_AT direction: ASC })');
  });

  it('should map a release node to the Release entity', () => {
    const res = lookup.parse(page([node()]));
    expect(res.data[0]).toMatchObject({
      __typename: 'Release',
      author: { id: 'U_1', __typename: 'User' },
      database_id: 7,
      id: 'RE_1',
      is_prerelease: true,
      name: 'v1.0',
      reactions_count: 3,
      repository: 'R_1',
      tag_commit: 'C_1',
      tag_name: 'v1.0.0'
    });
  });

  it('should throw the declared error when the connection is missing', () => {
    expect(() => lookup.parse({ releases: undefined })).toThrowError('Failed to parse tags.');
  });
});
