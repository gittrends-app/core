import { describe, expect, it } from 'vitest';
import { Fragment, FragmentFactory } from '../fragments/Fragment';
import { UserLookup } from './UserLookup';

class FakeFragment implements Fragment {
  readonly alias = 'ActorFragment';
  readonly fragments: Fragment[] = [];
  toString(): string {
    return 'fragment ActorFragment on Actor { id }';
  }
  parse(data: any): any {
    return { parsed: data.id };
  }
}

const factory: FragmentFactory = { create: () => new FakeFragment() as any };

describe('UserLookup', () => {
  it('should look up the actor by node id by default', () => {
    const query = new UserLookup({ id: 'U_1', factory }).toString();
    expect(query).toContain('node(id: "U_1")');
    expect(query).toContain('...ActorFragment');
  });

  it('should look up the actor by login when byLogin is set', () => {
    const query = new UserLookup({ id: 'octocat', factory, byLogin: true }).toString();
    expect(query).toContain('repositoryOwner(login: "octocat")');
  });

  it('should resolve the viewer and alias it "me" when the id is empty', () => {
    const lookup = new UserLookup({ id: '', factory });
    expect(lookup.alias).toBe('me');
    expect(lookup.toString()).toContain('me:viewer');
  });

  it('should parse the aliased actor payload through the fragment', () => {
    const lookup = new UserLookup({ id: 'U_1', factory });
    const res = lookup.parse({ [lookup.alias]: { id: 'U_1' } });
    expect(res.data).toEqual({ parsed: 'U_1' });
  });
});
