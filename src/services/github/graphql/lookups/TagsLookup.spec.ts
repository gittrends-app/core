import { describe, expect, it } from 'vitest';
import { Fragment, FragmentFactory } from '../fragments/Fragment';
import { TagsLookup } from './TagsLookup';

class FakeFragment implements Fragment {
  readonly fragments: Fragment[] = [];
  constructor(readonly alias: string) {}
  toString(): string {
    return `fragment ${this.alias} on Node { id }`;
  }
  parse(data: any): any {
    return { parsed: data };
  }
}

const factory: FragmentFactory = { create: (Ref: any) => new FakeFragment(Ref.name) as any };

function page(nodes: any[], hasNextPage = false, endCursor: string | null = null) {
  return { tags: { pageInfo: { hasNextPage, endCursor }, nodes } };
}

describe('TagsLookup', () => {
  const lookup = new TagsLookup({ id: 'R_1', factory });

  it('should select the tags refs connection', () => {
    const query = lookup.toString();
    expect(query).toContain('tags:refs(first: 100, refPrefix: "refs/tags/")');
    expect(query).toContain('target {');
  });

  it('should resolve the connection under the aliased tags field', () => {
    const res = lookup.parse(page([{ id: 'T_1', name: 'v1', target: { __typename: 'Commit', id: 'C_1' } }]));
    expect(res.data).toHaveLength(1);
  });

  it('should parse the annotated tag target when the target is itself a Tag', () => {
    const entry = { id: 'ref', name: 'v1', target: { __typename: 'Tag', id: 'TAG_1' } };
    const res = lookup.parse(page([entry]));
    // annotated tags map from the target object, tagged as a Tag
    expect(res.data[0]).toEqual({ parsed: { __typename: 'Tag', id: 'TAG_1' } });
  });

  it('should parse the lightweight tag from the ref node when the target is a Commit', () => {
    const entry = { id: 'ref', name: 'v1', target: { __typename: 'Commit', id: 'C_1' } };
    const res = lookup.parse(page([entry]));
    expect(res.data[0]).toEqual({ parsed: { ...entry, __typename: 'Tag' } });
  });

  it('should throw the declared error when the connection is missing', () => {
    expect(() => lookup.parse({ tags: undefined })).toThrowError('Failed to parse tags.');
  });
});
