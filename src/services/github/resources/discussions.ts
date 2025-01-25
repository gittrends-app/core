import { MergeExclusive } from 'type-fest';
import { Discussion } from '../../../entities/Discussion';
import { DiscussionComment } from '../../../entities/DiscussionComment';
import { Iterable } from '../../Service';
import { GithubClient } from '../GithubClient';
import { DiscussionsCommentsLookup } from '../graphql/lookups/DiscussionsCommentsLookup';
import { DiscussionsLookup } from '../graphql/lookups/DiscussionsLookup';
import { QueryLookupParams } from '../graphql/lookups/Lookup';
import { ReactionsLookup } from '../graphql/lookups/ReactionsLookup';
import { QueryRunner } from '../graphql/QueryRunner';

/**
 *  Recursively retrieve the comments of a discussion.
 */
async function discussionComments(
  client: GithubClient,
  opts: QueryLookupParams & MergeExclusive<{ discussion: string }, { comment: string }>
): Promise<DiscussionComment[]> {
  const res = await QueryRunner.create(client).fetchAll(
    new DiscussionsCommentsLookup({
      id: (opts.discussion || opts.comment) as string,
      isComment: !!opts.comment,
      per_page: opts.per_page,
      factory: opts.factory
    })
  );

  await Promise.all(
    res.data.map(async (comment) => {
      if (comment.reactions_count) {
        comment.reactions = await QueryRunner.create(client)
          .fetchAll(new ReactionsLookup({ id: comment.id, per_page: opts.per_page, factory: opts.factory }))
          .then(({ data }) => data);
      }

      if (comment.replies_count) {
        comment.replies = await discussionComments(client, { ...opts, discussion: undefined, comment: comment.id });
      }
    })
  );

  return res.data;
}

/**
 * Retrieves the discussions of a repository.
 */
export default function (client: GithubClient, opts: QueryLookupParams): Iterable<Discussion> {
  return {
    [Symbol.asyncIterator]: async function* () {
      for await (const searchRes of QueryRunner.create(client).iterator(new DiscussionsLookup(opts))) {
        const data: Discussion[] = searchRes.data;

        await Promise.all(
          data.map(async (discussion) => {
            if (discussion.reactions_count) {
              discussion.reactions = await QueryRunner.create(client)
                .fetchAll(new ReactionsLookup({ id: discussion.id, per_page: opts.per_page, factory: opts.factory }))
                .then(({ data }) => data);
            }

            if (discussion.comments_count) {
              discussion.comments = await discussionComments(client, { ...opts, discussion: discussion.id });
            }
          })
        );

        yield {
          data,
          metadata: {
            has_more: !!searchRes.next,
            cursor: searchRes.params.cursor,
            per_page: searchRes.params.per_page
          }
        };
      }
    }
  };
}
