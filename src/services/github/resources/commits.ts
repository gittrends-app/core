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

      if (until || !since) {
        const untilIt = QueryRunner.create(client).iterator(new CommitsLookup({ ...opts, since: undefined, until }));

        for await (const response of untilIt) {
          yield {
            data: response.data,
            metadata: {
              has_more: !!response.next,
              since: (since = response.params.since
                ? new Date(Math.max(response.params.since.getTime(), since?.getTime() || 0))
                : since),
              until: (until = response.params.until),
              per_page: opts.per_page
            }
          };
        }
      }

      if (since) {
        const sinceIt = QueryRunner.create(client).iterator(new CommitsLookup({ ...opts, since, until: undefined }));

        for await (const response of sinceIt) {
          yield {
            data: response.data,
            metadata: {
              has_more: !!response.next,
              since: new Date(Math.max(response.params.since?.getDate() || 0, since.getTime())),
              until,
              per_page: opts.per_page
            }
          };
        }
      }
    }
  };
}
