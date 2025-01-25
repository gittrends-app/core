import { DiscussionConnection } from '@octokit/graphql-schema';
import { Discussion, DiscussionSchema } from '../../../../entities/Discussion';
import { ActorFragment } from '../fragments/ActorFragment';
import { QueryLookup } from './Lookup';

/**
 *  A lookup to get repository discussions.
 */
export class DiscussionsLookup extends QueryLookup<Discussion[]> {
  toString(): string {
    const params = [`first: ${this.params.per_page || 100}`, 'orderBy: { field: UPDATED_AT, direction: ASC }'];
    if (this.params.cursor) params.push(`after: "${this.params.cursor}"`);

    return `
    ${this.alias}:node(id: "${this.params.id}") {
      ... on Repository {
        discussions(${params.join(', ')}) {
          pageInfo { endCursor hasNextPage }
          nodes {
            __typename
            activeLockReason
            answer { id }
            answerChosenAt
            answerChosenBy { ...${this.fragments[0].alias} }
            author { ...${this.fragments[0].alias} }
            authorAssociation
            body
            category { name }
            closed
            closedAt
            comments { totalCount }
            createdAt
            createdViaEmail
            databaseId
            editor { ...${this.fragments[0].alias} }
            id
            includesCreatedEdit
            isAnswered
            labels(first: 100) { nodes { name } }
            lastEditedAt
            locked
            number
            publishedAt
            reactions { totalCount }
            stateReason
            title
            updatedAt
            upvoteCount
          }
        }
      }
    }
    `;
  }

  parse(data: any) {
    const _data: DiscussionConnection = (data[this.alias] || data).discussions;
    return {
      next: _data.pageInfo.hasNextPage
        ? new DiscussionsLookup({
            ...this.params,
            cursor: _data.pageInfo.endCursor || this.params.cursor
          })
        : undefined,
      data: (_data.nodes || []).map((data) => {
        return DiscussionSchema.parse({
          __typename: data!.__typename,
          repository: this.params.id,
          id: data!.id,
          database_id: data!.databaseId!,
          active_lock_reason: data!.activeLockReason,
          answer: data!.answer?.id,
          answer_chosen_at: data!.answerChosenAt,
          answer_chosen_by: data!.answerChosenBy ? this.fragments[0].parse(data!.answerChosenBy) : undefined,
          author: data!.author ? this.fragments[0].parse(data!.author) : undefined,
          author_association: data!.authorAssociation,
          body: data!.body,
          category: data!.category?.name,
          closed: data!.closed,
          closed_at: data!.closedAt,
          comments_count: data!.comments.totalCount,
          created_at: data!.createdAt,
          created_via_email: data!.createdViaEmail,
          editor: data!.editor ? this.fragments[0].parse(data!.editor) : undefined,
          includes_created_edit: data!.includesCreatedEdit,
          is_awnsered: data!.isAnswered,
          labels: data!.labels?.nodes?.map((label: any) => label.name),
          last_edited_at: data!.lastEditedAt,
          locked: data!.locked,
          number: data!.number,
          published_at: data!.publishedAt,
          reactions_count: data!.reactions.totalCount,
          state_reason: data!.stateReason,
          title: data!.title,
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
