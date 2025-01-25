import { CommitHistoryConnection } from '@octokit/graphql-schema';
import { Commit } from '../../../../entities/Commit';
import { CommitFragment } from '../fragments/CommitFragment';
import { QueryLookup } from './Lookup';

/**
 *  Add seconds to a date.
 */
function add(date: Date, seconds: number): Date {
  return new Date(new Date(date).getTime() + seconds * 1000);
}

/**
 *  A lookup to get repository commits.
 */
export class CommitsLookup extends QueryLookup<Commit[], { since?: Date; until?: Date }> {
  toString(): string {
    const params = [`first: ${this.params.per_page || 100}`];
    if (this.params.cursor) params.push(`after: "${this.params.cursor}"`);

    if (this.params.since) params.push(`since: "${add(this.params.since, 1).toISOString()}"`);
    if (this.params.until) params.push(`until: "${add(this.params.until, -1).toISOString()}"`);

    return `
    ${this.alias}:node(id: "${this.params.id}") {
      ... on Repository {
        defaultBranchRef {
          target {
            ... on Commit {
              history(${params.join(', ')}) {
                pageInfo { hasNextPage endCursor }
                nodes {
                  ...${this.fragments[0].alias}
                }
              }
            }
          }
        }
      }
    }
    `;
  }

  parse(data: any) {
    const _data: CommitHistoryConnection = (data[this.alias] || data).defaultBranchRef.target.history;
    if (!_data) throw Object.assign(new Error('Failed to parse tags.'), { data, query: this.toString() });

    const parsedData: ReturnType<CommitFragment['parse']>[] = (_data.nodes || []).map((data) =>
      this.fragments[0].parse(data!)
    );

    return {
      next: _data.pageInfo.hasNextPage
        ? new CommitsLookup({
            ...this.params,
            cursor: _data.pageInfo.endCursor || this.params.cursor
          })
        : undefined,
      data: parsedData,
      params: {
        ...this.params,
        cursor: _data.pageInfo.endCursor || this.params.cursor,
        since: this.params.since || parsedData.at(0)?.committed_date,
        until: parsedData.at(-1)?.committed_date || this.params.until
      }
    };
  }

  get fragments(): [CommitFragment] {
    return [this.params.factory.create(CommitFragment)];
  }
}
