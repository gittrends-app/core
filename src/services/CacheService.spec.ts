import { describe, expect, it, vi } from 'vitest';

import type { Cache } from './CacheService';
import { CacheService } from './CacheService';
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

function createCacheMock() {
  return {
    get: vi.fn(async (_key: string) => null as unknown),
    set: vi.fn(async (_key: string, _value: unknown) => undefined),
    remove: vi.fn(async (_key: string) => undefined),
    clear: vi.fn(async () => undefined)
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

function createCacheService() {
  const service = createServiceMock();
  const cache = createCacheMock();

  return {
    service,
    cache,
    cachedService: new CacheService(service as unknown as Service, cache as unknown as Cache)
  };
}

describe('CacheService', () => {
  describe('user', () => {
    it('returns a cached scalar user without calling the service', async () => {
      const { cache, service, cachedService } = createCacheService();
      const cachedUser = { id: 'user-1' };
      const opts = { byLogin: true };

      cache.get.mockResolvedValue(cachedUser);

      await expect(cachedService.user('user-1', opts)).resolves.toBe(cachedUser);
      expect(cache.get).toHaveBeenCalledWith('user:user-1');
      expect(service.user).not.toHaveBeenCalled();
    });

    it('fetches missing users, caches non-null results, and preserves array order', async () => {
      const { cache, service, cachedService } = createCacheService();
      const fetchedUser = { id: 'user-2' };
      const opts = { byLogin: false };

      cache.get.mockImplementation(async (key: string) => (key === 'user:user-1' ? { id: 'user-1' } : null));
      service.user.mockImplementation(async (id: string) => (id === 'user-2' ? fetchedUser : null));

      await expect(cachedService.user(['user-1', 'user-2', 'missing'], opts)).resolves.toEqual([
        { id: 'user-1' },
        fetchedUser,
        null
      ]);
      expect(service.user).toHaveBeenCalledTimes(2);
      expect(service.user).toHaveBeenNthCalledWith(1, 'user-2', opts);
      expect(service.user).toHaveBeenNthCalledWith(2, 'missing', opts);
      expect(cache.set).toHaveBeenCalledWith('user:user-2', fetchedUser);
      expect(cache.set).not.toHaveBeenCalledWith('user:missing', null);
    });
  });

  describe('repository', () => {
    it('returns a cached repository without calling the service', async () => {
      const { cache, service, cachedService } = createCacheService();
      const cachedRepository = { id: 'repo-1' };

      cache.get.mockResolvedValue(cachedRepository);

      await expect(cachedService.repository('octocat', 'hello-world')).resolves.toBe(cachedRepository);
      expect(cache.get).toHaveBeenCalledWith('repository:octocat:hello-world');
      expect(service.repository).not.toHaveBeenCalled();
    });

    it('caches a fetched repository but does not cache null results', async () => {
      const { cache, service, cachedService } = createCacheService();
      const repository = { id: 'repo-1' };

      cache.get.mockResolvedValue(null);
      service.repository.mockResolvedValueOnce(repository).mockResolvedValueOnce(null);

      await expect(cachedService.repository('octocat', 'hello-world')).resolves.toBe(repository);
      await expect(cachedService.repository('octocat', 'missing')).resolves.toBeNull();
      expect(cache.set).toHaveBeenCalledWith('repository:octocat:hello-world', repository);
      expect(cache.set).not.toHaveBeenCalledWith('repository:octocat:missing', null);
    });
  });

  describe('search', () => {
    it('uses cached pages before fetching the remaining results', async () => {
      const { cache, service, cachedService } = createCacheService();
      const opts = { name: 'repository', per_page: 2 };
      const cachedPage: Page<{ id: string }> = {
        data: [{ id: 'cached' }],
        metadata: { has_more: true, cursor: 'cached-cursor', per_page: 1 }
      };
      const fetchedPage: Page<{ id: string }> = {
        data: [{ id: 'fetched' }],
        metadata: { has_more: false, cursor: 'final-cursor', per_page: 1 }
      };
      let serviceOpts: Record<string, unknown> | undefined;

      cache.get.mockResolvedValueOnce(cachedPage).mockResolvedValueOnce(null);
      service.search.mockImplementation((_total: number, passedOpts: Record<string, unknown>) => {
        serviceOpts = { ...passedOpts };
        return createIterable([fetchedPage]);
      });

      await expect(collect(cachedService.search(2, opts))).resolves.toEqual([cachedPage, fetchedPage]);
      expect(service.search).toHaveBeenCalledWith(1, expect.any(Object));
      expect(serviceOpts).toEqual({
        ...opts,
        total: 1,
        cursor: 'cached-cursor'
      });
      expect(cache.set).toHaveBeenCalledWith(expect.stringMatching(/^search:/), fetchedPage);
      expect(opts).toEqual({ name: 'repository', per_page: 2 });
    });

    it('does not fetch after a cached final page', async () => {
      const { cache, service, cachedService } = createCacheService();
      const cachedPage: Page<{ id: string }> = {
        data: [{ id: 'only-result' }],
        metadata: { has_more: false, cursor: 'final-cursor' }
      };

      cache.get.mockResolvedValue(cachedPage);

      await expect(collect(cachedService.search(2))).resolves.toEqual([cachedPage]);
      expect(cache.get).toHaveBeenCalledTimes(1);
      expect(service.search).not.toHaveBeenCalled();
    });

    it('does not read or yield cached pages after the requested total is satisfied', async () => {
      const { cache, service, cachedService } = createCacheService();
      const cachedPage: Page<{ id: string }> = {
        data: [{ id: 'only-result' }],
        metadata: { has_more: true, cursor: 'next-cursor' }
      };

      cache.get.mockResolvedValue(cachedPage);

      await expect(collect(cachedService.search(1))).resolves.toEqual([cachedPage]);
      expect(cache.get).toHaveBeenCalledTimes(1);
      expect(service.search).not.toHaveBeenCalled();
    });

    it('returns no results for a non-positive total', async () => {
      const { cache, service, cachedService } = createCacheService();

      await expect(collect(cachedService.search(0))).resolves.toEqual([]);
      expect(cache.get).not.toHaveBeenCalled();
      expect(service.search).not.toHaveBeenCalled();
    });
  });

  describe('resources', () => {
    it('uses cached pages before fetching from the current cursor', async () => {
      const { cache, service, cachedService } = createCacheService();
      const opts = { repository: 'octocat/hello-world', per_page: 2 };
      const cachedPage: Page<{ id: string }> = {
        data: [{ id: 'cached' }],
        metadata: { has_more: true, cursor: 'cached-cursor', per_page: 2 }
      };
      const fetchedPage: Page<{ id: string }> = {
        data: [{ id: 'fetched' }],
        metadata: { has_more: false, cursor: 'final-cursor', per_page: 2 }
      };
      let serviceOpts: Record<string, unknown> | undefined;

      cache.get.mockResolvedValueOnce(cachedPage).mockResolvedValueOnce(null);
      service.resources.mockImplementation((_resource: string, passedOpts: Record<string, unknown>) => {
        serviceOpts = { ...passedOpts };
        return createIterable([fetchedPage]);
      });

      await expect(collect(cachedService.resources('issues', opts))).resolves.toEqual([cachedPage, fetchedPage]);
      expect(service.resources).toHaveBeenCalledWith('issues', expect.any(Object));
      expect(serviceOpts).toEqual({
        ...opts,
        cursor: 'cached-cursor'
      });
      expect(cache.set).toHaveBeenCalledWith(expect.stringMatching(/^issues:/), fetchedPage);
      expect(opts).toEqual({ repository: 'octocat/hello-world', per_page: 2 });
    });

    it('does not fetch after a cached final page', async () => {
      const { cache, service, cachedService } = createCacheService();
      const cachedPage: Page<{ id: string }> = {
        data: [{ id: 'only-result' }],
        metadata: { has_more: false }
      };
      const opts = { repository: 'octocat/hello-world' };

      cache.get.mockResolvedValue(cachedPage);

      await expect(collect(cachedService.resources('issues', opts))).resolves.toEqual([cachedPage]);
      expect(cache.get).toHaveBeenCalledTimes(1);
      expect(service.resources).not.toHaveBeenCalled();
    });

    it('does not cache empty resource pages', async () => {
      const { cache, service, cachedService } = createCacheService();
      const page: Page<never> = { data: [], metadata: { has_more: false } };

      cache.get.mockResolvedValue(null);
      service.resources.mockReturnValue(createIterable([page]));

      await expect(collect(cachedService.resources('issues', { repository: 'octocat/hello-world' }))).resolves.toEqual([
        page
      ]);
      expect(cache.set).not.toHaveBeenCalled();
    });
  });
});
