import { hash } from 'hash-it';
import { Actor } from '../entities/Actor';
import { Commit } from '../entities/Commit';
import { Discussion } from '../entities/Discussion';
import { Issue } from '../entities/Issue';
import { PullRequest } from '../entities/PullRequest';
import { Release } from '../entities/Release';
import { Repository } from '../entities/Repository';
import { Stargazer } from '../entities/Stargazer';
import { Tag } from '../entities/Tag';
import { Watcher } from '../entities/Watcher';
import { Iterable, SearchParams, Service, ServiceCommitsParams, ServiceResourceParams } from './Service';

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
        const _opts = { total, ...(opts || {}) };

        let cached: { data: Repository[]; metadata: any } | null;

        do {
          cached = await cache.get(`${CacheService.SEARCH_PREFIX}:${hash(_opts)}`);
          if (cached) {
            yield cached;
            _opts.total -= cached.data.length;
            _opts.cursor = cached.metadata.cursor;
          }
        } while (cached !== null);

        if (_opts.total > 0) {
          for await (const { data, metadata } of service.search(_opts.total, _opts)) {
            cache.set(`${CacheService.SEARCH_PREFIX}:${hash(_opts)}`, { data, metadata });
            yield { data, metadata };
            _opts.total -= data.length;
            _opts.cursor = metadata.cursor;
          }
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
        this.cache.get<Actor>(`${CacheService.USER_PREFIX}:${i}`).then((cached) => {
          if (cached) return cached;

          return this.service.user(i, opts).then((user) => {
            if (user) this.cache.set(`${CacheService.USER_PREFIX}:${i}`, user);
            return user;
          });
        })
      )
    );

    return Array.isArray(id) ? users : users[0];
  }

  async repository(ownerOrId: string, name?: string): Promise<Repository | null> {
    const cacheKey = `${CacheService.REPOSITORY_PREFIX}:${ownerOrId}:${name}`;
    const cached = await this.cache.get<Repository>(cacheKey);
    if (cached) return cached;

    const result = await this.service.repository(ownerOrId, name);
    if (result) await this.cache.set(cacheKey, result);

    return result;
  }

  resources(res: 'commits', opts: object & ServiceCommitsParams): Iterable<Commit, { since?: Date; until?: Date }>;
  resources(res: 'discussions', opts: object & ServiceResourceParams): Iterable<Discussion>;
  resources(res: 'issues', opts: object & ServiceResourceParams): Iterable<Issue>;
  resources(res: 'pull_requests', opts: object & ServiceResourceParams): Iterable<PullRequest>;
  resources(res: 'releases', opts: object & ServiceResourceParams): Iterable<Release>;
  resources(res: 'stargazers', opts: object & ServiceResourceParams): Iterable<Stargazer>;
  resources(res: 'tags', opts: object & ServiceResourceParams): Iterable<Tag>;
  resources(res: 'watchers', opts: object & ServiceResourceParams): Iterable<Watcher>;
  resources<T>(res: any, opts: any): Iterable<T> {
    const { cache, service } = this;

    return {
      async *[Symbol.asyncIterator]() {
        const _opts: ServiceResourceParams = { ...opts };
        let cached: { data: T[]; metadata: any } | null;

        while ((cached = await cache.get(`${res}:${hash(_opts)}`))) {
          yield cached as any;
          Object.assign(_opts, { cursor: cached.metadata.cursor });
        }

        for await (const { data, metadata } of service.resources(res, _opts)) {
          if (data.length > 0) cache.set(`${res}:${hash(_opts)}`, { data, metadata });
          yield { data, metadata };
          Object.assign(_opts, { cursor: metadata.cursor });
        }
      }
    };
  }
}
