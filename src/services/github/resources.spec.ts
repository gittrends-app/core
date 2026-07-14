import type { Fetch } from '@octokit/types';
import { describe, expect, it } from 'vitest';
import { GithubClient } from './GithubClient';
import { BaseFragmentFactory } from './graphql/fragments/Fragment';
import issues from './resources/issues';

const factory = new BaseFragmentFactory();

function issue(id: string) {
  return {
    __typename: 'Issue',
    activeLockReason: null,
    assignedActors: { nodes: [] },
    assignees: { nodes: [] },
    author: null,
    authorAssociation: 'NONE',
    blockedBy: { totalCount: 0, nodes: [] },
    blocking: { totalCount: 0, nodes: [] },
    body: '',
    closed: false,
    closedAt: null,
    comments: { totalCount: 0 },
    createdAt: '2026-01-01T00:00:00.000Z',
    createdViaEmail: false,
    databaseId: 1,
    duplicateOf: null,
    editor: null,
    fullDatabaseId: 1,
    id,
    includesCreatedEdit: false,
    isPinned: false,
    issueType: null,
    issueFieldValues: { totalCount: 0 },
    labels: { nodes: [] },
    lastEditedAt: null,
    linkedBranches: { nodes: [] },
    locked: false,
    milestone: null,
    number: 1,
    parent: null,
    participants: { totalCount: 0 },
    pinnedIssueComment: null,
    publishedAt: null,
    reactions: { totalCount: 1 },
    repository: { id: 'repository-id' },
    state: 'OPEN',
    timelineItems: { totalCount: 0 },
    title: id,
    updatedAt: '2026-01-01T00:00:00.000Z'
  };
}

function response(data: unknown): Response {
  return new Response(JSON.stringify({ data }), {
    headers: { 'content-type': 'application/json' },
    status: 200
  });
}

function requestQuery(init?: RequestInit): string {
  return JSON.parse(String(init?.body)).query;
}

function issueResponse() {
  return {
    repository: {
      issues: {
        nodes: [issue('issue-one'), issue('issue-two')],
        pageInfo: { endCursor: null, hasNextPage: false }
      }
    }
  };
}

function reactionResponse(id: string) {
  return {
    [id.replace(/[^a-zA-Z0-9]/g, '')]: {
      reactions: {
        nodes: [
          {
            __typename: 'Reaction',
            content: 'THUMBS_UP',
            createdAt: '2026-01-01T00:00:00.000Z',
            databaseId: 1,
            id: `${id}-reaction`,
            reactable: { __typename: 'Issue', id },
            user: null
          }
        ],
        pageInfo: { endCursor: null, hasNextPage: false }
      }
    }
  };
}

function resourceOptions() {
  return { factory, id: 'repository', per_page: 2 };
}

describe('GitHub resource enrichment', () => {
  it('waits for queued enrichment and preserves source order and completeness', async () => {
    let active = 0;
    let maximumActive = 0;
    let firstReactionStarted!: () => void;
    let secondReactionStarted!: () => void;
    let releaseFirst!: () => void;
    let releaseSecond!: () => void;
    const firstStarted = new Promise<void>((resolve) => (firstReactionStarted = resolve));
    const secondStarted = new Promise<void>((resolve) => (secondReactionStarted = resolve));
    const firstGate = new Promise<void>((resolve) => (releaseFirst = resolve));
    const secondGate = new Promise<void>((resolve) => (releaseSecond = resolve));

    const fetcher = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);

      try {
        const query = requestQuery(init);
        if (query.includes('issues(')) return response(issueResponse());

        const id = query.match(/node\(id: "([^"]+)"\)/)?.[1] as string;
        if (id === 'issue-one') {
          firstReactionStarted();
          await firstGate;
        } else {
          secondReactionStarted();
          await secondGate;
        }
        return response(reactionResponse(id));
      } finally {
        active -= 1;
      }
    }) as Fetch;

    const client = new GithubClient('https://example.com', { fetcher, maxConcurrentRequests: 1 });
    const iterator = issues(client, resourceOptions())[Symbol.asyncIterator]();
    const pagePromise = iterator.next();

    await firstStarted;
    let yielded = false;
    void pagePromise.then(() => (yielded = true));
    await Promise.resolve();
    expect(yielded).toBe(false);

    releaseFirst();
    await secondStarted;
    expect(yielded).toBe(false);

    releaseSecond();
    const page = await pagePromise;

    expect(page.done).toBe(false);
    expect(page.value?.data.map((value: { id: string }) => value.id)).toEqual(['issue-one', 'issue-two']);
    expect(page.value?.data.every((value: { reactions?: unknown[] }) => value.reactions?.length === 1)).toBe(true);
    expect(maximumActive).toBe(1);
  });

  it('propagates a nested enrichment failure instead of yielding incomplete data', async () => {
    const failure = new Error('nested enrichment failed');
    const fetcher = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (requestQuery(init).includes('reactions(')) throw failure;
      return response(issueResponse());
    }) as Fetch;
    const client = new GithubClient('https://example.com', { fetcher });
    const iterator = issues(client, resourceOptions())[Symbol.asyncIterator]();

    await expect(iterator.next()).rejects.toThrow('nested enrichment failed');
  });
});
