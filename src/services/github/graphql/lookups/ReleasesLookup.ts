import { Release, ReleaseSchema } from '../../../../entities/Release';
import { ReleaseConnection } from '../../graphql-schema';
import { ActorFragment } from '../fragments/ActorFragment';
import { QueryLookup } from './Lookup';

/**
 *  A lookup to get repository releases.
 */
export class ReleasesLookup extends QueryLookup<Release[]> {
  toString(): string {
    const params = [`first: ${this.params.per_page || 100}`, 'orderBy: { field: CREATED_AT direction: ASC }'];
    if (this.params.cursor) params.push(`after: "${this.params.cursor}"`);

    return `
    ${this.alias}:node(id: "${this.params.id}") {
      ... on Repository {
        releases(${params.join(', ')}) {
          pageInfo { hasNextPage endCursor }
          nodes {
            __typename
            author { ...${this.fragments[0].alias} }
            createdAt
            databaseId
            description
            id
            isDraft
            isPrerelease
            name
            publishedAt
            reactions { totalCount }
            repository { id }
            tagCommit { id }
            tagName
            updatedAt
          }
        }
      }
    }
    `;
  }

  parse(data: any) {
    const _data: ReleaseConnection = (data[this.alias] || data).releases;
    if (!_data) throw Object.assign(new Error('Failed to parse tags.'), { data, query: this.toString() });
    return {
      next: _data.pageInfo.hasNextPage
        ? new ReleasesLookup({
            ...this.params,
            cursor: _data.pageInfo.endCursor || this.params.cursor
          })
        : undefined,
      data: (_data.nodes || []).map((data) => {
        return ReleaseSchema.parse({
          __typename: data!.__typename,
          author: data!.author && this.fragments[0].parse(data!.author),
          created_at: data!.createdAt,
          database_id: data!.databaseId,
          id: data!.id,
          is_draft: data!.isDraft,
          is_prerelease: data!.isPrerelease,
          name: data!.name,
          published_at: data!.publishedAt,
          reactions_count: data!.reactions.totalCount,
          repository: data!.repository.id,
          tag_commit: data!.tagCommit?.id,
          tag_name: data!.tagName,
          updated_at: data!.updatedAt
        });
      }),
      params: { ...this.params, cursor: _data.pageInfo.endCursor || this.params.cursor }
    };
  }

  get fragments(): [ActorFragment] {
    return [this.params.factory.create(ActorFragment)];
  }
}
