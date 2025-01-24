import { Commentable } from '../../../entities/base/Commentable.js';
import { Node } from '../../../entities/base/Node.js';
import { Reactable } from '../../../entities/base/Reactable.js';
import { PullRequest } from '../../../entities/PullRequest.js';
import { TimelineItem } from '../../../entities/TimelineItem.js';
import { Iterable } from '../../Service.js';
import { GithubClient } from '../GithubClient.js';
import { QueryLookupParams } from '../graphql/lookups/Lookup.js';
import { PullRequestsLookup } from '../graphql/lookups/PullRequestsLookup.js';
import { PullRequestsReviewThreadsLookup } from '../graphql/lookups/PullRequestsReviewThreadsLookup.js';
import { ReactionsLookup } from '../graphql/lookups/ReactionsLookup.js';
import { TimelineItemsCommentsLookup } from '../graphql/lookups/TimelineItemsCommentsLookup.js';
import { TimelineItemsLookup } from '../graphql/lookups/TimelineItemsLookup.js';
import { QueryRunner } from '../graphql/QueryRunner.js';

/**
 * Get the pull requests of a repository by its id
 */
export default function (client: GithubClient, opts: QueryLookupParams): Iterable<PullRequest> {
  return {
    [Symbol.asyncIterator]: async function* () {
      const it = QueryRunner.create(client).iterator(new PullRequestsLookup(opts));

      for await (const res of it) {
        await Promise.all(
          res.data.map(async (pr) => {
            if (pr.reactions_count) {
              pr.reactions = await QueryRunner.create(client)
                .fetchAll(new ReactionsLookup({ id: pr.id, per_page: opts.per_page, factory: opts.factory }))
                .then(({ data }) => data);
            }

            if (pr.timeline_items_count) {
              pr.timeline_items = await QueryRunner.create(client)
                .fetchAll(
                  new TimelineItemsLookup({
                    id: pr.id,
                    type: 'PullRequest',
                    per_page: opts.per_page,
                    factory: opts.factory
                  })
                )
                .then(({ data }) => data);

              const commentables = (pr.timeline_items || []).filter(
                (item) => ((item as Partial<Commentable>).comments_count || 0) > 0
              ) as (Node & Commentable)[];

              await Promise.all(
                commentables.map(async (commentable) => {
                  commentable.comments = await QueryRunner.create(client)
                    .fetch(
                      new TimelineItemsCommentsLookup({ id: commentable.id, per_page: 100, factory: opts.factory })
                    )
                    .then(({ data }) => data.comments);
                  return commentable;
                })
              );

              const pullRequestsReviews = (pr.timeline_items || []).filter(
                (item) => (item as TimelineItem).__typename === 'PullRequestReview'
              );

              if (pullRequestsReviews.length > 0) {
                const threads = await QueryRunner.create(client).fetchAll(
                  new PullRequestsReviewThreadsLookup({
                    id: pr.id,
                    per_page: opts.per_page,
                    factory: opts.factory
                  })
                );

                for (const prr of pullRequestsReviews) {
                  (prr as any).comments = (prr as Commentable).comments
                    ?.map((comment) => {
                      const thread = threads.data.find((t) => t.comments?.some((c) => c.id === comment.id));
                      return thread?.comments || [comment];
                    })
                    .flat();
                }
              }

              const reatables = pr.timeline_items!.reduce((reactables: Reactable[], item) => {
                if (typeof item === 'string') return reactables;
                switch (item.__typename) {
                  case 'IssueComment':
                    return [...reactables, item];
                  case 'PullRequestCommitCommentThread':
                  case 'PullRequestReviewThread':
                    return [...reactables, ...(item.comments || [])];
                  case 'PullRequestReview':
                    return [...reactables, item, ...(item.comments || [])];
                  default:
                    return reactables;
                }
              }, []);

              await Promise.all(
                reatables.map(async (reactable) => {
                  if (reactable.reactions_count) {
                    reactable.reactions = await QueryRunner.create(client)
                      .fetchAll(
                        new ReactionsLookup({ id: reactable.id, per_page: opts.per_page, factory: opts.factory })
                      )
                      .then(({ data }) => data);
                  }
                })
              );
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
