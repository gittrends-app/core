import { GraphqlResponseError } from '@octokit/graphql';
import { describe, expect, it, vi } from 'vitest';
import type { GithubClient } from '../GithubClient';
import { QueryLookup } from './lookups/Lookup';
import { QueryRunner } from './QueryRunner';

class TestLookup extends QueryLookup<{ value: string }, { limit: number }> {
  constructor(params: { id: string; factory: never; per_page?: number; limit: number; cursor?: string }) {
    super(params);
  }

  get fragments() {
    return [];
  }

  toString() {
    return `${this.alias}:test(first: ${this.params.per_page || 1}) { value }`;
  }

  parse(data: { value: string }) {
    return { data, params: this.params };
  }
}

function createLookup(per_page = 4, id = 'test') {
  return new TestLookup({ id, factory: undefined as never, limit: 1, per_page });
}

function createRunner(graphql: ReturnType<typeof vi.fn>) {
  return QueryRunner.create({ graphql } as unknown as GithubClient);
}

describe('QueryRunner', () => {
  it('preserves network errors without a response object', async () => {
    const error = new Error('network failed');
    const graphql = vi.fn().mockRejectedValue(error);

    await expect(createRunner(graphql).fetch(createLookup())).rejects.toMatchObject({
      message: 'network failed',
      lookups: [{ alias: 'test' }]
    });
  });

  it('parses tolerated partial GraphQL responses without assuming error fields exist', async () => {
    const error = Object.assign(Object.create(GraphqlResponseError.prototype), {
      data: { test: { value: 'missing' } },
      response: { status: 200, errors: [{ type: 'NOT_FOUND' }] }
    });
    const graphql = vi.fn().mockRejectedValue(error);

    await expect(createRunner(graphql).fetch(createLookup())).resolves.toEqual({
      data: { value: 'missing' },
      params: expect.objectContaining({ id: 'test' })
    });
  });

  it('retries transient failures with cloned lookup state', async () => {
    const graphql = vi
      .fn()
      .mockRejectedValueOnce(Object.assign(new Error('server failed'), { status: 502 }))
      .mockResolvedValue({ test: { value: 'ok' } });
    const lookup = createLookup(4);

    await expect(createRunner(graphql).fetch(lookup)).resolves.toMatchObject({ data: { value: 'ok' } });
    expect(graphql).toHaveBeenCalledTimes(2);
    expect(graphql.mock.calls[0][0]).toContain('first: 4');
    expect(graphql.mock.calls[1][0]).toContain('first: 2');
    expect(lookup.params.per_page).toBe(4);
  });

  it('does not retry non-transient failures', async () => {
    const graphql = vi.fn().mockRejectedValue(Object.assign(new Error('forbidden'), { status: 403 }));

    await expect(createRunner(graphql).fetch(createLookup())).rejects.toMatchObject({ message: 'forbidden' });
    expect(graphql).toHaveBeenCalledTimes(1);
  });

  it('splits recoverable batches and applies the fallback only to failed lookups', async () => {
    const graphql = vi.fn().mockImplementation((query: string) => {
      if (query.includes('testone:test') && !query.includes('testtwo:test')) {
        return Promise.resolve({ testone: { value: 'ok' } });
      }
      return Promise.reject(Object.assign(new Error('server failed'), { status: 502 }));
    });
    const lookups = [createLookup(1, 'test-one'), createLookup(1, 'test-two')];

    await expect(
      createRunner(graphql).fetchBatchWithFallback(lookups, (lookup) => ({
        data: { value: lookup.alias },
        params: lookup.params
      }))
    ).resolves.toEqual([
      { data: { value: 'ok' }, params: expect.objectContaining({ id: 'test-one' }) },
      { data: { value: 'testtwo' }, params: expect.objectContaining({ id: 'test-two' }) }
    ]);
    expect(graphql).toHaveBeenCalledTimes(3);
  });

  it('preserves non-recoverable batch errors', async () => {
    const error = Object.assign(new Error('forbidden'), { status: 403 });
    const graphql = vi.fn().mockRejectedValue(error);

    await expect(
      createRunner(graphql).fetchBatchWithFallback([createLookup(1, 'test-one'), createLookup(1, 'test-two')], () => {
        throw new Error('fallback should not run');
      })
    ).rejects.toMatchObject({ message: 'forbidden' });
    expect(graphql).toHaveBeenCalledTimes(1);
  });

  it('restores lookup state when retries are exhausted', async () => {
    const graphql = vi.fn().mockRejectedValue(Object.assign(new Error('server failed'), { status: 500 }));
    const lookup = createLookup(2);

    await expect(createRunner(graphql).fetch(lookup)).rejects.toMatchObject({ message: 'server failed' });
    expect(graphql).toHaveBeenCalledTimes(2);
    expect(lookup.params.per_page).toBe(2);
  });
});
