import { PullRequest } from '../../../entities/PullRequest';
import { toPage } from '../../pagination';
import { Iterable } from '../../Service';
import { GithubClient } from '../GithubClient';
import { QueryLookupParams } from '../graphql/lookups/Lookup';
import { PullRequestsLookup } from '../graphql/lookups/PullRequestsLookup';
import { QueryRunner } from '../graphql/QueryRunner';
import { enrichPullRequest } from './enrichment';

/**
 * Get the pull requests of a repository by its id
 */
export default function (client: GithubClient, opts: QueryLookupParams): Iterable<PullRequest> {
  return {
    [Symbol.asyncIterator]: async function* () {
      const runner = QueryRunner.create(client);
      const it = runner.iterator(new PullRequestsLookup(opts));

      for await (const res of it) {
        await Promise.all(res.data.map((pullRequest) => enrichPullRequest(pullRequest, opts, runner)));
        yield toPage(res);
      }

      return;
    }
  };
}
