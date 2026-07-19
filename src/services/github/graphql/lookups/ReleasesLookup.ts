import { Release, ReleaseSchema } from '../../../../entities/Release';
import { ActorFragment } from '../fragments/ActorFragment';
import { ConnectionDescriptor, ConnectionLookup } from './ConnectionLookup';

/**
 *  A lookup to get repository releases.
 */
export class ReleasesLookup extends ConnectionLookup<Release> {
  protected get descriptor(): ConnectionDescriptor {
    return {
      field: 'releases',
      typeCondition: 'Repository',
      args: ['orderBy: { field: CREATED_AT direction: ASC }'],
      missingDataError: 'Failed to parse tags.'
    };
  }

  protected entriesSelection(): string {
    return `nodes {
            __typename
            author { ...${this.fragments[0].alias} }
            createdAt
            databaseId
            description
            id
            immutable
            isDraft
            isPrerelease
            name
            publishedAt
            reactions { totalCount }
            repository { id }
            tagCommit { id }
            tagName
            updatedAt
          }`;
  }

  protected mapEntry(entry: any): Release {
    return ReleaseSchema.parse({
      __typename: entry.__typename,
      author: entry.author && this.fragments[0].parse(entry.author),
      created_at: entry.createdAt,
      database_id: entry.databaseId,
      id: entry.id,
      immutable: entry.immutable,
      is_draft: entry.isDraft,
      is_prerelease: entry.isPrerelease,
      name: entry.name,
      published_at: entry.publishedAt,
      reactions_count: entry.reactions.totalCount,
      repository: entry.repository.id,
      tag_commit: entry.tagCommit?.id,
      tag_name: entry.tagName,
      updated_at: entry.updatedAt
    });
  }

  get fragments(): [ActorFragment] {
    return [this.params.factory.create(ActorFragment)];
  }
}
