import { IssueConnection } from '@octokit/graphql-schema';
import { Issue } from '../../../../entities/Issue';
import { IssueFragment } from '../fragments/IssueFragment';
import { QueryLookup } from './Lookup';

/**
 *  A lookup to get repository issues.
 */
export class IssuesLookup extends QueryLookup<Issue[]> {
  toString(): string {
    const params = [`first: ${this.params.per_page || 100}`, 'orderBy: { field: UPDATED_AT direction: ASC }'];
    if (this.params.cursor) params.push(`after: "${this.params.cursor}"`);

    return `
    ${this.alias}:node(id: "${this.params.id}") {
      ... on Repository {
        issues(${params.join(', ')}) {
          pageInfo { hasNextPage endCursor }
          nodes { ...${this.fragments[0].alias} }
        }
      }
    }
    `;
  }

  parse(data: any) {
    const _data: IssueConnection = (data[this.alias] || data).issues;
    if (!_data) throw Object.assign(new Error('Failed to parse tags.'), { data, query: this.toString() });
    return {
      next: _data.pageInfo.hasNextPage
        ? new IssuesLookup({
            ...this.params,
            cursor: _data.pageInfo.endCursor || this.params.cursor
          })
        : undefined,
      data: (_data.nodes || []).map((data) => this.fragments[0].parse(data!)),
      params: { ...this.params, cursor: _data.pageInfo.endCursor || this.params.cursor }
    };
  }

  get fragments(): [IssueFragment] {
    return [this.params.factory.create(IssueFragment)];
  }
}
