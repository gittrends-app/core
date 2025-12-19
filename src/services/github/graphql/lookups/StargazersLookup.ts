import { Stargazer, StargazerSchema } from '../../../../entities/Stargazer';
import { StargazerConnection } from '../../graphql-schema';
import { ActorFragment } from '../fragments/ActorFragment';
import { QueryLookup } from './Lookup';

/**
 *  A lookup to get repository stargazers.
 */
export class StargazersLookup extends QueryLookup<Stargazer[]> {
  toString(): string {
    const params = [`first: ${this.params.per_page || 100}`, 'orderBy: { field: STARRED_AT, direction: ASC}'];
    if (this.params.cursor) params.push(`after: "${this.params.cursor}"`);

    return `
    ${this.alias}:node(id: "${this.params.id}") {
      ... on Repository {
        stargazers(${params.join(', ')}) {
          pageInfo { hasNextPage endCursor }
          edges {
            starredAt
            node { ...${this.fragments[0].alias} }
          }
        }
      }
    }
    `;
  }

  parse(data: any) {
    const _data: StargazerConnection = (data[this.alias] || data).stargazers;
    return {
      next: _data.pageInfo.hasNextPage
        ? new StargazersLookup({
            ...this.params,
            cursor: _data.pageInfo.endCursor || this.params.cursor
          })
        : undefined,
      data: (_data.edges || []).map((data) =>
        StargazerSchema.parse({
          __typename: 'Stargazer',
          starred_at: data!.starredAt,
          user: this.fragments[0].parse(data!.node),
          repository: this.params.id
        })
      ),
      params: { ...this.params, cursor: _data.pageInfo.endCursor || this.params.cursor }
    };
  }

  get fragments() {
    return [this.params.factory.create(ActorFragment)];
  }
}
