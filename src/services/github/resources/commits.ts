import { Commit } from '../../../entities/Commit';
import { Iterable } from '../../Service';
import { GithubClient } from '../GithubClient';
import { CommitsLookup } from '../graphql/lookups/CommitsLookup';
import { QueryLookupParams } from '../graphql/lookups/Lookup';
import { QueryRunner } from '../graphql/QueryRunner';

/**
 * Get the commits of a repository by its id
 *
 */
export default function commits(
  client: GithubClient,
  opts: QueryLookupParams & { since?: Date; until?: Date }
): Iterable<Commit, { since?: Date; until?: Date }> {
  return {
    [Symbol.asyncIterator]: async function* () {
      let { since, until } = opts;

      const untilIt = QueryRunner.create(client).iterator(new CommitsLookup(opts));

      for await (const response of untilIt) {
        if (!until) until = response.params.until;
        if (response.params.since) since = response.params.since;

        yield {
          data: response.data,
          metadata: {
            has_more: !!response.next,
            since,
            until,
            per_page: opts.per_page
          }
        };
      }
    }
  };
}
