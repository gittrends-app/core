import { describe, expect, it, vi } from 'vitest';

import { BufferedService } from './BufferedService';
import type { Service, Iterable as ServiceIterable } from './Service';

type Page<T> = {
  data: T[];
  metadata: {
    has_more: boolean;
    cursor?: string;
    per_page?: number;
  };
};

function createServiceMock() {
  return {
    search: vi.fn(),
    user: vi.fn(),
    repository: vi.fn(),
    resources: vi.fn()
  };
}

function createIterable<T>(pages: Page<T>[]): ServiceIterable<T> {
  return {
    async *[Symbol.asyncIterator]() {
      yield* pages;
    }
  };
}

async function collect<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const result: T[] = [];

  for await (const item of iterable) {
    result.push(item);
  }

  return result;
}

describe('BufferedService', () => {
  it.each([0, -1, 0.5, Number.NaN, Infinity])('rejects invalid buffer sizes: %s', (bufferSize) => {
    const service = createServiceMock();

    expect(() => new BufferedService(service as unknown as Service, bufferSize)).toThrow(
      'Buffer size must be at least 1'
    );
  });

  it('buffers search pages by iteration count', async () => {
    const service = createServiceMock();
    const pages: Page<string>[] = [
      { data: ['one'], metadata: { has_more: true, cursor: 'cursor-1', per_page: 10 } },
      { data: ['two'], metadata: { has_more: true, cursor: 'cursor-2', per_page: 10 } },
      { data: ['three'], metadata: { has_more: false, cursor: 'cursor-3', per_page: 10 } }
    ];
    const buffered = new BufferedService(service as unknown as Service, 2);

    service.search.mockReturnValue(createIterable(pages));

    await expect(collect(buffered.search(3))).resolves.toEqual([
      {
        data: ['one', 'two'],
        metadata: { has_more: true, cursor: 'cursor-2', per_page: 20 }
      },
      {
        data: ['three'],
        metadata: { has_more: false, cursor: 'cursor-3', per_page: 10 }
      }
    ]);
    expect(service.search).toHaveBeenCalledWith(3, undefined);
  });

  it('flushes every page when buffer size is one', async () => {
    const service = createServiceMock();
    const pages: Page<string>[] = [
      { data: ['one'], metadata: { has_more: true, per_page: 100 } },
      { data: ['two'], metadata: { has_more: false, per_page: 100 } }
    ];
    const buffered = new BufferedService(service as unknown as Service, 1);

    service.search.mockReturnValue(createIterable(pages));

    await expect(collect(buffered.search(2))).resolves.toEqual([
      { data: ['one'], metadata: { has_more: true, per_page: 100 } },
      { data: ['two'], metadata: { has_more: false, per_page: 100 } }
    ]);
  });

  it('flushes a partial search buffer when the source ends', async () => {
    const service = createServiceMock();
    const pages: Page<string>[] = [
      { data: ['one'], metadata: { has_more: true, per_page: 2 } },
      { data: ['two'], metadata: { has_more: true, per_page: 2 } },
      { data: ['three'], metadata: { has_more: true, per_page: 2 } }
    ];
    const buffered = new BufferedService(service as unknown as Service, 2);

    service.search.mockReturnValue(createIterable(pages));

    await expect(collect(buffered.search(3))).resolves.toEqual([
      { data: ['one', 'two'], metadata: { has_more: true, per_page: 4 } },
      { data: ['three'], metadata: { has_more: true, per_page: 2 } }
    ]);
  });

  it('buffers resource pages and preserves resource metadata', async () => {
    const service = createServiceMock();
    const opts = { repository: 'octocat/hello-world', per_page: 10 };
    const pages: Page<string>[] = [
      { data: ['one'], metadata: { has_more: true, cursor: 'cursor-1', per_page: 10 } },
      { data: ['two'], metadata: { has_more: false, cursor: 'cursor-2', per_page: 10 } }
    ];
    const buffered = new BufferedService(service as unknown as Service, 3);

    service.resources.mockReturnValue(createIterable(pages));

    await expect(collect(buffered.resources('issues', opts))).resolves.toEqual([
      {
        data: ['one', 'two'],
        metadata: { has_more: false, cursor: 'cursor-2', per_page: 20 }
      }
    ]);
    expect(service.resources).toHaveBeenCalledWith('issues', opts);
  });

  it('flushes a partial resource buffer when the source ends', async () => {
    const service = createServiceMock();
    const pages: Page<string>[] = [
      { data: ['one'], metadata: { has_more: true, per_page: 2 } },
      { data: ['two'], metadata: { has_more: true, per_page: 2 } },
      { data: ['three'], metadata: { has_more: true, per_page: 2 } }
    ];
    const buffered = new BufferedService(service as unknown as Service, 2);

    service.resources.mockReturnValue(createIterable(pages));

    await expect(collect(buffered.resources('issues', { repository: 'octocat/hello-world' }))).resolves.toEqual([
      { data: ['one', 'two'], metadata: { has_more: true, per_page: 4 } },
      { data: ['three'], metadata: { has_more: true, per_page: 2 } }
    ]);
  });

  it('propagates source errors while iterating', async () => {
    const service = createServiceMock();
    const error = new Error('source failed');
    const source: ServiceIterable<string> = {
      async *[Symbol.asyncIterator]() {
        yield { data: ['before-error'], metadata: { has_more: true } };
        throw error;
      }
    };
    const buffered = new BufferedService(service as unknown as Service, 2);

    service.search.mockReturnValue(source);

    await expect(collect(buffered.search(2))).rejects.toBe(error);
  });

  it('passes non-iterator methods through unchanged', () => {
    const service = createServiceMock();
    const buffered = new BufferedService(service as unknown as Service, 1);
    const userResult = Promise.resolve(null);
    const repositoryResult = Promise.resolve(null);

    service.user.mockReturnValue(userResult);
    service.repository.mockReturnValue(repositoryResult);

    expect(buffered.user('user-1')).toBe(userResult);
    expect(buffered.repository('owner', 'repository')).toBe(repositoryResult);
  });
});
