import { GraphqlResponseError } from '@octokit/graphql';
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
 */
export class QueryRunner {
  private constructor(private readonly client: GithubClient) {}

  public static create(client: GithubClient): QueryRunner {
    return new QueryRunner(client);
  }

  public static toString(lookup: QueryLookup<any, any>): string {
    return `query { 
      ${lookup.toString()} 
    }
      
    ${[
      ...new Set(
        lookup.fragments
          .map(resolveFragment)
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

  public async fetch<R, P>(lookup: QueryLookup<R, P>): Promise<ReturnType<QueryLookup<R, P>['parse']>> {
    return this.client
      .graphql<Record<string, any>>(QueryRunner.toString(lookup), {})
      .catch((error) => {
        const only = (type: string) =>
          (error.response.errors as Array<{ type: string }>).every((err) => err.type === type);

        if (error.response?.status === 200 || error instanceof GraphqlResponseError) {
          if (only('NOT_FOUND')) return error.data;
          if (only('FORBIDDEN') || only('SERVICE_UNAVAILABLE')) return sanitize(error.data, (v) => v === null, true);
        }
        throw Object.assign(error, { lookup });
      })
      .then((response) => lookup.parse(response[lookup.alias]))
      .catch((error) => {
        if ([500, 502, 504].includes(error.response?.status || error.status) && (lookup.params.per_page || 100) > 1) {
          lookup.params.per_page = Math.ceil((lookup.params.per_page || 100) / 2);
          return this.fetch(lookup).then((response) => {
            if (response.next) response.next.params.per_page = lookup.params.per_page! * 2;
            return response;
          });
        }
        throw error;
      });
  }

  public async fetchAll<R, P>(lookup: QueryLookup<R, P>) {
    const responses: ReturnType<(typeof lookup)['parse']>[] = [];
    for await (const res of this.iterator(lookup)) responses.push(res);

    return { data: responses.map((res) => res.data).flat(), params: responses.at(-1)!.params };
  }

  iterator<R, P>(lookup: QueryLookup<R, P>) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: QueryRunner = this;

    return {
      [Symbol.asyncIterator]: async function* () {
        do {
          const response = await self.fetch(lookup);
          yield response;

          if (!response.next) break;
          else lookup = response.next;
        } while (true);
      }
    };
  }
}
