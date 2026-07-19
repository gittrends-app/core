import { describe, expect, it } from 'vitest';
import { adjustPage, toPage } from './pagination';

// Minimal fake lookup result matching the shape expected by toPage
function fakeRes<T>(data: T[], cursor?: string, hasNext = true) {
  return {
    data,
    next: hasNext ? {} : undefined,
    params: { cursor }
  };
}

describe('toPage', () => {
  it('sets has_more=true and includes cursor when next exists', () => {
    const res = fakeRes(['a', 'b'], 'cur-1', true);
    const page = toPage(res);
    expect(page.metadata.has_more).toBe(true);
    expect(page.metadata.cursor).toBe('cur-1');
    expect(page.metadata.per_page).toBe(2);
  });

  it('sets has_more=false and omits cursor on the final page', () => {
    const res = fakeRes(['a'], 'cur-end', false);
    const page = toPage(res);
    expect(page.metadata.has_more).toBe(false);
    expect(page.metadata.cursor).toBeUndefined();
    expect(page.metadata.per_page).toBe(1);
  });

  it('omits cursor when next exists but params.cursor is undefined', () => {
    const res = fakeRes(['a'], undefined, true);
    const page = toPage(res);
    expect(page.metadata.has_more).toBe(true);
    expect(page.metadata.cursor).toBeUndefined();
  });

  it('mirrors data array unchanged', () => {
    const data = ['x', 'y', 'z'];
    const page = toPage(fakeRes(data, 'c', false));
    expect(page.data).toBe(data);
  });

  it('merges extra fields into metadata', () => {
    const since = new Date('2024-01-01');
    const until = new Date('2024-12-31');
    const page = toPage(fakeRes([1, 2], 'c', true), { since, until });
    expect(page.metadata.since).toBe(since);
    expect(page.metadata.until).toBe(until);
    expect(page.metadata.has_more).toBe(true);
    expect(page.metadata.per_page).toBe(2);
  });

  it('extra fields do not override has_more or per_page', () => {
    // Even if extra accidentally contains has_more/per_page, toPage's own values win
    // (they come after the spread in the implementation)
    const page = toPage(fakeRes(['a'], 'c', false), { per_page: 99, has_more: true } as any);
    expect(page.metadata.has_more).toBe(false);
    expect(page.metadata.per_page).toBe(1);
  });
});

describe('adjustPage', () => {
  it('strips cursor when has_more is false', () => {
    const meta = { has_more: true, cursor: 'old-cursor', per_page: 5 };
    const result = adjustPage(meta, { hasMore: false });
    expect(result.has_more).toBe(false);
    expect(result.cursor).toBeUndefined();
    expect(result.per_page).toBe(5);
  });

  it('keeps cursor when has_more is true', () => {
    const meta = { has_more: true, cursor: 'next', per_page: 3 };
    const result = adjustPage(meta, { hasMore: true });
    expect(result.has_more).toBe(true);
    expect(result.cursor).toBe('next');
  });

  it('overrides per_page when provided', () => {
    const meta = { has_more: true, cursor: 'c', per_page: 10 };
    const result = adjustPage(meta, { hasMore: true, perPage: 4 });
    expect(result.per_page).toBe(4);
  });

  it('preserves per_page when perPage argument is omitted', () => {
    const meta = { has_more: false, per_page: 7 };
    const result = adjustPage(meta, { hasMore: false });
    expect(result.per_page).toBe(7);
  });

  it('preserves extra metadata fields', () => {
    const meta = { has_more: true, cursor: 'c', per_page: 2, since: new Date('2024-01-01') } as any;
    const result = adjustPage(meta, { hasMore: false });
    expect(result.since).toEqual(new Date('2024-01-01'));
    expect(result.cursor).toBeUndefined();
  });

  it('does not add cursor when metadata has no cursor and has_more is true', () => {
    const meta = { has_more: false, per_page: 1 };
    const result = adjustPage(meta, { hasMore: true });
    expect(result.cursor).toBeUndefined();
  });
});
