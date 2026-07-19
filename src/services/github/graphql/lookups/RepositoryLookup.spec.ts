import { describe, expect, it } from 'vitest';
import { Fragment, FragmentFactory } from '../fragments/Fragment';
import { RepositoryLookup } from './RepositoryLookup';

class FakeFragment implements Fragment {
  readonly alias = 'RepositoryFragment';
  readonly fragments: Fragment[] = [];
  toString(): string {
    return 'fragment RepositoryFragment on Repository { id }';
  }
  parse(data: any): any {
    return { parsed: data.id };
  }
}

const factory: FragmentFactory = { create: () => new FakeFragment() as any };

describe('RepositoryLookup', () => {
  it('should look up the repository by node id by default', () => {
    const query = new RepositoryLookup({ id: 'R_1', factory }).toString();
    expect(query).toContain('node(id: "R_1")');
    expect(query).toContain('...RepositoryFragment');
  });

  it('should look up the repository by owner and name when byName is set', () => {
    const query = new RepositoryLookup({ id: 'facebook/react', factory, byName: true }).toString();
    expect(query).toContain('repository(owner: "facebook", name: "react")');
  });

  it('should parse the aliased repository payload through the fragment', () => {
    const lookup = new RepositoryLookup({ id: 'R_1', factory });
    const res = lookup.parse({ [lookup.alias]: { id: 'R_1' } });
    expect(res.data).toEqual({ parsed: 'R_1' });
  });

  it('should yield null when the response payload is empty', () => {
    const res = new RepositoryLookup({ id: 'R_1', factory }).parse(null);
    expect(res.data).toBeNull();
  });
});
