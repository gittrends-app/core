import { DiscussionComment, DiscussionCommentSchema } from '../../../../entities/DiscussionComment';
import { DiscussionCommentConnection } from '../../graphql-schema';
import { ActorFragment } from '../fragments/ActorFragment';
import { QueryLookup } from './Lookup';

/**
 *  A lookup to get repository discussions comments.
 */
export class DiscussionsCommentsLookup extends QueryLookup<DiscussionComment[], { isComment?: boolean }> {
  toString(): string {
    const params = [`first: ${this.params.per_page || 100}`];
    if (this.params.cursor) params.push(`after: "${this.params.cursor}"`);

    return `
    ${this.alias}:node(id: "${this.params.id}") {
      ... on ${this.params.isComment ? 'DiscussionComment' : 'Discussion'} {
        comments:${this.params.isComment ? 'replies' : 'comments'}(${params.join(', ')}) {
          pageInfo { hasNextPage endCursor }  
          nodes {
            __typename
            author { ...${this.fragments[0].alias} }
            authorAssociation
            body
            createdAt
            createdViaEmail
            databaseId
            deletedAt
            discussion { id }
            editor { ...${this.fragments[0].alias} }
            id
            includesCreatedEdit
            isAnswer
            isMinimized
            lastEditedAt
            minimizedReason
            publishedAt
            reactions { totalCount }
            replies { totalCount }
            replyTo { id }
            updatedAt
            upvoteCount
          }
        }
      }
    }
    `;
  }

  parse(data: any) {
    const _data: DiscussionCommentConnection = (data[this.alias] || data).comments;
    if (!_data) throw Object.assign(new Error('Invalid data'), { data, query: this.toString() });
    return {
      next: _data.pageInfo.hasNextPage
        ? new DiscussionsCommentsLookup({
            ...this.params,
            cursor: _data.pageInfo.endCursor || this.params.cursor
          })
        : undefined,
      data: (_data.nodes || []).map((data) => {
        return DiscussionCommentSchema.parse({
          __typename: data!.__typename,
          author: data!.author && this.fragments[0].parse(data!.author),
          author_association: data!.authorAssociation,
          body: data!.body,
          created_at: data!.createdAt,
          created_via_email: data!.createdViaEmail,
          database_id: data!.databaseId,
          deleted_at: data!.deletedAt,
          discussion: data!.discussion!.id,
          editor: data!.editor && this.fragments[0].parse(data!.editor),
          id: data!.id,
          includes_created_edit: data!.includesCreatedEdit,
          is_awnser: data!.isAnswer,
          is_minimized: data!.isMinimized,
          last_edited_at: data!.lastEditedAt,
          minimized_reason: data!.minimizedReason,
          published_at: data!.publishedAt,
          reactions_count: data!.reactions.totalCount,
          replies_count: data!.replies.totalCount,
          reply_to: data!.replyTo && data!.replyTo.id,
          updated_at: data!.updatedAt,
          upvote_count: data!.upvoteCount
        });
      }),
      params: { ...this.params, cursor: _data.pageInfo.endCursor || this.params.cursor }
    };
  }

  get fragments(): [ActorFragment] {
    return [this.params.factory.create(ActorFragment)];
  }
}
