import { Commentable } from '../../../entities/base/Commentable';
import { Node } from '../../../entities/base/Node';
import { Reactable } from '../../../entities/base/Reactable';
import { Issue } from '../../../entities/Issue';
import { PullRequest } from '../../../entities/PullRequest';
import { TimelineItem } from '../../../entities/TimelineItem';
import { QueryLookup, QueryLookupParams } from '../graphql/lookups/Lookup';
import { PullRequestsReviewThreadsLookup } from '../graphql/lookups/PullRequestsReviewThreadsLookup';
import { ReactionsLookup } from '../graphql/lookups/ReactionsLookup';
import { TimelineItemsCommentsLookup } from '../graphql/lookups/TimelineItemsCommentsLookup';
import { TimelineItemsLookup } from '../graphql/lookups/TimelineItemsLookup';

export interface EnrichmentRunner {
  fetch<R, P>(lookup: QueryLookup<R, P>): Promise<ReturnType<QueryLookup<R, P>['parse']>>;
  fetchAll<R>(lookup: QueryLookup<R, any>): Promise<{ data: R; params: any }>;
}

type EnrichmentOptions = Pick<QueryLookupParams, 'factory' | 'per_page'>;
type PullRequestReview = Extract<TimelineItem, { __typename: 'PullRequestReview' }>;

export async function enrichIssue(issue: Issue, opts: EnrichmentOptions, runner: EnrichmentRunner): Promise<void> {
  await enrichReactable(issue, opts, runner);

  if (!issue.timeline_items_count) return;

  const timelineItems = await fetchTimelineItems(issue.id, 'Issue', opts, runner);
  issue.timeline_items = timelineItems;

  await Promise.all(
    timelineItems
      .filter((item) => item.__typename === 'IssueComment')
      .map((comment) => enrichReactable(comment as Reactable, opts, runner))
  );
}

export async function enrichPullRequest(
  pullRequest: PullRequest,
  opts: EnrichmentOptions,
  runner: EnrichmentRunner
): Promise<void> {
  await enrichReactable(pullRequest, opts, runner);

  if (!pullRequest.timeline_items_count) return;

  const timelineItems = await fetchTimelineItems(pullRequest.id, 'PullRequest', opts, runner);
  pullRequest.timeline_items = timelineItems;

  await fetchCommentableComments(timelineItems, opts, runner);
  await stitchReviewThreads(pullRequest.id, timelineItems, opts, runner);
  await fetchTimelineReactions(timelineItems, opts, runner);
}

async function enrichReactable(item: Reactable, opts: EnrichmentOptions, runner: EnrichmentRunner): Promise<void> {
  if (!item.reactions_count) return;

  item.reactions = await runner
    .fetchAll(new ReactionsLookup({ id: item.id, per_page: opts.per_page, factory: opts.factory }))
    .then(({ data }) => data);
}

async function fetchTimelineItems(
  id: string,
  type: 'Issue' | 'PullRequest',
  opts: EnrichmentOptions,
  runner: EnrichmentRunner
): Promise<TimelineItem[]> {
  return runner
    .fetchAll(new TimelineItemsLookup({ id, type, per_page: opts.per_page, factory: opts.factory }))
    .then(({ data }) => data);
}

async function fetchCommentableComments(
  timelineItems: TimelineItem[],
  opts: EnrichmentOptions,
  runner: EnrichmentRunner
): Promise<void> {
  const commentables = timelineItems.filter(
    (item) => ((item as Partial<Commentable>).comments_count || 0) > 0
  ) as (Node & Commentable)[];

  await Promise.all(
    commentables.map(async (commentable) => {
      commentable.comments = await runner
        .fetch(new TimelineItemsCommentsLookup({ id: commentable.id, per_page: 100, factory: opts.factory }))
        .then(({ data }) => data.comments);
    })
  );
}

async function stitchReviewThreads(
  pullRequestId: string,
  timelineItems: TimelineItem[],
  opts: EnrichmentOptions,
  runner: EnrichmentRunner
): Promise<void> {
  const reviews = timelineItems.filter((item): item is PullRequestReview => item.__typename === 'PullRequestReview');
  if (reviews.length === 0) return;

  const threads = await runner.fetchAll(
    new PullRequestsReviewThreadsLookup({ id: pullRequestId, per_page: opts.per_page, factory: opts.factory })
  );

  for (const review of reviews) {
    review.comments = review.comments
      ?.map((comment) => {
        const thread = threads.data.find((entry) =>
          entry.comments?.some((threadComment) => threadComment.id === comment.id)
        );
        return thread?.comments || [comment];
      })
      .flat();
  }
}

async function fetchTimelineReactions(
  timelineItems: TimelineItem[],
  opts: EnrichmentOptions,
  runner: EnrichmentRunner
): Promise<void> {
  const reactables = timelineItems.reduce((items: Reactable[], item) => {
    switch (item.__typename) {
      case 'IssueComment':
        return [...items, item];
      case 'PullRequestCommitCommentThread':
      case 'PullRequestReviewThread':
        return [...items, ...(item.comments || [])];
      case 'PullRequestReview':
        return [...items, item, ...(item.comments || [])];
      default:
        return items;
    }
  }, []);

  await Promise.all(reactables.map((item) => enrichReactable(item, opts, runner)));
}
