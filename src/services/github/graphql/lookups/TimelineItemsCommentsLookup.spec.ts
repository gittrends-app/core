import { describe, expect, it } from 'vitest';
import { Fragment, FragmentFactory } from '../fragments/Fragment';
import { TimelineItemsCommentsLookup } from './TimelineItemsCommentsLookup';

class FakeFragment implements Fragment {
  readonly alias = 'TimelineItemCommentsFragment';
  readonly fragments: Fragment[] = [];
  toString(): string {
    return 'fragment TimelineItemCommentsFragment on Node { id }';
  }
  parse(data: any): any {
    return { parsed: data.id };
  }
}

const factory: FragmentFactory = { create: () => new FakeFragment() as any };

describe('TimelineItemsCommentsLookup', () => {
  const lookup = new TimelineItemsCommentsLookup({ id: 'I_1', factory });

  it('should select the node and spread the timeline comments fragment', () => {
    const query = lookup.toString();
    expect(query).toContain('node(id: "I_1")');
    expect(query).toContain('...TimelineItemCommentsFragment');
  });

  it('should parse the aliased node payload through the fragment without a continuation', () => {
    const res = lookup.parse({ [lookup.alias]: { id: 'X_1' } });
    expect(res.data).toEqual({ parsed: 'X_1' });
    expect(res.next).toBeUndefined();
  });

  it('should also accept the unaliased node payload', () => {
    const res = lookup.parse({ id: 'X_2' });
    expect(res.data).toEqual({ parsed: 'X_2' });
  });

  it('should throw when the node payload is missing', () => {
    expect(() => lookup.parse(null)).toThrow();
  });
});
