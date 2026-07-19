import { describe, expect, it } from 'vitest';
import { Fragment, FragmentFactory } from '../fragments/Fragment';
import { DiscussionsCommentsLookup } from './DiscussionsCommentsLookup';

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
    __typename: 'DiscussionComment',
    author: { id: 'U_1' },
    authorAssociation: 'OWNER',
    body: 'a comment',
    createdAt: '2020-01-01T00:00:00Z',
    createdViaEmail: false,
    databaseId: 20,
    deletedAt: null,
    discussion: { id: 'D_1' },
    editor: null,
    id: 'DC_1',
    includesCreatedEdit: false,
    isAnswer: false,
    isMinimized: false,
    lastEditedAt: null,
    minimizedReason: null,
    publishedAt: '2020-01-01T00:00:00Z',
    reactions: { totalCount: 1 },
    replies: { totalCount: 4 },
    replyTo: null,
    updatedAt: '2020-01-02T00:00:00Z',
    upvoteCount: 2,
    ...overrides
  };
}

function page(nodes: any[], hasNextPage = false, endCursor: string | null = null) {
  return { comments: { pageInfo: { hasNextPage, endCursor }, nodes } };
}

describe('DiscussionsCommentsLookup', () => {
  it('should select discussion comments by default', () => {
    const query = new DiscussionsCommentsLookup({ id: 'D_1', factory }).toString();
    expect(query).toContain('... on Discussion');
    expect(query).toContain('comments:comments(first: 100)');
  });

  it('should select replies when reading a comment thread', () => {
    const query = new DiscussionsCommentsLookup({ id: 'DC_1', factory, isComment: true }).toString();
    expect(query).toContain('... on DiscussionComment');
    expect(query).toContain('comments:replies(first: 100)');
  });

  it('should map a comment node to the DiscussionComment entity', () => {
    const lookup = new DiscussionsCommentsLookup({ id: 'D_1', factory });
    const res = lookup.parse(page([node()]));
    expect(res.data[0]).toMatchObject({
      __typename: 'DiscussionComment',
      id: 'DC_1',
      database_id: 20,
      discussion: 'D_1',
      author: { id: 'U_1', __typename: 'User' },
      reactions_count: 1,
      replies_count: 4,
      upvote_count: 2
    });
  });

  it('should throw when the comments connection is missing', () => {
    const lookup = new DiscussionsCommentsLookup({ id: 'D_1', factory });
    expect(() => lookup.parse({ comments: undefined })).toThrowError('Invalid data');
  });
});
