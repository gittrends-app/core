import { Actor } from '../entities/Actor';
import { RepositoryNode } from '../entities/base/RepositoryNode';
import { Commit } from '../entities/Commit';
import { Discussion } from '../entities/Discussion';
import { Issue } from '../entities/Issue';
import { PullRequest } from '../entities/PullRequest';
import { Release } from '../entities/Release';
import { Repository } from '../entities/Repository';
import { Stargazer } from '../entities/Stargazer';
import { Tag } from '../entities/Tag';
import { Watcher } from '../entities/Watcher';

/**
 * Pageable parameters.
 */
export type PageableParams = {
  /**
   * The cursor to start from.
   */
  cursor?: string;
  /**
   * The number of items per page.
   */
  per_page?: number;
};

/**
 * Iterable type.
 */
export type Iterable<T = any, P extends object = object> = AsyncIterable<{
  /**
   * The data.
   */
  data: T[];
  /**
   * The metadata.
   */
  metadata: PageableParams & P & { has_more: boolean };
}>;

/**
 * Service resource parameters.
 */
export type ServiceResourceParams = RepositoryNode & PageableParams;

/**
 * Search parameters.
 */
export type SearchParams = PageableParams & {
  name?: string;
  language?: string;
};

/**
 * Service commits parameters.
 */
export type ServiceCommitsParams = ServiceResourceParams & { since?: Date; until?: Date };

/**
 * Service interface to be implemented by all services.
 */
export interface Service {
  /**
   * Searches for repositories.
   * @param total The total number of repositories to search for.
   * @param opts The search options.
   * @returns An iterable of repositories.
   */
  search(total: number, opts?: SearchParams): Iterable<Repository>;

  /**
   * Fetches a user by id or login.
   * @param id The id or login of the user.
   * @param opts The fetch options.
   * @param opts.byLogin Whether to fetch by login.
   * @returns The user or null if not found.
   */
  user(id: string, opts?: { byLogin: boolean }): Promise<Actor | null>;
  user(id: string[], opts?: { byLogin: boolean }): Promise<(Actor | null)[]>;

  /**
   * Fetches a repository by owner and name.
   * @param ownerOrId The owner or id of the repository.
   * @param name The name of the repository.
   * @returns The repository or null if not found.
   */
  repository(ownerOrId: string, name?: string): Promise<Repository | null>;

  /**
   * Fetches a resource from a repository.
   * @param resource The resource to fetch.
   * @param opts The fetch options.
   * @returns An iterable of the resource.
   */
  resources(resource: 'commits', opts: ServiceCommitsParams): Iterable<Commit, { since?: Date; until?: Date }>;
  resources(resource: 'discussions', opts: ServiceResourceParams): Iterable<Discussion>;
  resources(resource: 'issues', opts: ServiceResourceParams): Iterable<Issue>;
  resources(resource: 'pull_requests', opts: ServiceResourceParams): Iterable<PullRequest>;
  resources(resource: 'releases', opts: ServiceResourceParams): Iterable<Release>;
  resources(resource: 'stargazers', opts: ServiceResourceParams): Iterable<Stargazer>;
  resources(resource: 'tags', opts: ServiceResourceParams): Iterable<Tag>;
  resources(resource: 'watchers', opts: ServiceResourceParams): Iterable<Watcher>;
}
