import { UserConnection } from '@octokit/graphql-schema';
import { Watcher, WatcherSchema } from '../../../../entities/Watcher.js';
import { ActorFragment } from '../fragments/ActorFragment.js';
import { QueryLookup } from './Lookup.js';

/**
 *  A lookup to get repository watchers.
 */
export class WatchersLookup extends QueryLookup<Watcher[]> {
  toString(): string {
    const params = [`first: ${this.params.per_page || 100}`];
    if (this.params.cursor) params.push(`after: "${this.params.cursor}"`);

    return `
    ${this.alias}:node(id: "${this.params.id}") {
      ... on Repository {
        watchers(${params.join(', ')}) {
          pageInfo { hasNextPage endCursor }
          nodes { ...${this.fragments[0].alias} }
        }
      }
    }
    `;
  }

  parse(data: any) {
    const _data: UserConnection = (data[this.alias] || data).watchers;
    return {
      next: _data.pageInfo.hasNextPage
        ? new WatchersLookup({
            ...this.params,
            cursor: _data.pageInfo.endCursor || this.params.cursor
          })
        : undefined,
      data: (_data.nodes || []).map((data) =>
        WatcherSchema.parse({
          __typename: 'Watcher',
          user: this.fragments[0].parse(data!),
          repository: this.params.id
        })
      ),
      params: { ...this.params, cursor: _data.pageInfo.endCursor || this.params.cursor }
    };
  }

  get fragments(): [ActorFragment] {
    return [this.params.factory.create(ActorFragment)];
  }
}
