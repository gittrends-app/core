import {
  PullRequestReviewComment,
  PullRequestReviewCommentSchema
} from '../../../../entities/base/PullRequestReviewComment';
import { zodSanitize } from '../../../../helpers/sanitize';
import { PullRequestReviewComment as GsPullRequestReviewComment } from '../../graphql-schema';
import { ActorFragment } from './ActorFragment';
import { DeclarativeFragment, FragmentFactory, FragmentField } from './Fragment';

/**
 *  A fragment to get a pull request review comment.
 */
export class PullRequestReviewCommentFragment extends DeclarativeFragment<
  GsPullRequestReviewComment,
  PullRequestReviewComment
> {
  protected readonly fieldMap: readonly FragmentField<GsPullRequestReviewComment>[] = [];

  constructor(alias = 'PullRequestReviewCommentFrag', opts: { factory: FragmentFactory }) {
    super(alias, opts);
    this.fragments.push(opts.factory.create(ActorFragment));
    this.fieldMap = [
      { key: 'id', selection: 'id', value: (data) => data!.id },
      { key: '__typename', selection: '__typename', value: (data) => data!.__typename },

      {
        key: 'author',
        selection: (fragment) => `author { ...${fragment.fragments[0].alias} }`,
        value: (data, fragment) => data!.author && fragment.fragments[0].parse(data!.author)
      },
      { key: 'author_association', selection: 'authorAssociation', value: (data) => data!.authorAssociation },
      { key: 'body', selection: 'body', value: (data) => data!.body },
      { key: 'created_at', selection: 'createdAt', value: (data) => data!.createdAt },
      { key: 'created_via_email', selection: 'createdViaEmail', value: (data) => data!.createdViaEmail },
      {
        key: 'editor',
        selection: (fragment) => `editor { ...${fragment.fragments[0].alias} }`,
        value: (data, fragment) => data!.editor && fragment.fragments[0].parse(data!.editor)
      },
      { key: 'includes_created_edit', selection: 'includesCreatedEdit', value: (data) => data!.includesCreatedEdit },
      { key: 'last_edited_at', selection: 'lastEditedAt', value: (data) => data!.lastEditedAt },
      { key: 'published_at', selection: 'publishedAt', value: (data) => data!.publishedAt },
      { key: 'updated_at', selection: 'updatedAt', value: (data) => data!.updatedAt },

      { key: 'commit', selection: 'commit { id }', value: (data) => data!.commit?.id },
      { key: 'diff_hunk', selection: 'diffHunk', value: (data) => data!.diffHunk },
      { key: 'drafted_at', selection: 'draftedAt', value: (data) => data!.draftedAt },
      { key: 'full_database_id', selection: 'fullDatabaseId', value: (data) => data!.fullDatabaseId },
      { key: 'is_minimized', selection: 'isMinimized', value: (data) => data!.isMinimized },
      { key: 'line', selection: 'line', value: (data) => data!.line },
      { key: 'minimized_reason', selection: 'minimizedReason', value: (data) => data!.minimizedReason },
      { key: 'original_commit', selection: 'originalCommit { id }', value: (data) => data!.originalCommit?.id },
      { key: 'original_line', selection: 'originalLine', value: (data) => data!.originalLine },
      { key: 'original_start_line', selection: 'originalStartLine', value: (data) => data!.originalStartLine },
      { key: 'outdated', selection: 'outdated', value: (data) => data!.outdated },
      { key: 'path', selection: 'path', value: (data) => data!.path },
      {
        key: 'pull_request_review',
        selection: 'pullRequestReview { id }',
        value: (data) => data!.pullRequestReview?.id
      },
      { key: 'reactions_count', selection: 'reactions { totalCount }', value: (data) => data!.reactions?.totalCount },
      { key: 'reply_to', selection: 'replyTo { id }', value: (data) => data!.replyTo?.id },
      { key: 'start_line', selection: 'startLine', value: (data) => data!.startLine },
      { key: 'state', selection: 'state', value: (data) => data!.state },
      { key: 'subject_type', selection: 'subjectType', value: (data) => data!.subjectType }
    ];
  }

  toString(): string {
    return `
      fragment ${this.alias} on PullRequestReviewComment {
        ${this.selection()}
      }
    `;
  }

  parse(data: GsPullRequestReviewComment): PullRequestReviewComment {
    return zodSanitize(PullRequestReviewCommentSchema).parse(this.values(data));
  }
}
