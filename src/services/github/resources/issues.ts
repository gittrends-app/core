import { Issue } from '../../../entities/Issue';
import { toPage } from '../../pagination';
import { Iterable } from '../../Service';
import { GithubClient } from '../GithubClient';
import { IssuesLookup } from '../graphql/lookups/IssuesLookup';
import { QueryLookupParams } from '../graphql/lookups/Lookup';
import { QueryRunner } from '../graphql/QueryRunner';
import { enrichIssue } from './enrichment';

/**
 * Get the issues of a repository by its id
 */
export default function (client: GithubClient, opts: QueryLookupParams): Iterable<Issue> {
  return {
    [Symbol.asyncIterator]: async function* () {
      const runner = QueryRunner.create(client);
      const it = runner.iterator(new IssuesLookup(opts));

      for await (const res of it) {
        await Promise.all(res.data.map((issue) => enrichIssue(issue, opts, runner)));
        yield toPage(res);
      }

      return;
    }
  };
}
