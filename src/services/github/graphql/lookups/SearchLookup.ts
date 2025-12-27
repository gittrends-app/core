import { Repository } from '../../graphql-schema';
import { RepositoryFragment } from '../fragments/RepositoryFragment';
import { QueryLookup, QueryLookupParams } from './Lookup';

type SearchQueryLookupParams = {
  limit: number;
  name?: string;
  language?: string;
  org?: string;
};

/**
 *  A lookup to get a user by ID.
 */
export class SearchLookup extends QueryLookup<Repository[], SearchQueryLookupParams> {
  constructor(params: Omit<QueryLookupParams, 'id'> & SearchQueryLookupParams) {
    super({ ...params, id: 'search' });
  }

  toString(): string {
    let name = this.params.name?.toLocaleLowerCase().trim() || '';
    if (name) name = `${name} in:name`;

    const query = [name, 'stars:1..*', 'sort:stars-desc'];

    if (this.params.language) query.push(`language:${this.params.language}`);
    if (this.params.name) query.push(this.params.name);
    if (this.params.org) query.push(`org:${this.params.org}`);

    const total = Math.min(this.params.per_page || 100, this.params.limit);

    const params = [`first: ${total}`, 'type: REPOSITORY', `query: "${query.join(' ')}"`];
    if (this.params.cursor) params.push(`after: "${this.params.cursor}"`);

    return `
    ${this.alias}:search(${params.join(', ')}) {
      pageInfo { hasNextPage endCursor }
      nodes { ...${this.fragments[0].alias} }
    }
    `;
  }

  parse(data: any) {
    data = data[this.alias] || data;
    this.params.limit -= data.nodes.length;
    return {
      next:
        this.params.limit > 0 && data.pageInfo.hasNextPage
          ? new SearchLookup({ ...this.params, cursor: data.pageInfo.endCursor })
          : undefined,
      data: data.nodes.map((data: Repository) => this.fragments[0].parse(data)),
      params: { ...this.params, cursor: data.pageInfo.endCursor }
    };
  }

  get fragments() {
    return [this.params.factory.create(RepositoryFragment)];
  }
}
