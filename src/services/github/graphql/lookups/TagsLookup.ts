import { RefConnection } from '@octokit/graphql-schema';
import { Tag } from '../../../../entities/Tag.js';
import { CommitFragment } from '../fragments/CommitFragment.js';
import { TagFragment } from '../fragments/TagFragment.js';
import { QueryLookup } from './Lookup.js';

/**
 *  A lookup to get repository tags.
 */
export class TagsLookup extends QueryLookup<Tag[]> {
  toString(): string {
    const params = [`first: ${this.params.per_page || 100}`, 'refPrefix: "refs/tags/"'];
    if (this.params.cursor) params.push(`after: "${this.params.cursor}"`);

    return `
    ${this.alias}:node(id: "${this.params.id}") {
      ... on Repository {
        tags:refs(${params.join(', ')}) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            name
            repository { id }
            target {
              __typename
              ...${this.fragments[0].alias}
              ...${this.fragments[1].alias}
            }
          }
        }
      }
    }
    `;
  }

  parse(data: any) {
    const _data: RefConnection = (data[this.alias] || data).tags;
    if (!_data) throw Object.assign(new Error('Failed to parse tags.'), { data, query: this.toString() });
    return {
      next: _data.pageInfo.hasNextPage
        ? new TagsLookup({
            ...this.params,
            cursor: _data.pageInfo.endCursor || this.params.cursor
          })
        : undefined,
      data: (_data.nodes || []).map((data) => {
        const isTag = data!.target?.__typename === 'Tag';
        return this.fragments[0].parse({
          ...(isTag ? data!.target : (data as any)),
          __typename: 'Tag'
        });
      }),
      params: { ...this.params, cursor: _data.pageInfo.endCursor || this.params.cursor }
    };
  }

  get fragments(): [TagFragment, CommitFragment] {
    return [this.params.factory.create(TagFragment), this.params.factory.create(CommitFragment)];
  }
}
