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

    try {
      const response = await this.client.graphql<Record<string, any>>(QueryRunner.toString(lookups), {});
      return lookups.map((lookup) => lookup.parse(response[lookup.alias]));
    } catch (error) {
      const response = getResponse(error);
      const errors = Array.isArray(response?.errors) ? response.errors : [];

      if (response?.status === 200 || error instanceof GraphqlResponseError) {
        if (errors.length > 0 && errors.every((entry) => entry.type === 'NOT_FOUND')) {
          const data = (error as GraphqlResponseError<any>).data || {};
          return lookups.map((lookup) => lookup.parse(data[lookup.alias]));
        }
        if (
          errors.length > 0 &&
          (errors.every((entry) => entry.type === 'FORBIDDEN') ||
            errors.every((entry) => entry.type === 'SERVICE_UNAVAILABLE'))
        ) {
          const data = sanitize((error as GraphqlResponseError<any>).data, (value) => value === null, true) || {};
          return lookups.map((lookup) => lookup.parse(data[lookup.alias]));
        }
      }

      if (isTransient(error) && lookups.some((lookup) => (lookup.params.per_page || 0) > 1)) {
        const retriedLookups = lookups.map((lookup) => {
          const pageSize = lookup.params.per_page;
          return pageSize && pageSize > 1 ? cloneLookup(lookup, { per_page: Math.ceil(pageSize / 2) }) : lookup;
        });

        return this.fetchBatch(retriedLookups);
      }

      throw withLookupContext(error, lookups);
    }
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

function getResponse(error: unknown): { status?: number; errors?: Array<{ type?: string }> } | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const response = (error as { response?: unknown }).response;
  return response && typeof response === 'object'
    ? (response as { status?: number; errors?: Array<{ type?: string }> })
    : undefined;
}

function isTransient(error: unknown): boolean {
  const response = getResponse(error);
  const status =
    response?.status ?? (error && typeof error === 'object' ? (error as { status?: number }).status : undefined);
  return status !== undefined && [500, 502, 504].includes(status);
}

function cloneLookup<R, P>(lookup: QueryLookup<R, P>, params: { per_page?: number }): QueryLookup<R, P> {
  const clone = Object.create(Object.getPrototypeOf(lookup)) as QueryLookup<R, P>;
  Object.assign(clone, lookup, { params: { ...lookup.params, ...params } });
  return clone;
}

function withLookupContext(error: unknown, lookups: QueryLookup<unknown, unknown>[]): Error {
  const context = lookups.map((lookup) => ({ alias: lookup.alias }));
  if (error instanceof Error) {
    Object.assign(error, { lookups: context });
    return error;
  }

  return Object.assign(new Error('GitHub GraphQL request failed.', { cause: error }), { lookups: context });
}
