import { Stargazer, StargazerSchema } from '../../../../entities/Stargazer';
import { ActorFragment } from '../fragments/ActorFragment';
import { ConnectionDescriptor, ConnectionLookup } from './ConnectionLookup';

/**
 *  A lookup to get repository stargazers.
 */
export class StargazersLookup extends ConnectionLookup<Stargazer> {
  protected get descriptor(): ConnectionDescriptor {
    return {
      field: 'stargazers',
      typeCondition: 'Repository',
      args: ['orderBy: { field: STARRED_AT, direction: ASC}']
    };
  }

  protected entriesSelection(): string {
    return `edges {
            starredAt
            node { ...${this.fragments[0].alias} }
          }`;
  }

  protected extractEntries(connection: any): any[] {
    return connection.edges || [];
  }

  protected mapEntry(entry: any): Stargazer {
    return StargazerSchema.parse({
      __typename: 'Stargazer',
      starred_at: entry.starredAt,
      user: this.fragments[0].parse(entry.node),
      repository: this.params.id
    });
  }

  get fragments() {
    return [this.params.factory.create(ActorFragment)];
  }
}
