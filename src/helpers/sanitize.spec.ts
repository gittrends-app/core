import { describe, expect, it } from 'vitest';

import sanitize from './sanitize';

describe('sanitize', () => {
  it('should remove null values at root', () => {
    expect(sanitize({ a: null, b: '', c: 'c', d: 'd' })).toEqual({ b: '', c: 'c', d: 'd' });
  });

  it('should remove null values in nested objects', () => {
    expect(sanitize({ a: { b: null, c: '', d: 'd' } })).toEqual({ a: { c: '', d: 'd' } });
  });

  it('should remove empty arrays', () => {
    expect(sanitize({ a: { b: [], c: '', d: 'd' } })).toEqual({ a: { c: '', d: 'd' } });
  });

  it('should remove empty objects', () => {
    expect(sanitize({ a: { b: {}, c: '', d: 'd' } })).toEqual({ a: { c: '', d: 'd' } });
  });
});
