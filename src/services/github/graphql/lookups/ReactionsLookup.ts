import { Reaction, ReactionSchema } from '../../../../entities/Reaction';
import { ActorFragment } from '../fragments/ActorFragment';
import { ConnectionDescriptor, ConnectionLookup } from './ConnectionLookup';

/**
 *  A lookup to get repository reactions.
 */
export class ReactionsLookup extends ConnectionLookup<Reaction> {
  protected get descriptor(): ConnectionDescriptor {
    return { field: 'reactions', typeCondition: 'Reactable' };
  }

  toString(): string {
    const params = [`first: ${this.params.per_page || 100}`];
    if (this.params.cursor) params.push(`after: "${this.params.cursor}"`);

    return `
    ${this.alias}:node(id: "${this.params.id}") {
      ... on Reactable {
        __typename
        reactions(${params.join(', ')}) {
          pageInfo { hasNextPage endCursor }
          ${this.entriesSelection()}
        }
      }
    }
    `;
  }

  protected entriesSelection(): string {
    return `nodes {
            __typename
            id
            databaseId
            content
            createdAt
            user { ...${this.fragments[0].alias} }
            reactable { id __typename }
          }`;
  }

  protected mapEntry(entry: any): Reaction {
    return ReactionSchema.parse({
      __typename: entry.__typename,
      id: entry.id,
      database_id: entry.databaseId,
      content: entry.content,
      created_at: entry.createdAt,
      user: entry.user ? this.fragments[0].parse(entry.user) : undefined,
      reactable: entry.reactable
    });
  }

  get fragments(): [ActorFragment] {
    return [this.params.factory.create(ActorFragment)];
  }
}
