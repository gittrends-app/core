import { describe, expect, it } from 'vitest';
import { BaseFragmentFactory } from './Fragment';
import { PullRequestReviewCommentFragment } from './PullRequestReviewCommentFragment';

describe('PullRequestReviewCommentFragment', () => {
  it('keeps each GraphQL selection next to its entity mapping', () => {
    const fragment = new PullRequestReviewCommentFragment('PrrcTest', { factory: new BaseFragmentFactory() });
    const query = fragment.toString();

    expect(query).toContain('fragment PrrcTest on PullRequestReviewComment');
    expect(query).toContain('commit { id }');
    expect(query).toContain('originalCommit { id }');
    expect(query).toContain('pullRequestReview { id }');
    expect(query).toContain('replyTo { id }');
    expect(query).toContain('reactions { totalCount }');
  });

  it('maps the selected fields into the entity', () => {
    const fragment = new PullRequestReviewCommentFragment('PrrcTest', { factory: new BaseFragmentFactory() });
    const result = fragment.parse({
      id: 'comment-id',
      __typename: 'PullRequestReviewComment',
      author: null,
      authorAssociation: 'MEMBER',
      body: 'body',
      createdAt: '2026-07-19T00:00:00Z',
      createdViaEmail: false,
      editor: null,
      includesCreatedEdit: false,
      lastEditedAt: null,
      publishedAt: null,
      updatedAt: '2026-07-19T00:00:00Z',
      commit: { id: 'commit-id' },
      diffHunk: '@@ -1 +1 @@',
      draftedAt: '2026-07-19T00:00:00Z',
      fullDatabaseId: null,
      isMinimized: false,
      line: 10,
      minimizedReason: null,
      originalCommit: { id: 'orig-commit-id' },
      originalLine: 9,
      originalStartLine: null,
      outdated: false,
      path: 'src/index.ts',
      pullRequestReview: { id: 'review-id' },
      reactions: { totalCount: 2 },
      replyTo: null,
      startLine: null,
      state: 'SUBMITTED',
      subjectType: 'LINE'
    } as never);

    expect(result).toMatchObject({
      id: 'comment-id',
      __typename: 'PullRequestReviewComment',
      commit: 'commit-id',
      original_commit: 'orig-commit-id',
      pull_request_review: 'review-id',
      reactions_count: 2,
      path: 'src/index.ts'
    });
  });
});
