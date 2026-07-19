import { describe, expect, it } from 'vitest';
import { BaseFragmentFactory } from './Fragment';
import { TagFragment } from './TagFragment';

describe('TagFragment', () => {
  it('keeps each GraphQL selection next to its entity mapping', () => {
    const fragment = new TagFragment('TagTest', { factory: new BaseFragmentFactory() });
    const query = fragment.toString();

    expect(query).toContain('fragment TagTest on Tag');
    expect(query).toContain('repository { id }');
    expect(query).toContain('target { id }');
    expect(query).toContain('tagger {');
    expect(query).toContain(`user { ...${fragment.fragments[0].alias} }`);
  });

  it('maps the selected fields into the Tag entity', () => {
    const fragment = new TagFragment('TagTest', { factory: new BaseFragmentFactory() });
    const result = fragment.parse({
      __typename: 'Tag',
      id: 'tag-id',
      message: 'a message',
      name: 'v1.0.0',
      oid: 'abc123',
      repository: { id: 'repository-id' },
      tagger: { date: '2026-07-19T00:00:00Z', email: 'a@b.com', name: 'Tagger', user: null },
      target: { id: 'target-id' }
    } as never);

    expect(result).toMatchObject({
      __typename: 'Tag',
      id: 'tag-id',
      name: 'v1.0.0',
      oid: 'abc123',
      repository: 'repository-id',
      target: 'target-id'
    });
  });
});
