import { describe, expect, it } from 'vitest';
import { FragmentFactory } from '../fragments/Fragment';
import { SearchLookup } from './SearchLookup';

const fragment = {
  alias: 'RepositoryFragment',
  fragments: [],
  parse: (data: unknown) => data,
  toString: () => ''
};

const factory: FragmentFactory = {
  create: <T>() => fragment as unknown as T
};

function lookup(limit = 3) {
  return new SearchLookup({ factory, limit, per_page: 100 });
}

function response(nodes: unknown[], hasNextPage: boolean, endCursor: string | null) {
  return {
    search: {
      nodes,
      pageInfo: { hasNextPage, endCursor }
    }
  };
}

describe('SearchLookup', () => {
  it('keeps the receiver immutable while threading remaining limit to next', () => {
    const current = lookup();
    const query = current.toString();

    const parsed = current.parse(response([{ id: 'one' }, { id: 'two' }], true, 'cursor-1'));

    expect(current.params.limit).toBe(3);
    expect(current.toString()).toBe(query);
    expect(parsed.params).toMatchObject({ limit: 1, cursor: 'cursor-1' });
    expect(parsed.next?.params).toMatchObject({ limit: 1, cursor: 'cursor-1' });
  });

  it('does not create a continuation when the requested limit is satisfied', () => {
    const current = lookup(2);

    const parsed = current.parse(response([{ id: 'one' }, { id: 'two' }], true, 'cursor-1'));

    expect(parsed.next).toBeUndefined();
    expect(parsed.params.limit).toBe(0);
    expect(current.params.limit).toBe(2);
  });

  it('does not create a continuation on the final remote page', () => {
    const parsed = lookup().parse(response([{ id: 'one' }], false, 'cursor-final'));

    expect(parsed.next).toBeUndefined();
    expect(parsed.params).toMatchObject({ limit: 2, cursor: 'cursor-final' });
  });
});
