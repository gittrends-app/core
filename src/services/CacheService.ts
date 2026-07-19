import { hash } from 'hash-it';
import { Actor } from '../entities/Actor';
import { Repository } from '../entities/Repository';
import { adjustPage } from './pagination';
import {
  Iterable,
  SearchParams,
  Service,
  ServiceResource,
  ServiceResourceIterable,
  ServiceResourceMap,
  ServiceResourceParamsFor
} from './Service';

const CACHE_VERSION = 'service-cache:v1';

function canonicalize(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonicalize(entry)])
    );
  }
  return value;
}

function cacheKey(operation: string, identity: unknown): string {
  return `${CACHE_VERSION}:${operation}:${hash(canonicalize(identity))}`;
}

/**
 * Represents a mechanism for caching data.
 */
export interface Cache {
  /**
   * Retrieves an item from the cache.
   * @param key The key of the item to retrieve.
   * @returns The cached item or null if not found.
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Stores an item in the cache.
   * @param key The key of the item to store.
   * @param value The value of the item to store.
   */
  set<T>(key: string, value: T): Promise<void>;

  /**
   * Removes an item from the cache.
   * @param key The key of the item to remove.
   */
  remove(key: string): Promise<void>;

  /**
   * Clears all items from the cache.
   */
  clear(): Promise<void>;
}

/**
 * A service that caches responses from the underlying service.
 */
export class CacheService implements Service {
  public static readonly SEARCH_PREFIX = 'search';
  public static readonly REPOSITORY_PREFIX = 'repository';
  public static readonly USER_PREFIX = 'user';
  public static readonly COMMITS_PREFIX = 'commits';
  public static readonly DISCUSSIONS_PREFIX = 'discussions';
  public static readonly ISSUES_PREFIX = 'issues';
  public static readonly PULL_REQUESTS_PREFIX = 'pull_requests';
  public static readonly RELEASES_PREFIX = 'releases';
  public static readonly STARGAZERS_PREFIX = 'stargazers';
  public static readonly TAGS_PREFIX = 'tags';
  public static readonly WATCHERS_PREFIX = 'watchers';

  private readonly service: Service;
  private readonly cache: Cache;

  constructor(service: Service, cache: Cache) {
    this.service = service;
    this.cache = cache;
  }

  search(total: number, opts?: SearchParams): Iterable<Repository> {
    const { cache, service } = this;

    return {
      async *[Symbol.asyncIterator]() {
        if (total <= 0) return;

        let remaining = total;
        let cursor = opts?.cursor;

        while (remaining > 0) {
          const pageOpts = { ...(opts || {}), ...(cursor === undefined ? {} : { cursor }) };
          const key = cacheKey(CacheService.SEARCH_PREFIX, pageOpts);
          const cached = await safeGet<{ data: Repository[]; metadata: any }>(cache, key);

          if (cached) {
            const data = cached.data.slice(0, remaining);
            if (data.length === 0) return;

            remaining -= data.length;
            const hasMore = remaining > 0 && cached.metadata.has_more && !!cached.metadata.cursor;
            yield { data, metadata: adjustPage(cached.metadata, { hasMore, perPage: data.length }) };

            if (!hasMore) return;
            cursor = cached.metadata.cursor;
            continue;
          }

          let yielded = false;
          for await (const { data: pageData, metadata } of service.search(remaining, pageOpts)) {
            const data = pageData.slice(0, remaining);
            if (data.length === 0) return;

            yielded = true;
            await safeSet(cache, key, { data: pageData, metadata });
            remaining -= data.length;
            const hasMore = remaining > 0 && metadata.has_more && !!metadata.cursor;
            yield { data, metadata: adjustPage(metadata, { hasMore, perPage: data.length }) };

            if (!hasMore) return;
            cursor = metadata.cursor;
            break;
          }

          if (!yielded) return;
        }
      }
    };
  }

  user(id: string, opts?: { byLogin: boolean }): Promise<Actor | null>;
  user(id: string[], opts?: { byLogin: boolean }): Promise<(Actor | null)[]>;
  async user(id: unknown, opts?: any): Promise<any> {
    const ids = Array.isArray(id) ? id : [id];

    const users = await Promise.all(
      ids.map((i) =>
        safeGet<Actor>(this.cache, cacheKey(CacheService.USER_PREFIX, { id: i, byLogin: opts?.byLogin ?? false })).then(
          (cached) => {
            if (cached) return cached;

            return this.service.user(i, opts).then((user) => {
              if (user)
                void safeSet(
                  this.cache,
                  cacheKey(CacheService.USER_PREFIX, { id: i, byLogin: opts?.byLogin ?? false }),
                  user
                );
              return user;
            });
          }
        )
      )
    );

    return Array.isArray(id) ? users : users[0];
  }

  async repository(ownerOrId: string, name?: string): Promise<Repository | null> {
    const key = cacheKey(CacheService.REPOSITORY_PREFIX, { ownerOrId, name });
    const cached = await safeGet<Repository>(this.cache, key);
    if (cached) return cached;

    const result = await this.service.repository(ownerOrId, name);
    if (result) await safeSet(this.cache, key, result);

    return result;
  }

  resources<R extends ServiceResource>(res: R, opts: ServiceResourceParamsFor<R>): ServiceResourceIterable<R> {
    const { cache, service } = this;

    return {
      async *[Symbol.asyncIterator]() {
        const _opts: ServiceResourceParamsFor<R> = { ...opts };
        let cached: { data: ServiceResourceMap[R][]; metadata: any } | null;

        while ((cached = await safeGet(cache, cacheKey(res, _opts)))) {
          const hasMore = cached.metadata.has_more && !!cached.metadata.cursor;
          yield { data: cached.data, metadata: adjustPage(cached.metadata, { hasMore }) } as any;
          if (!hasMore) return;
          Object.assign(_opts, { cursor: cached.metadata.cursor });
        }

        for await (const { data, metadata } of service.resources(res, _opts)) {
          if (data.length > 0) void safeSet(cache, cacheKey(res, _opts), { data, metadata });
          const hasMore = metadata.has_more && !!metadata.cursor;
          yield { data, metadata: adjustPage(metadata, { hasMore }) };
          if (!hasMore) return;
          Object.assign(_opts, { cursor: metadata.cursor });
        }
      }
    } as ServiceResourceIterable<R>;
  }
}

async function safeGet<T>(cache: Cache, key: string): Promise<T | null> {
  try {
    return await cache.get<T>(key);
  } catch {
    return null;
  }
}

async function safeSet<T>(cache: Cache, key: string, value: T): Promise<void> {
  try {
    await cache.set(key, value);
  } catch {
    // Cache failures are intentionally best effort.
  }
}
