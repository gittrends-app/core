import { Commit } from '../../../../entities/Commit';
import { CommitFragment } from '../fragments/CommitFragment';
import { ConnectionDescriptor, ConnectionLookup } from './ConnectionLookup';
import { QueryLookupParams } from './Lookup';

/**
 *  Add seconds to a date.
 */
function add(date: Date, seconds: number): Date {
  return new Date(new Date(date).getTime() + seconds * 1000);
}

/**
 *  A lookup to get repository commits.
 */
export class CommitsLookup extends ConnectionLookup<Commit, { since?: Date; until?: Date }> {
  protected get descriptor(): ConnectionDescriptor {
    return { field: 'history', typeCondition: 'Repository', missingDataError: 'Failed to parse tags.' };
  }

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
                ${this.entriesSelection()}
              }
            }
          }
        }
      }
    }
    `;
  }

  protected extractConnection(data: any): any {
    let defaultBranch = (data[this.alias] || data).defaultBranchRef;
    if (!defaultBranch) {
      // Repository has no branches
      defaultBranch = {
        target: { history: { pageInfo: { hasNextPage: false, endCursor: null }, nodes: [] } }
      };
    }
    return defaultBranch.target.history;
  }

  protected entriesSelection(): string {
    return `nodes {
                  ...${this.fragments[0].alias}
                }`;
  }

  protected mapEntry(entry: any): Commit {
    return this.fragments[0].parse(entry);
  }

  protected nextParams(parsed: Commit[]): Partial<QueryLookupParams & { since?: Date; until?: Date }> {
    return {
      since: parsed.at(-1)?.committed_date || this.params.since,
      until: parsed.at(0)?.committed_date || this.params.until
    };
  }

  get fragments(): [CommitFragment] {
    return [this.params.factory.create(CommitFragment)];
  }
}
