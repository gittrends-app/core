import { describe, expect, it } from 'vitest';
import { Fragment, FragmentFactory } from '../fragments/Fragment';
import { ConnectionDescriptor, ConnectionLookup } from './ConnectionLookup';

class FakeFragment implements Fragment {
  readonly alias = 'FakeFrag';
  readonly fragments: Fragment[] = [];
  toString(): string {
    return 'fragment FakeFrag on Thing { id }';
  }
  parse(data: any): any {
    return { parsed: data.id };
  }
}

const factory: FragmentFactory = { create: () => new FakeFragment() as any };

class ThingsLookup extends ConnectionLookup<{ parsed: string }> {
  protected get descriptor(): ConnectionDescriptor {
    return {
      field: 'things',
      typeCondition: 'Repository',
      args: ['orderBy: { field: UPDATED_AT direction: ASC }'],
      missingDataError: 'Failed to parse things.'
    };
  }
  protected entriesSelection(): string {
    return `nodes { ...${this.fragments[0].alias} }`;
  }
  protected mapEntry(entry: any) {
    return this.fragments[0].parse(entry);
  }
  get fragments(): Fragment[] {
    return [this.params.factory.create(FakeFragment as any)];
  }
}

function page(nodes: any[], hasNextPage: boolean, endCursor: string | null) {
  return { things: { pageInfo: { hasNextPage, endCursor }, nodes } };
}

describe('ConnectionLookup', () => {
  const lookup = new ThingsLookup({ id: 'R_1', factory, per_page: 2 });

  describe('toString', () => {
    it('should assemble pagination and extra connection args', () => {
      const query = lookup.toString();
      expect(query).toContain('node(id: "R_1")');
      expect(query).toContain('... on Repository');
      expect(query).toContain('things(first: 2, orderBy: { field: UPDATED_AT direction: ASC })');
      expect(query).toContain('pageInfo { hasNextPage endCursor }');
    });

    it('should default per_page to 100 and append the cursor when present', () => {
      const query = new ThingsLookup({ id: 'R_1', factory, cursor: 'abc' }).toString();
      expect(query).toContain('first: 100');
      expect(query).toContain('after: "abc"');
    });

    it('should select the aliased field when the descriptor field is aliased', () => {
      class AliasedLookup extends ThingsLookup {
        protected get descriptor(): ConnectionDescriptor {
          return { ...super.descriptor, field: 'things:refs' };
        }
      }
      expect(new AliasedLookup({ id: 'R_1', factory }).toString()).toContain('things:refs(');
    });
  });

  describe('parse', () => {
    it('should map entries through mapEntry and thread the end cursor', () => {
      const res = lookup.parse(page([{ id: 'a' }, { id: 'b' }], true, 'cur-1'));
      expect(res.data).toEqual([{ parsed: 'a' }, { parsed: 'b' }]);
      expect(res.params.cursor).toBe('cur-1');
      expect(res.next).toBeInstanceOf(ThingsLookup);
      expect(res.next?.params.cursor).toBe('cur-1');
      expect(res.next?.params.per_page).toBe(2);
    });

    it('should not create a continuation on the final page', () => {
      const res = lookup.parse(page([{ id: 'a' }], false, 'cur-2'));
      expect(res.next).toBeUndefined();
      expect(res.params.cursor).toBe('cur-2');
    });

    it('should keep the previous cursor when endCursor is null', () => {
      const withCursor = new ThingsLookup({ id: 'R_1', factory, cursor: 'prev' });
      const res = withCursor.parse(page([], false, null));
      expect(res.params.cursor).toBe('prev');
    });

    it('should not mutate the receiving lookup', () => {
      lookup.parse(page([{ id: 'a' }], true, 'cur-3'));
      expect(lookup.params.cursor).toBeUndefined();
    });

    it('should resolve the aliased response payload', () => {
      const res = lookup.parse({ [lookup.alias]: page([{ id: 'a' }], false, null) });
      expect(res.data).toEqual([{ parsed: 'a' }]);
    });

    it('should throw the declared error when the connection is missing', () => {
      expect(() => lookup.parse({ things: undefined })).toThrowError('Failed to parse things.');
    });
  });
});
