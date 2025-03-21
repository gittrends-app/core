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
 * A service that passes all requests through to the underlying service.
 */
export class PassThroughService implements Service {
  /**
   * Creates a new PassThroughService.
   * @param service The underlying service.
   */
  constructor(public readonly service: Service) {}

  search(total: number, opts?: SearchParams): Iterable<Repository> {
    return this.service.search(total, opts);
  }

  user(id: string, opts?: { byLogin: boolean }): Promise<Actor | null>;
  user(id: string[], opts?: { byLogin: boolean }): Promise<(Actor | null)[]>;
  user(id: any, opts?: any): Promise<any> {
    return this.service.user(id, opts);
  }

  repository(ownerOrId: string, name?: string): Promise<Repository | null> {
    return this.service.repository(ownerOrId, name);
  }

  resources(resource: 'commits', opts: ServiceCommitsParams): Iterable<Commit, { since?: Date; until?: Date }>;
  resources(resource: 'discussions', opts: ServiceResourceParams): Iterable<Discussion>;
  resources(resource: 'issues', opts: ServiceResourceParams): Iterable<Issue>;
  resources(resource: 'pull_requests', opts: ServiceResourceParams): Iterable<PullRequest>;
  resources(resource: 'releases', opts: ServiceResourceParams): Iterable<Release>;
  resources(resource: 'stargazers', opts: ServiceResourceParams): Iterable<Stargazer>;
  resources(resource: 'tags', opts: ServiceResourceParams): Iterable<Tag>;
  resources(resource: 'watchers', opts: ServiceResourceParams): Iterable<Watcher>;
  resources<T>(resource: any, opts: any): Iterable<T> {
    return this.service.resources(resource, opts) as Iterable<T>;
  }
}
