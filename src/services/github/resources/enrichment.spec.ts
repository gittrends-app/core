import { describe, expect, it, vi } from 'vitest';
import { Issue } from '../../../entities/Issue';
import { PullRequest } from '../../../entities/PullRequest';
import { TimelineItem } from '../../../entities/TimelineItem';
import { BaseFragmentFactory } from '../graphql/fragments/Fragment';
import { QueryLookup } from '../graphql/lookups/Lookup';
import { PullRequestsReviewThreadsLookup } from '../graphql/lookups/PullRequestsReviewThreadsLookup';
import { ReactionsLookup } from '../graphql/lookups/ReactionsLookup';
import { TimelineItemsCommentsLookup } from '../graphql/lookups/TimelineItemsCommentsLookup';
import { TimelineItemsLookup } from '../graphql/lookups/TimelineItemsLookup';
import { EnrichmentRunner, enrichIssue, enrichPullRequest } from './enrichment';

const factory = new BaseFragmentFactory();
const opts = { factory, per_page: 25 };

function runnerFor(options: {
  fetch?: (lookup: QueryLookup<unknown, any>) => unknown;
  fetchAll?: (lookup: QueryLookup<unknown, any>) => unknown;
}) {
  const fetch = vi.fn(async <R, P>(lookup: QueryLookup<R, P>) => {
    return (options.fetch?.(lookup as QueryLookup<unknown, any>) ?? { data: {}, params: {} }) as ReturnType<
      QueryLookup<R, P>['parse']
    >;
  });
  const fetchAll = vi.fn(async <R>(lookup: QueryLookup<R, any>) => {
    return (options.fetchAll?.(lookup as QueryLookup<unknown, any>) ?? { data: [], params: {} }) as {
      data: R;
      params: any;
    };
  });

  return { runner: { fetch, fetchAll } as EnrichmentRunner, fetch, fetchAll };
}

function issue(counts: Partial<Pick<Issue, 'reactions_count' | 'timeline_items_count'>> = {}) {
  return {
    id: 'issue-1',
    reactions_count: 0,
    timeline_items_count: 0,
    ...counts
  } as Issue;
}

function pullRequest(counts: Partial<Pick<PullRequest, 'reactions_count' | 'timeline_items_count'>> = {}) {
  return {
    id: 'pull-request-1',
    reactions_count: 0,
    timeline_items_count: 0,
    ...counts
  } as PullRequest;
}

describe('enrichIssue', () => {
  it('does nothing when the issue has no enrichment counts', async () => {
    const { runner, fetch, fetchAll } = runnerFor({});

    await enrichIssue(issue(), opts, runner);

    expect(fetch).not.toHaveBeenCalled();
    expect(fetchAll).not.toHaveBeenCalled();
  });

  it('enriches issue reactions and reactions on timeline comments', async () => {
    const comment = {
      __typename: 'IssueComment',
      id: 'comment-1',
      reactions_count: 1
    } as unknown as Extract<TimelineItem, { __typename: 'IssueComment' }>;
    const timeline = [comment];
    const { runner, fetchAll } = runnerFor({
      fetchAll: (lookup) => {
        if (lookup instanceof TimelineItemsLookup) return { data: timeline, params: {} };
        return { data: [{ id: `${lookup.params.id}-reaction` }], params: {} };
      }
    });
    const target = issue({ reactions_count: 1, timeline_items_count: 1 });

    await enrichIssue(target, opts, runner);

    expect(target.timeline_items).toBe(timeline);
    expect(target.reactions).toEqual([{ id: 'issue-1-reaction' }]);
    expect(comment.reactions).toEqual([{ id: 'comment-1-reaction' }]);
    expect(fetchAll).toHaveBeenCalledTimes(3);
    expect(fetchAll.mock.calls.filter(([lookup]) => lookup instanceof ReactionsLookup)).toHaveLength(2);

    const timelineLookup = fetchAll.mock.calls.find(([lookup]) => lookup instanceof TimelineItemsLookup)?.[0];
    expect(timelineLookup?.params).toMatchObject({ id: 'issue-1', type: 'Issue', per_page: 25, factory });
  });
});

describe('enrichPullRequest', () => {
  it('fetches review comments, stitches threads, and enriches nested reactions', async () => {
    const reviewComment = { id: 'review-comment-1', reactions_count: 1 };
    const review = {
      __typename: 'PullRequestReview',
      id: 'review-1',
      reactions_count: 1,
      comments_count: 1,
      comments: [reviewComment]
    } as unknown as Extract<TimelineItem, { __typename: 'PullRequestReview' }>;
    const threadComment = { id: 'review-comment-1', reactions_count: 1 };
    const timeline = [review];
    const { runner, fetch, fetchAll } = runnerFor({
      fetch: (lookup) => {
        expect(lookup).toBeInstanceOf(TimelineItemsCommentsLookup);
        return { data: { comments: [reviewComment] }, params: {} };
      },
      fetchAll: (lookup) => {
        if (lookup instanceof TimelineItemsLookup) return { data: timeline, params: {} };
        if (lookup instanceof PullRequestsReviewThreadsLookup)
          return { data: [{ comments: [threadComment] }], params: {} };
        return { data: [{ id: `${lookup.params.id}-reaction` }], params: {} };
      }
    });
    const target = pullRequest({ reactions_count: 1, timeline_items_count: 1 });

    await enrichPullRequest(target, opts, runner);

    expect(target.timeline_items).toBe(timeline);
    expect(target.reactions).toEqual([{ id: 'pull-request-1-reaction' }]);
    expect(review.comments).toEqual([threadComment]);
    expect(review.reactions).toEqual([{ id: 'review-1-reaction' }]);
    expect(threadComment).toEqual({
      id: 'review-comment-1',
      reactions_count: 1,
      reactions: [{ id: 'review-comment-1-reaction' }]
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetchAll).toHaveBeenCalledTimes(5);

    const commentsLookup = fetch.mock.calls[0][0];
    expect(commentsLookup.params).toMatchObject({ id: 'review-1', per_page: 100, factory });
    const threadsLookup = fetchAll.mock.calls.find(
      ([lookup]) => lookup instanceof PullRequestsReviewThreadsLookup
    )?.[0];
    expect(threadsLookup?.params).toMatchObject({ id: 'pull-request-1', per_page: 25, factory });
  });
});
