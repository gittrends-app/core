import { PullRequestConnection } from '@octokit/graphql-schema';
import { PullRequest } from '../../../../entities/PullRequest';
import { PullRequestFragment } from '../fragments/PullRequestFragment';
import { QueryLookup } from './Lookup';

/**
 *  A lookup to get repository prs.
 */
export class PullRequestsLookup extends QueryLookup<PullRequest[]> {
  toString(): string {
    const params = [`first: ${this.params.per_page || 100}`, 'orderBy: { field: UPDATED_AT direction: ASC }'];
    if (this.params.cursor) params.push(`after: "${this.params.cursor}"`);

    return `
    ${this.alias}:node(id: "${this.params.id}") {
      ... on Repository {
        pullRequests(${params.join(', ')}) {
          pageInfo { hasNextPage endCursor }
          nodes { ...${this.fragments[0].alias} }
        }
      }
    }
    `;
  }

  parse(data: any) {
    const _data: PullRequestConnection = (data[this.alias] || data).pullRequests;
    if (!_data) throw Object.assign(new Error('Failed to parse pull requests.'), { data, query: this.toString() });
    return {
      next: _data.pageInfo.hasNextPage
        ? new PullRequestsLookup({
            ...this.params,
            cursor: _data.pageInfo.endCursor || this.params.cursor
          })
        : undefined,
      data: (_data.nodes || []).map((data) => this.fragments[0].parse(data!)),
      params: { ...this.params, cursor: _data.pageInfo.endCursor || this.params.cursor }
    };
  }

  get fragments(): [PullRequestFragment] {
    return [this.params.factory.create(PullRequestFragment)];
  }
}
