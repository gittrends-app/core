import { describe, expect, it } from 'vitest';
import { Fragment, FragmentFactory } from '../fragments/Fragment';
import { WatchersLookup } from './WatchersLookup';

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

function page(nodes: any[], hasNextPage = false, endCursor: string | null = null) {
  return { watchers: { pageInfo: { hasNextPage, endCursor }, nodes } };
}

describe('WatchersLookup', () => {
  const lookup = new WatchersLookup({ id: 'R_1', factory });

  it('should select the repository watchers connection', () => {
    const query = lookup.toString();
    expect(query).toContain('... on Repository');
    expect(query).toContain('watchers(first: 100)');
  });

  it('should wrap each watcher as a Watcher entity bound to the repository', () => {
    const res = lookup.parse(page([{ id: 'U_1' }]));
    expect(res.data).toEqual([{ __typename: 'Watcher', user: { id: 'U_1', __typename: 'User' }, repository: 'R_1' }]);
  });
});
