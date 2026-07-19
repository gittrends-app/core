import { describe, expect, it } from 'vitest';
import { Fragment, FragmentFactory } from '../fragments/Fragment';
import { DiscussionsLookup } from './DiscussionsLookup';

class FakeActorFragment implements Fragment {
  readonly alias = 'ActorFragment';
  readonly fragments: Fragment[] = [];
  toString(): string {
    return 'fragment ActorFragment on Actor { id }';
  }
  parse(data: any): any {
    return { id: data.id, __typename: 'User' };
  }
}

const factory: FragmentFactory = { create: () => new FakeActorFragment() as any };

function node(overrides: Partial<Record<string, any>> = {}) {
  return {
    __typename: 'Discussion',
    id: 'D_1',
    databaseId: 10,
    activeLockReason: null,
    answer: null,
    answerChosenAt: null,
    answerChosenBy: null,
    author: { id: 'U_1' },
    authorAssociation: 'OWNER',
    body: 'hello',
    category: { name: 'General' },
    closed: false,
    closedAt: null,
    comments: { totalCount: 2 },
    createdAt: '2020-01-01T00:00:00Z',
    createdViaEmail: false,
    editor: null,
    includesCreatedEdit: false,
    isAnswered: false,
    labels: { nodes: [{ name: 'bug' }] },
    lastEditedAt: null,
    locked: false,
    number: 3,
    publishedAt: '2020-01-01T00:00:00Z',
    reactions: { totalCount: 5 },
    stateReason: null,
    title: 'A discussion',
    updatedAt: '2020-01-02T00:00:00Z',
    upvoteCount: 7,
    ...overrides
  };
}

function page(nodes: any[], hasNextPage = false, endCursor: string | null = null) {
  return { discussions: { pageInfo: { hasNextPage, endCursor }, nodes } };
}

describe('DiscussionsLookup', () => {
  const lookup = new DiscussionsLookup({ id: 'R_1', factory });

  it('should select the discussions connection ordered by update date', () => {
    const query = lookup.toString();
    expect(query).toContain('... on Repository');
    expect(query).toContain('discussions(first: 100, orderBy: { field: UPDATED_AT, direction: ASC })');
  });

  it('should map a discussion node to the Discussion entity bound to the repository', () => {
    const res = lookup.parse(page([node()], false, 'cur'));
    expect(res.data[0]).toMatchObject({
      __typename: 'Discussion',
      id: 'D_1',
      repository: 'R_1',
      database_id: 10,
      author: { id: 'U_1', __typename: 'User' },
      category: 'General',
      comments_count: 2,
      labels: ['bug'],
      number: 3,
      reactions_count: 5,
      title: 'A discussion',
      upvote_count: 7
    });
    expect(res.params.cursor).toBe('cur');
  });

  it('should continue while the connection reports another page', () => {
    const res = lookup.parse(page([node()], true, 'cur-1'));
    expect(res.next).toBeInstanceOf(DiscussionsLookup);
    expect(res.next?.params.cursor).toBe('cur-1');
  });
});
