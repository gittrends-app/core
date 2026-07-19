import { describe, expect, it } from 'vitest';
import { Fragment, FragmentFactory } from '../fragments/Fragment';
import { ReactionsLookup } from './ReactionsLookup';

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
    __typename: 'Reaction',
    id: 'RE_1',
    databaseId: 42,
    content: 'THUMBS_UP',
    createdAt: '2020-01-01T00:00:00Z',
    user: { id: 'U_1' },
    reactable: { id: 'I_1', __typename: 'Issue' },
    ...overrides
  };
}

function page(nodes: any[], hasNextPage = false, endCursor: string | null = null) {
  return { reactions: { pageInfo: { hasNextPage, endCursor }, nodes } };
}

describe('ReactionsLookup', () => {
  const lookup = new ReactionsLookup({ id: 'I_1', factory });

  it('should select the reactions connection on a Reactable node', () => {
    const query = lookup.toString();
    expect(query).toContain('... on Reactable');
    expect(query).toContain('reactions(first: 100)');
  });

  it('should normalize the GitHub reaction content enum to snake_case', () => {
    const res = lookup.parse(page([node()]));
    expect(res.data[0]).toMatchObject({
      __typename: 'Reaction',
      id: 'RE_1',
      database_id: 42,
      content: 'thumbs_up',
      created_at: new Date('2020-01-01T00:00:00Z'),
      user: { id: 'U_1', __typename: 'User' },
      reactable: { id: 'I_1', __typename: 'Issue' }
    });
  });

  it('should keep the reaction when the user is absent', () => {
    const res = lookup.parse(page([node({ user: null })]));
    expect(res.data[0].user).toBeUndefined();
  });
});
