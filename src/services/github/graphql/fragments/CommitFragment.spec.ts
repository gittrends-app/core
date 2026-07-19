import { describe, expect, it } from 'vitest';
import { CommitFragment } from './CommitFragment';
import { BaseFragmentFactory } from './Fragment';

describe('CommitFragment', () => {
  it('keeps each GraphQL selection next to its entity mapping', () => {
    const fragment = new CommitFragment('CommitTest', { factory: new BaseFragmentFactory() });
    const query = fragment.toString();

    expect(query).toContain('fragment CommitTest on Commit');
    expect(query).toContain('parents(first: 100) { nodes { oid } }');
    expect(query).toContain('comments { totalCount }');
    expect(query).toContain('deployments { totalCount }');
    expect(query).toContain('status { state }');
  });

  it('maps the selected fields into the Commit entity', () => {
    const fragment = new CommitFragment('CommitTest', { factory: new BaseFragmentFactory() });
    const result = fragment.parse({
      __typename: 'Commit',
      additions: 3,
      author: { date: '2026-07-19T00:00:00Z', email: 'a@b.com', name: 'Author', user: null },
      authoredByCommitter: true,
      authoredDate: '2026-07-19T00:00:00Z',
      changedFilesIfAvailable: 2,
      comments: { totalCount: 1 },
      committedDate: '2026-07-19T00:00:00Z',
      committedViaWeb: false,
      committer: { date: '2026-07-19T00:00:00Z', email: 'c@d.com', name: 'Committer', user: null },
      deletions: 1,
      deployments: { totalCount: 0 },
      id: 'commit-id',
      message: 'message',
      messageBody: 'body',
      messageHeadline: 'headline',
      oid: 'deadbeef',
      parents: { nodes: [{ oid: 'parent-oid' }] },
      repository: { id: 'repository-id' },
      status: { state: 'SUCCESS' }
    } as never);

    expect(result).toMatchObject({
      __typename: 'Commit',
      id: 'commit-id',
      oid: 'deadbeef',
      repository: 'repository-id',
      additions: 3,
      deletions: 1,
      comments_count: 1,
      deployments_count: 0,
      parents: ['parent-oid'],
      status: 'SUCCESS'
    });
  });
});
