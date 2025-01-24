import { IssueTimelineItems, PullRequestTimelineItems } from '@octokit/graphql-schema';
import { Commentable, CommentableSchema } from '../../../../entities/base/Commentable.js';
import { ActorFragment } from './ActorFragment.js';
import { AbstractFragment, FragmentFactory } from './Fragment.js';

/**
 *  A fragment to fetch comments from a timeline item.
 */
export class TimelineItemCommentsFragment extends AbstractFragment<Commentable> {
  constructor(alias = 'TimelineItemCommentsFrag', opts: { factory: FragmentFactory }) {
    super(alias, opts);
    this.fragments.push(opts.factory.create(ActorFragment));
  }

  toString(): string {
    return `
      fragment ${this.alias}_Node on Node { __typename id }

      fragment ${this.alias}_Comment on Comment {
        author { ...${this.fragments[0].alias} }
        authorAssociation
        body
        createdAt
        createdViaEmail
        editor { ...${this.fragments[0].alias} }
        includesCreatedEdit
        lastEditedAt
        publishedAt
        updatedAt
      }

      fragment ${this.alias}_CommitComment on CommitComment {
        ...${this.alias}_Node
        ...${this.alias}_Comment

        commit { id }
        databaseId
        isMinimized
        minimizedReason
        path
        position
        reactions { totalCount }
      }

      fragment ${this.alias}_PullRequestReviewCommentFragment on PullRequestReviewComment  {
        ...${this.alias}_Node
        ...${this.alias}_Comment

        commit { id }
        diffHunk
        draftedAt
        fullDatabaseId
        isMinimized
        line
        minimizedReason
        originalCommit { id }
        originalLine
        originalStartLine
        outdated
        path
        pullRequestReview { id }
        reactions { totalCount }
        replyTo { id }
        startLine
        state
        subjectType
      }

      fragment ${this.alias} on Node {
        ...${this.alias}_Node
        __typename
        ... on PullRequestCommitCommentThread {
          comments(first: 100) {
            nodes { ...${this.alias}_CommitComment }		
          }
        }
        ... on PullRequestReview {
          comments(first: 100) {
            nodes { ...${this.alias}_PullRequestReviewCommentFragment }		
          }
        }
        ... on PullRequestReviewThread {
          comments(first: 100) {
            nodes { ...${this.alias}_PullRequestReviewCommentFragment }		
          }
        }
      }
    `;
  }

  parse(data: IssueTimelineItems | PullRequestTimelineItems): Commentable {
    let _data: Record<string, any>[] | undefined;

    switch (data.__typename) {
      case 'PullRequestCommitCommentThread':
        _data = data.comments?.nodes?.map((node) => ({
          author: node!.author && this.fragments[0].parse(node!.author),
          author_association: node!.authorAssociation,
          body: node!.body,
          created_at: node!.createdAt,
          created_via_email: node!.createdViaEmail,
          editor: node!.editor && this.fragments[0].parse(node!.editor),
          includes_created_edit: node!.includesCreatedEdit,
          last_edited_at: node!.lastEditedAt,
          published_at: node!.publishedAt,
          updated_at: node!.updatedAt,
          commit: node!.commit?.id,
          database_id: node!.databaseId,
          id: node!.id,
          is_minimized: node!.isMinimized,
          minimized_reason: node!.minimizedReason,
          path: node!.path,
          position: node!.position,
          reactions_count: node!.reactions?.totalCount,
          __typename: node!.__typename
        }));
        break;
      case 'PullRequestReview':
      case 'PullRequestReviewThread':
        _data = data.comments?.nodes?.map((node) => ({
          author: node!.author && this.fragments[0].parse(node!.author),
          author_association: node!.authorAssociation,
          body: node!.body,
          created_at: node!.createdAt,
          created_via_email: node!.createdViaEmail,
          editor: node!.editor && this.fragments[0].parse(node!.editor),
          includes_created_edit: node!.includesCreatedEdit,
          last_edited_at: node!.lastEditedAt,
          published_at: node!.publishedAt,
          updated_at: node!.updatedAt,

          commit: node!.commit?.id,
          diff_hunk: node!.diffHunk,
          drafted_at: node!.draftedAt,
          full_database_id: node!.fullDatabaseId,
          id: node!.id,
          is_minimized: node!.isMinimized,
          line: node!.line,
          minimized_reason: node!.minimizedReason,
          original_commit: node!.originalCommit?.id,
          original_line: node!.originalLine,
          original_start_line: node!.originalStartLine,
          outdated: node!.outdated,
          path: node!.path,
          pull_request_review: node!.pullRequestReview?.id,
          reactions_count: node!.reactions?.totalCount,
          reply_to: node!.replyTo?.id,
          start_line: node!.startLine,
          state: node!.state,
          subject_type: node!.subjectType,
          __typename: node!.__typename
        }));
        break;

      default:
        throw new Error(`Unknown timeline item type: ${data.__typename}`);
    }

    return CommentableSchema.parse({ comments_count: _data?.length || 0, comments: _data });
  }
}
