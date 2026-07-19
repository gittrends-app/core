import { describe, expect, it } from 'vitest';
import { BaseFragmentFactory } from './Fragment';
import { IssueFragment } from './IssueFragment';

function issueData() {
  return {
    __typename: 'Issue',
    activeLockReason: null,
    assignedActors: { nodes: [] },
    assignees: { nodes: [] },
    author: null,
    authorAssociation: 'OWNER',
    blockedBy: { totalCount: 1, nodes: [{ id: 'blocked-id' }] },
    blocking: { totalCount: 1, nodes: [{ id: 'blocking-id' }] },
    body: 'Issue body',
    closed: false,
    closedAt: null,
    comments: { totalCount: 2 },
    createdAt: '2026-07-19T00:00:00Z',
    createdViaEmail: false,
    databaseId: 42,
    duplicateOf: null,
    editor: null,
    fullDatabaseId: null,
    id: 'issue-id',
    includesCreatedEdit: false,
    isPinned: false,
    issueType: { name: 'Bug' },
    issueFieldValues: { totalCount: 3 },
    labels: { nodes: [{ name: 'urgent' }] },
    lastEditedAt: null,
    linkedBranches: { nodes: [{ ref: { name: 'fix/issue' } }] },
    locked: false,
    milestone: { title: 'v1' },
    number: 7,
    parent: { id: 'parent-id' },
    participants: { totalCount: 4 },
    pinnedIssueComment: { id: 'comment-id' },
    publishedAt: null,
    reactions: { totalCount: 5 },
    repository: { id: 'repository-id' },
    state: 'OPEN',
    timelineItems: { totalCount: 6 },
    title: 'Issue title',
    updatedAt: '2026-07-19T00:00:00Z'
  };
}

describe('IssueFragment', () => {
  it('keeps each GraphQL selection next to its entity mapping', () => {
    const fragment = new IssueFragment('IssueTest', { factory: new BaseFragmentFactory() });
    const query = fragment.toString();

    expect(query).toContain('blockedBy(first: 100) { totalCount nodes { id } }');
    expect(query.match(/blockedBy\(first: 100\)/g)).toHaveLength(1);
    expect(query).toContain('linkedBranches(first: 100) { nodes { ref { name } } }');
  });

  it('maps the selected fields into the Issue entity', () => {
    const fragment = new IssueFragment('IssueTest', { factory: new BaseFragmentFactory() });
    const result = fragment.parse(issueData() as never);

    expect(result).toMatchObject({
      __typename: 'Issue',
      id: 'issue-id',
      repository: 'repository-id',
      blocked_by: ['blocked-id'],
      blocked_by_count: 1,
      blocking: ['blocking-id'],
      blocking_count: 1,
      labels: ['urgent'],
      linked_branches: ['fix/issue'],
      comments_count: 2,
      timeline_items_count: 6
    });
  });
});
