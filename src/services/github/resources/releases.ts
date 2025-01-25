import { Release } from '../../../entities/Release';
import { Iterable } from '../../Service';
import { GithubClient } from '../GithubClient';
import { QueryLookupParams } from '../graphql/lookups/Lookup';
import { ReactionsLookup } from '../graphql/lookups/ReactionsLookup';
import { ReleasesLookup } from '../graphql/lookups/ReleasesLookup';
import { QueryRunner } from '../graphql/QueryRunner';

/**
 * Get the releases of a repository by its id
 */
export default function (client: GithubClient, opts: QueryLookupParams): Iterable<Release> {
  return {
    [Symbol.asyncIterator]: async function* () {
      const it = QueryRunner.create(client).iterator(new ReleasesLookup(opts));

      for await (const res of it) {
        await Promise.all(
          res.data.map(async (release) => {
            if (release.reactions_count) {
              release.reactions = await QueryRunner.create(client)
                .fetchAll(new ReactionsLookup({ id: release.id, per_page: opts.per_page, factory: opts.factory }))
                .then(({ data }) => data);
            }
          })
        );

        yield {
          data: res.data,
          metadata: { has_more: !!res.next, per_page: res.params.per_page, cursor: res.params.cursor }
        };
      }

      return;
    }
  };
}
