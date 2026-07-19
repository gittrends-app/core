import { describe, expect, it } from 'vitest';
import { BaseFragmentFactory } from './Fragment';
import { PullRequestFragment } from './PullRequestFragment';

describe('PullRequestFragment', () => {
  it('keeps each GraphQL selection next to its entity mapping', () => {
    const fragment = new PullRequestFragment('PullRequestTest', { factory: new BaseFragmentFactory() });
    const query = fragment.toString();

    expect(query).toContain('fragment PullRequestTest on PullRequest');
    expect(query).toContain(`assignedActors(first: 100) { nodes { ...${fragment.fragments[0].alias} } }`);
    expect(query).toContain('autoMergeRequest {');
    expect(query).toContain('baseRepository { nameWithOwner }');
    expect(query).toContain(
      `suggestedReviewers { isAuthor isCommenter reviewer { ...${fragment.fragments[0].alias} } }`
    );
    expect(query).toContain('totalCommentsCount');
  });

  it('maps nested pull request fields into the entity', () => {
    const fragment = new PullRequestFragment('PullRequestTest', { factory: new BaseFragmentFactory() });
    const result = fragment.parse({
      __typename: 'PullRequest',
      activeLockReason: null,
      assignedActors: { nodes: [] },
      assignees: { nodes: [] },
      author: null,
      authorAssociation: 'OWNER',
      body: 'body',
      closed: false,
      closedAt: null,
      comments: { totalCount: 1 },
      createdAt: '2026-07-19T00:00:00Z',
      createdViaEmail: false,
      databaseId: 10,
      editor: null,
      fullDatabaseId: null,
      id: 'pr-id',
      includesCreatedEdit: false,
      labels: { nodes: [{ name: 'bug' }] },
      lastEditedAt: null,
      locked: false,
      milestone: null,
      number: 3,
      participants: { totalCount: 2 },
      publishedAt: null,
      reactions: { totalCount: 0 },
      repository: { id: 'repository-id' },
      state: 'OPEN',
      timelineItems: { totalCount: 4 },
      title: 'title',
      updatedAt: '2026-07-19T00:00:00Z',
      additions: 5,
      autoMergeRequest: null,
      baseRefName: 'main',
      baseRefOid: 'base-oid',
      baseRepository: { nameWithOwner: 'owner/repo' },
      canBeRebased: true,
      changedFiles: 2,
      deletions: 1,
      files: { totalCount: 2 },
      headRefName: 'feature',
      headRefOid: 'head-oid',
      headRepository: { nameWithOwner: 'owner/repo' },
      headRepositoryOwner: { login: 'owner' },
      isCrossRepository: false,
      isDraft: false,
      maintainerCanModify: true,
      mergeCommit: null,
      mergeStateStatus: 'CLEAN',
      mergeable: 'MERGEABLE',
      merged: false,
      mergedAt: null,
      mergedBy: null,
      potentialMergeCommit: null,
      reviewDecision: null,
      reviews: { totalCount: 0 },
      suggestedReviewers: [],
      totalCommentsCount: 1
    } as never);

    expect(result).toMatchObject({
      __typename: 'PullRequest',
      id: 'pr-id',
      repository: 'repository-id',
      labels: ['bug'],
      base_repository: 'owner/repo',
      head_repository_owner: 'owner',
      total_comments_count: 1
    });
  });
});
