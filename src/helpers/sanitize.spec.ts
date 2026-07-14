import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import sanitize, { zodSanitize } from './sanitize';

describe('sanitize', () => {
  it('should remove null values at root', () => {
    expect(sanitize({ a: null, b: '', c: 'c', d: 'd' })).toEqual({ b: '', c: 'c', d: 'd' });
  });

  it('should remove undefined values at root', () => {
    expect(sanitize({ a: undefined, b: '', c: 'c', d: 'd' })).toEqual({ b: '', c: 'c', d: 'd' });
  });

  it('should remove null values in nested objects', () => {
    expect(sanitize({ a: { b: null, c: '', d: 'd' } })).toEqual({ a: { c: '', d: 'd' } });
  });

  it('should remove undefined values in nested objects', () => {
    expect(sanitize({ a: { b: undefined, c: '', d: 'd' } })).toEqual({ a: { c: '', d: 'd' } });
  });

  it('should remove empty arrays', () => {
    expect(sanitize({ a: { b: [], c: '', d: 'd' } })).toEqual({ a: { c: '', d: 'd' } });
  });

  it('should remove empty objects', () => {
    expect(sanitize({ a: { b: {}, c: '', d: 'd' } })).toEqual({ a: { c: '', d: 'd' } });
  });

  it('should remove objects that become empty after nested values are removed', () => {
    expect(
      sanitize({
        a: { b: null },
        c: { d: { e: undefined } },
        f: 'keep'
      })
    ).toEqual({ f: 'keep' });
  });

  it('should keep array entries when applyOnArrays is false', () => {
    expect(sanitize({ a: [null, '', { b: null, c: 'c' }] })).toEqual({
      a: [null, '', { c: 'c' }]
    });
  });

  it('should remove objects that become empty inside arrays when enabled', () => {
    expect(sanitize({ a: [{ b: null }, { c: 'keep' }, { d: { e: null } }] }, undefined, true)).toEqual({
      a: [{ c: 'keep' }]
    });
  });

  it('should sanitize nested arrays recursively when enabled', () => {
    expect(sanitize({ a: [[null, {}, { b: null }, { c: 'keep' }], []] }, undefined, true)).toEqual({
      a: [[{ c: 'keep' }]]
    });
  });

  it('should sanitize root arrays when enabled', () => {
    expect(sanitize([{}, { a: null }, { a: 'keep' }], undefined, true)).toEqual([{ a: 'keep' }]);
  });

  it('should preserve non-empty falsy values', () => {
    const result = sanitize({ zero: 0, false: false, empty: '', nan: Number.NaN });

    expect(result).toMatchObject({ zero: 0, false: false, empty: '' });
    expect(result.nan).toBeNaN();
  });

  it('should preserve non-plain objects', () => {
    const date = new Date('2026-01-01T00:00:00.000Z');
    const map = new Map([['key', null]]);

    expect(sanitize({ date, map })).toEqual({ date, map });
  });

  it('should remove values in arrays when applyOnArrays is true', () => {
    expect(sanitize({ a: [null, undefined, '', [], {}, { b: null, c: 'c' }] }, undefined, true)).toEqual({
      a: ['', { c: 'c' }]
    });
  });

  it('should use custom criteria recursively', () => {
    const criteria = (v: unknown) => v === '' || v === null || v === undefined;

    expect(sanitize({ a: { b: '', c: 'c' }, d: '' }, criteria)).toEqual({
      a: { c: 'c' }
    });
  });

  it('should apply custom criteria on arrays when enabled', () => {
    const criteria = (v: unknown) => v === '' || v === null || v === undefined;

    expect(sanitize({ a: ['', 'x', { b: '' }] }, criteria, true)).toEqual({
      a: ['x', {}]
    });
  });

  it('should not mutate input data', () => {
    const input = {
      a: {
        b: null,
        c: 'c'
      }
    };
    const snapshot = structuredClone(input);

    sanitize(input);

    expect(input).toEqual(snapshot);
  });
});

describe('zodSanitize', () => {
  it('should sanitize data before schema parsing', () => {
    const schema = zodSanitize(
      z.object({
        a: z.string().optional(),
        b: z.object({
          c: z.string().optional()
        })
      })
    );

    expect(schema.parse({ a: null, b: { c: 'c', d: null } })).toEqual({
      b: { c: 'c' }
    });
  });

  it('should support array sanitization before schema parsing', () => {
    const schema = z.preprocess(
      (data) => sanitize(data as Record<string, unknown>, undefined, true),
      z.object({
        a: z.array(
          z.object({
            b: z.string().optional()
          })
        )
      })
    );

    expect(schema.parse({ a: [{ b: null }, { b: 'ok' }] })).toEqual({
      a: [{ b: 'ok' }]
    });
  });
});
