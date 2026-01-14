import { GraphqlResponseError } from '@octokit/graphql';
import { Arrayable } from 'type-fest';
import sanitize from '../../../helpers/sanitize';
import { GithubClient } from '../GithubClient';
import { Fragment } from './fragments/Fragment';
import { QueryLookup } from './lookups/Lookup';

/**
 *  Recursively resolve fragments.
 */
function resolveFragment(fragment: Fragment): Fragment[] {
  return [fragment, ...fragment.fragments.flatMap(resolveFragment)];
}

/**
 *  QueryRunner is a wrapper around the GraphqlClient.query method.
 *  Supports both single lookup and batch (array) lookups.
 */
export class QueryRunner {
  private constructor(private readonly client: GithubClient) {}

  public static create(client: GithubClient): QueryRunner {
    return new QueryRunner(client);
  }

  public static toString(lookups: Arrayable<QueryLookup<any, any>>): string {
    if (!Array.isArray(lookups)) return this.toString([lookups]);

    return `query { 
      ${lookups.map((lookup) => lookup.toString()).join(' ')} 
    }
      
    ${[
      ...new Set(
        lookups
          .map((lookup) => lookup.fragments.map(resolveFragment).flat())
          .flat()
          .map((fragment) => fragment.toString())
      )
    ].join('\n')}
    `
      .split('\n')
      .filter((l) => !l.trim().startsWith('#'))
      .join('\n')
      .replace(/\s+/g, ' ');
  }

  public async fetch<R, P>(lookup: QueryLookup<R, P>): Promise<ReturnType<QueryLookup<R, P>['parse']>>;
  public async fetch<R, P>(lookups: QueryLookup<R, P>[]): Promise<Array<ReturnType<QueryLookup<R, P>['parse']>>>;
  public async fetch<R, P>(lookupOrArray: Arrayable<QueryLookup<R, P>>): Promise<any> {
    if (Array.isArray(lookupOrArray)) return this.fetchBatch(lookupOrArray);
    return this.fetchSingle(lookupOrArray);
  }

  private async fetchSingle<R, P>(lookup: QueryLookup<R, P>): Promise<ReturnType<QueryLookup<R, P>['parse']>> {
    return this.fetchBatch([lookup]).then(([result]) => result);
  }

  private async fetchBatch<R, P>(lookups: QueryLookup<R, P>[]): Promise<Array<ReturnType<QueryLookup<R, P>['parse']>>> {
    // Validate unique aliases
    if (new Set<string>(lookups.map((l) => l.alias)).size !== lookups.length) {
      throw new Error(`Lookups must have unique aliases.`);
    }

    // Execute batch query with combined error handling
    return this.client
      .graphql<Record<string, any>>(QueryRunner.toString(lookups), {})
      .catch((error) => {
        const only = (type: string) =>
          (error.response.errors as Array<{ type: string }>).every((err) => err.type === type);

        if (error.response?.status === 200 || error instanceof GraphqlResponseError) {
          if (only('NOT_FOUND')) return error.data;
          if (only('FORBIDDEN') || only('SERVICE_UNAVAILABLE')) return sanitize(error.data, (v) => v === null, true);
        }
        throw Object.assign(error, { lookups: lookups.map((l) => ({ alias: l.alias })) });
      })
      .then((res) => lookups.map((lookup) => lookup.parse(res[lookup.alias])))
      .catch((error) => {
        // Retry with reduced page sizes on server errors
        if ([500, 502, 504].includes(error.response?.status || error.status) || error instanceof GraphqlResponseError) {
          // Save original per_page values and set to 0 for initial request
          const pageSizes = lookups.map((lookup) => lookup.params.per_page);
          // Reduce page sizes by half for retry
          if (lookups.some((lookup) => (lookup.params.per_page || 100) > 1)) {
            lookups.forEach((lookup) => {
              if ((lookup.params.per_page || 100) > 1) {
                lookup.params.per_page = Math.ceil((lookup.params.per_page || 100) / 2);
              }
            });
            return this.fetchBatch(lookups).then((data) => {
              // restore page sizes after successful retry
              lookups.forEach((lookup) => {
                lookup.params.per_page = pageSizes[lookups.indexOf(lookup)];
              });
              return data;
            });
          }
        }
        throw Object.assign(error, { lookups });
      });
  }

  public async fetchAll<R, P>(lookup: QueryLookup<R, P>): Promise<{ data: R; params: P }>;
  public async fetchAll<R, P>(lookups: QueryLookup<R, P>[]): Promise<Array<{ data: R; params: P }>>;
  public async fetchAll<R, P>(lookupOrArray: Arrayable<QueryLookup<R, P>>): Promise<any> {
    if (Array.isArray(lookupOrArray)) {
      return Promise.all(lookupOrArray.map((lookup) => this.fetchAll(lookup)));
    }

    const responses: ReturnType<(typeof lookupOrArray)['parse']>[] = [];
    for await (const res of this.iterator(lookupOrArray)) responses.push(res);
    return { data: responses.map((res) => res.data).flat(), params: responses.at(-1)!.params };
  }

  public iterator<R, P>(lookup: QueryLookup<R, P>) {
    const self: QueryRunner = this;

    return {
      [Symbol.asyncIterator]: async function* () {
        do {
          const response = await self.fetchSingle(lookup);
          yield response;

          if (!response.next) break;
          else lookup = response.next;
        } while (true);
      }
    };
  }
}
