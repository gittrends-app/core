import { PullRequestReviewComment as GsPullRequestReviewComment } from '@octokit/graphql-schema';
import {
  PullRequestReviewComment,
  PullRequestReviewCommentSchema
} from '../../../../entities/base/PullRequestReviewComment';
import { zodSanitize } from '../../../../helpers/sanitize';
import { ActorFragment } from './ActorFragment';
import { AbstractFragment, FragmentFactory } from './Fragment';

/**
 *  A fragment to get a pull request.
 */
export class PullRequestReviewCommentFragment extends AbstractFragment {
  constructor(alias = 'PullRequestReviewCommentFrag', opts: { factory: FragmentFactory }) {
    super(alias, opts);
    this.fragments.push(opts.factory.create(ActorFragment));
  }

  toString(): string {
    return `
      fragment ${this.alias} on PullRequestReviewComment  {
        id
        __typename 

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
    `;
  }

  parse(data: GsPullRequestReviewComment): PullRequestReviewComment {
    return zodSanitize(PullRequestReviewCommentSchema).parse({
      author: data!.author && this.fragments[0].parse(data!.author),
      author_association: data!.authorAssociation,
      body: data!.body,
      created_at: data!.createdAt,
      created_via_email: data!.createdViaEmail,
      editor: data!.editor && this.fragments[0].parse(data!.editor),
      includes_created_edit: data!.includesCreatedEdit,
      last_edited_at: data!.lastEditedAt,
      published_at: data!.publishedAt,
      updated_at: data!.updatedAt,

      commit: data!.commit?.id,
      diff_hunk: data!.diffHunk,
      drafted_at: data!.draftedAt,
      full_database_id: data!.fullDatabaseId,
      id: data!.id,
      is_minimized: data!.isMinimized,
      line: data!.line,
      minimized_reason: data!.minimizedReason,
      original_commit: data!.originalCommit?.id,
      original_line: data!.originalLine,
      original_start_line: data!.originalStartLine,
      outdated: data!.outdated,
      path: data!.path,
      pull_request_review: data!.pullRequestReview?.id,
      reactions_count: data!.reactions?.totalCount,
      reply_to: data!.replyTo?.id,
      start_line: data!.startLine,
      state: data!.state,
      subject_type: data!.subjectType,
      __typename: data!.__typename
    });
  }
}
