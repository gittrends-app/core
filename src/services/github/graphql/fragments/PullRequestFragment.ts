import { PullRequest, PullRequestSchema } from '../../../../entities/PullRequest';
import { PullRequest as GsPullRequest } from '../../graphql-schema';
import { ActorFragment } from './ActorFragment';
import { DeclarativeFragment, FragmentFactory, FragmentField } from './Fragment';

/**
 *  A fragment to get a pull request.
 */
export class PullRequestFragment extends DeclarativeFragment<GsPullRequest, PullRequest> {
  protected readonly fieldMap: readonly FragmentField<GsPullRequest>[] = [];

  constructor(alias = 'PullRequestFrag', opts: { factory: FragmentFactory }) {
    super(alias, opts);
    this.fragments.push(opts.factory.create(ActorFragment));
    this.fieldMap = [
      { key: '__typename', selection: '__typename', value: (data) => data.__typename },
      { key: 'active_lock_reason', selection: 'activeLockReason', value: (data) => data.activeLockReason },
      {
        key: 'assigned_actors',
        selection: (fragment) => `assignedActors(first: 100) { nodes { ...${fragment.fragments[0].alias} } }`,
        value: (data, fragment) => data.assignedActors?.nodes?.map((node) => fragment.fragments[0].parse(node))
      },
      {
        key: 'assignees',
        selection: (fragment) => `assignees(first: 100) { nodes { ...${fragment.fragments[0].alias} } }`,
        value: (data, fragment) => data.assignees?.nodes?.map((node) => fragment.fragments[0].parse(node))
      },
      {
        key: 'author',
        selection: (fragment) => `author { ...${fragment.fragments[0].alias} }`,
        value: (data, fragment) => data.author && fragment.fragments[0].parse(data.author)
      },
      { key: 'author_association', selection: 'authorAssociation', value: (data) => data.authorAssociation },
      { key: 'body', selection: 'body', value: (data) => data.body },
      { key: 'closed', selection: 'closed', value: (data) => data.closed },
      { key: 'closed_at', selection: 'closedAt', value: (data) => data.closedAt },
      { key: 'comments_count', selection: 'comments { totalCount }', value: (data) => data.comments.totalCount },
      { key: 'created_at', selection: 'createdAt', value: (data) => data.createdAt },
      { key: 'created_via_email', selection: 'createdViaEmail', value: (data) => data.createdViaEmail },
      { key: 'database_id', selection: 'databaseId', value: (data) => data.databaseId },
      {
        key: 'editor',
        selection: (fragment) => `editor { ...${fragment.fragments[0].alias} }`,
        value: (data, fragment) => data.editor && fragment.fragments[0].parse(data.editor)
      },
      { key: 'full_database_id', selection: 'fullDatabaseId', value: (data) => data.fullDatabaseId },
      { key: 'id', selection: 'id', value: (data) => data.id },
      { key: 'includes_created_edit', selection: 'includesCreatedEdit', value: (data) => data.includesCreatedEdit },
      {
        key: 'labels',
        selection: 'labels(first: 100) { nodes { name } }',
        value: (data) => data.labels?.nodes?.map((node) => node!.name)
      },
      { key: 'last_edited_at', selection: 'lastEditedAt', value: (data) => data.lastEditedAt },
      { key: 'locked', selection: 'locked', value: (data) => data.locked },
      { key: 'milestone', selection: 'milestone { title }', value: (data) => data.milestone?.title },
      { key: 'number', selection: 'number', value: (data) => data.number },
      {
        key: 'participants_count',
        selection: 'participants { totalCount }',
        value: (data) => data.participants.totalCount
      },
      { key: 'published_at', selection: 'publishedAt', value: (data) => data.publishedAt },
      { key: 'reactions_count', selection: 'reactions { totalCount }', value: (data) => data.reactions.totalCount },
      { key: 'repository', selection: 'repository { id }', value: (data) => data.repository.id },
      { key: 'state', selection: 'state', value: (data) => data.state },
      {
        key: 'timeline_items_count',
        selection: 'timelineItems { totalCount }',
        value: (data) => data.timelineItems.totalCount
      },
      { key: 'title', selection: 'title', value: (data) => data.title },
      { key: 'updated_at', selection: 'updatedAt', value: (data) => data.updatedAt },

      { key: 'additions', selection: 'additions', value: (data) => data.additions },
      {
        key: 'auto_merge_request',
        selection: (fragment) => `autoMergeRequest {
          authorEmail
          commitBody
          commitHeadline
          enabledAt
          enabledBy { ...${fragment.fragments[0].alias} }
          mergeMethod
        }`,
        value: (data, fragment) =>
          data.autoMergeRequest && {
            author_email: data.autoMergeRequest.authorEmail,
            commit_body: data.autoMergeRequest.commitBody,
            commit_headline: data.autoMergeRequest.commitHeadline,
            enabled_at: data.autoMergeRequest.enabledAt,
            enabled_by: data.autoMergeRequest.enabledBy && fragment.fragments[0].parse(data.autoMergeRequest.enabledBy),
            merge_method: data.autoMergeRequest.mergeMethod
          }
      },
      { key: 'base_ref_name', selection: 'baseRefName', value: (data) => data.baseRefName },
      { key: 'base_ref_oid', selection: 'baseRefOid', value: (data) => data.baseRefOid },
      {
        key: 'base_repository',
        selection: 'baseRepository { nameWithOwner }',
        value: (data) => data.baseRepository?.nameWithOwner
      },
      { key: 'can_be_rebased', selection: 'canBeRebased', value: (data) => data.canBeRebased },
      { key: 'changed_files', selection: 'changedFiles', value: (data) => data.changedFiles },
      { key: 'deletions', selection: 'deletions', value: (data) => data.deletions },
      { key: 'files_count', selection: 'files { totalCount }', value: (data) => data.files?.totalCount },
      { key: 'head_ref_name', selection: 'headRefName', value: (data) => data.headRefName },
      { key: 'head_ref_oid', selection: 'headRefOid', value: (data) => data.headRefOid },
      {
        key: 'head_repository',
        selection: 'headRepository { nameWithOwner }',
        value: (data) => data.headRepository?.nameWithOwner
      },
      {
        key: 'head_repository_owner',
        selection: (fragment) => `headRepositoryOwner { ...${fragment.fragments[0].alias} }`,
        value: (data) => data.headRepositoryOwner?.login
      },
      { key: 'is_cross_repository', selection: 'isCrossRepository', value: (data) => data.isCrossRepository },
      { key: 'is_draft', selection: 'isDraft', value: (data) => data.isDraft },
      { key: 'maintainer_can_modify', selection: 'maintainerCanModify', value: (data) => data.maintainerCanModify },
      {
        key: 'merge_commit',
        selection: 'mergeCommit { id }',
        value: (data) => data.mergeCommit && data.mergeCommit.id
      },
      { key: 'merge_state_status', selection: 'mergeStateStatus', value: (data) => data.mergeStateStatus },
      { key: 'mergeable', selection: 'mergeable', value: (data) => data.mergeable },
      { key: 'merged', selection: 'merged', value: (data) => data.merged },
      { key: 'merged_at', selection: 'mergedAt', value: (data) => data.mergedAt },
      {
        key: 'merged_by',
        selection: (fragment) => `mergedBy { ...${fragment.fragments[0].alias} }`,
        value: (data, fragment) => data.mergedBy && fragment.fragments[0].parse(data.mergedBy)
      },
      {
        key: 'potential_merge_commit',
        selection: 'potentialMergeCommit { id }',
        value: (data) => data.potentialMergeCommit && data.potentialMergeCommit.id
      },
      { key: 'review_decision', selection: 'reviewDecision', value: (data) => data.reviewDecision },
      { key: 'reviews_count', selection: 'reviews { totalCount }', value: (data) => data.reviews!.totalCount },
      {
        key: 'suggested_reviewers',
        selection: (fragment) =>
          `suggestedReviewers { isAuthor isCommenter reviewer { ...${fragment.fragments[0].alias} } }`,
        value: (data, fragment) =>
          data.suggestedReviewers?.map((node) => ({
            is_author: node!.isAuthor,
            is_commenter: node!.isCommenter,
            reviewer: node!.reviewer && fragment.fragments[0].parse(node!.reviewer)
          }))
      },
      { key: 'total_comments_count', selection: 'totalCommentsCount', value: (data) => data.totalCommentsCount }
    ];
  }

  toString(): string {
    return `
      fragment ${this.alias} on PullRequest {
        ${this.selection()}
      }
    `;
  }

  parse(data: GsPullRequest): PullRequest {
    return PullRequestSchema.parse(this.values(data));
  }
}
