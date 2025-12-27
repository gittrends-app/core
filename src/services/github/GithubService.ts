/* eslint-disable @typescript-eslint/no-unused-vars */
import defaults from 'lodash/defaults.js';
import { Class } from 'type-fest';
import { Actor, Bot, EnterpriseUserAccount, Mannequin, Organization, User } from '../../entities/Actor';
import { Commit } from '../../entities/Commit';
import { Discussion } from '../../entities/Discussion';
import { Issue } from '../../entities/Issue';
import { PullRequest } from '../../entities/PullRequest';
import { Release } from '../../entities/Release';
import { Repository } from '../../entities/Repository';
import { Stargazer } from '../../entities/Stargazer';
import { Tag } from '../../entities/Tag';
import { Watcher } from '../../entities/Watcher';
import { Booleanify, NullableFields } from '../../helpers/types';
import { Iterable, SearchParams, Service, ServiceCommitsParams, ServiceResourceParams } from '../Service';
import { GithubClient } from './GithubClient';
import { ActorFragment } from './graphql/fragments/ActorFragment';
import { BaseFragmentFactory, Fragment, FragmentFactory } from './graphql/fragments/Fragment';
import { RepositoryFragment } from './graphql/fragments/RepositoryFragment';
import { QueryLookup, QueryLookupParams } from './graphql/lookups/Lookup';
import { SearchLookup } from './graphql/lookups/SearchLookup';
import { StargazersLookup } from './graphql/lookups/StargazersLookup';
import { TagsLookup } from './graphql/lookups/TagsLookup';
import { WatchersLookup } from './graphql/lookups/WatchersLookup';
import { QueryRunner } from './graphql/QueryRunner';
import commits from './resources/commits';
import discussions from './resources/discussions';
import issues from './resources/issues';
import pullRequests from './resources/pull_requests';
import releases from './resources/releases';
import repos from './resources/repos';
import { default as users } from './resources/users';

type ActorFragmentFields = Booleanify<
  Omit<
    NullableFields<
      Partial<Bot> & Partial<Mannequin> & Partial<EnterpriseUserAccount> & Partial<Organization> & Partial<User>
    >,
    'id' | 'login' | 'avatar_url' | '__typename'
  >
>;

type RepositoryFragmentFields = Booleanify<
  Omit<
    Repository,
    '__typename' | 'database_id' | 'description' | 'id' | 'name' | 'name_with_owner' | 'owner' | 'primary_language'
  >
>;

/**
 * Entities fields configuration
 * true = include all fields
 * false = include only basic fields
 */
export type EntitiesFields = {
  actors?: ActorFragmentFields | true | false;
  repositories?: RepositoryFragmentFields | true | false;
};

/**
 * Custom fragment factory
 */
class CustomFragmentFactory extends BaseFragmentFactory {
  private config?: EntitiesFields;

  constructor(config?: EntitiesFields | boolean) {
    if (typeof config === 'boolean') {
      super(config);
    } else {
      super(false);
      this.config = defaults(config, {
        actors: {
          bio: true,
          company: true,
          created_at: true,
          database_id: true,
          email: true,
          location: true,
          name: true,
          website_url: true
        },
        repositories: {
          created_at: true,
          fork_count: true,
          homepage_url: true,
          stargazers_count: true
        }
      });
    }
  }

  create<T extends Fragment>(Ref: Class<T>): T {
    switch (Ref.name) {
      case ActorFragment.name: {
        return new ActorFragment(Ref.name, {
          factory: new CustomFragmentFactory(this.config),
          fields: this.config?.actors || this.full
        }) as unknown as T;
      }
      case RepositoryFragment.name: {
        return new RepositoryFragment(Ref.name, {
          factory: new CustomFragmentFactory(this.config),
          fields: this.config?.repositories || this.full
        }) as unknown as T;
      }
      default:
        return super.create(Ref);
    }
  }
}

/**
 * A service that interacts with the Github API.
 */
export class GithubService implements Service {
  private readonly client: GithubClient;
  private readonly factory: FragmentFactory;

  /**
   * Creates a new GithubService
   * @param client The Github client.
   */
  constructor(client: GithubClient, opts?: { fields?: EntitiesFields }) {
    this.client = client;
    this.factory = new CustomFragmentFactory(opts?.fields);
  }

  search(total: number, opts?: SearchParams): Iterable<Repository> {
    const it = QueryRunner.create(this.client).iterator(
      new SearchLookup({
        factory: this.factory,
        limit: total,
        per_page: opts?.per_page,
        name: opts?.name,
        language: opts?.language,
        org: opts?.org
      })
    );

    return {
      [Symbol.asyncIterator]: async function* () {
        for await (const searchRes of it) {
          yield {
            data: searchRes.data,
            metadata: { has_more: !!searchRes.next, ...searchRes.params }
          };
        }
      }
    };
  }

  async user(id: string, opts?: { byLogin: boolean }): Promise<Actor | null>;
  async user(id: string[], opts?: { byLogin: boolean }): Promise<(Actor | null)[]>;
  async user(id: any, opts?: { byLogin: boolean }): Promise<any> {
    if ((Array.isArray(id) ? id : [id]).some((v) => v === '')) throw new Error('Invalid user ID.');

    return users(id, {
      client: this.client,
      byLogin: opts?.byLogin,
      factory: new CustomFragmentFactory(true)
    });
  }

  async viewer(): Promise<Actor | null> {
    return users('', { client: this.client, factory: new CustomFragmentFactory(true) });
  }

  async repository(owner: string, name?: string): Promise<Repository | null>;
  async repository(owner: string, nameOrOpts?: any): Promise<Repository | null> {
    return repos(nameOrOpts && typeof nameOrOpts === 'string' ? `${owner}/${nameOrOpts}` : owner, {
      client: this.client,
      byName: !!nameOrOpts,
      factory: new CustomFragmentFactory(true)
    });
  }

  resources(resource: 'commits', opts: ServiceCommitsParams): Iterable<Commit, { since?: Date; until?: Date }>;
  resources(resource: 'discussions', opts: ServiceResourceParams): Iterable<Discussion>;
  resources(resource: 'issues', opts: ServiceResourceParams): Iterable<Issue>;
  resources(resource: 'pull_requests', opts: ServiceResourceParams): Iterable<PullRequest>;
  resources(resource: 'releases', opts: ServiceResourceParams): Iterable<Release>;
  resources(resource: 'stargazers', opts: ServiceResourceParams): Iterable<Stargazer>;
  resources(resource: 'tags', opts: ServiceResourceParams): Iterable<Tag>;
  resources(resource: 'watchers', opts: ServiceResourceParams): Iterable<Watcher>;
  resources(resource: any, opts: any): Iterable<any> {
    const params: QueryLookupParams & Partial<{ since: Date; until: Date }> = {
      id: opts.repository,
      cursor: opts.cursor,
      per_page: opts.per_page,
      factory: this.factory
    };

    switch (resource) {
      case 'commits':
        return commits(this.client, { ...params, since: opts.since, until: opts.until });
      case 'discussions':
        return discussions(this.client, params);
      case 'issues':
        return issues(this.client, params);
      case 'pull_requests':
        return pullRequests(this.client, params);
      case 'releases':
        return releases(this.client, params);
      case 'stargazers':
        return genericIterator(this.client, new StargazersLookup(params));
      case 'tags':
        return genericIterator(this.client, new TagsLookup(params));
      case 'watchers':
        return genericIterator(this.client, new WatchersLookup(params));
      default:
        throw new Error('Repository resource not implemented.');
    }
  }
}

/**
 *  A generic iterator for resources that require a lookup.
 */
function genericIterator<R>(client: GithubClient, lookup: QueryLookup<R[]>): Iterable<R> {
  return {
    [Symbol.asyncIterator]: async function* () {
      for await (const searchRes of QueryRunner.create(client).iterator(lookup)) {
        yield {
          data: searchRes.data,
          metadata: {
            has_more: !!searchRes.next,
            cursor: searchRes.params.cursor,
            per_page: searchRes.params.per_page
          }
        };
      }
    }
  };
}
