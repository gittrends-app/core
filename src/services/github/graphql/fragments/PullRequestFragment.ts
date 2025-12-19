import { PullRequest, PullRequestSchema } from '../../../../entities/PullRequest';
import { PullRequest as GsPullRequest } from '../../graphql-schema';
import { ActorFragment } from './ActorFragment';
import { AbstractFragment, FragmentFactory } from './Fragment';

/**
 *  A fragment to get a pull request.
 */
export class PullRequestFragment extends AbstractFragment {
  constructor(alias = 'PullRequestFrag', opts: { factory: FragmentFactory }) {
    super(alias, opts);
    this.fragments.push(opts.factory.create(ActorFragment));
  }

  toString(): string {
    return `
      fragment ${this.alias} on PullRequest {
        __typename
        activeLockReason
        assignedActors(first: 100) { nodes { ...${this.fragments[0].alias} } }
        assignees(first: 100) { nodes { ...${this.fragments[0].alias} } }
        author { ...${this.fragments[0].alias} }
        authorAssociation
        body
        closed
        closedAt
        comments { totalCount }
        createdAt
        createdViaEmail
        databaseId
        editor { ...${this.fragments[0].alias} }
        fullDatabaseId
        id
        includesCreatedEdit
        labels(first: 100) { nodes { name } }
        lastEditedAt
        locked
        milestone { title }
        number
        participants { totalCount }
        publishedAt
        reactions { totalCount }
        repository { id }
        state
        timelineItems { totalCount }
        title
        updatedAt
        
        additions
        autoMergeRequest {
          authorEmail
          commitBody
          commitHeadline
          enabledAt
          enabledBy { ...${this.fragments[0].alias} }
          mergeMethod
        }
        baseRefName
        baseRefOid
        baseRepository { nameWithOwner }
        canBeRebased
        changedFiles
        deletions
        files { totalCount }
        headRefName
        headRefOid
        headRepository { nameWithOwner }
        headRepositoryOwner { ...${this.fragments[0].alias} }
        isCrossRepository
        isDraft
        maintainerCanModify
        mergeCommit { id }
        mergeStateStatus
        mergeable
        merged
        mergedAt
        mergedBy { ...${this.fragments[0].alias} }
        potentialMergeCommit { id }
        reviewDecision
        reviews { totalCount }
        suggestedReviewers { isAuthor isCommenter reviewer { ...${this.fragments[0].alias} } }
        totalCommentsCount
      }
    `;
  }

  parse(data: GsPullRequest): PullRequest {
    return PullRequestSchema.parse({
      active_lock_reason: data.activeLockReason,
      assigned_actors: data.assignedActors?.nodes?.map((node) => this.fragments[0].parse(node)),
      assignees: data.assignees?.nodes?.map((node) => this.fragments[0].parse(node)),
      author: data.author && this.fragments[0].parse(data.author),
      author_association: data.authorAssociation,
      body: data.body,
      closed: data.closed,
      closed_at: data.closedAt,
      comments_count: data.comments.totalCount,
      created_at: data.createdAt,
      created_via_email: data.createdViaEmail,
      database_id: data.databaseId,
      editor: data.editor && this.fragments[0].parse(data.editor),
      full_database_id: data.fullDatabaseId,
      id: data.id,
      includes_created_edit: data.includesCreatedEdit,
      labels: data.labels?.nodes?.map((node) => node!.name),
      last_edited_at: data.lastEditedAt,
      locked: data.locked,
      milestone: data.milestone?.title,
      number: data.number,
      participants_count: data.participants.totalCount,
      published_at: data.publishedAt,
      reactions_count: data.reactions.totalCount,
      repository: data.repository.id,
      state: data.state,
      timeline_items_count: data.timelineItems.totalCount,
      title: data.title,
      updated_at: data.updatedAt,
      __typename: data.__typename,

      additions: data.additions,
      auto_merge_request: data.autoMergeRequest && {
        author_email: data.autoMergeRequest.authorEmail,
        commit_body: data.autoMergeRequest.commitBody,
        commit_headline: data.autoMergeRequest.commitHeadline,
        enabled_at: data.autoMergeRequest.enabledAt,
        enabled_by: data.autoMergeRequest.enabledBy && this.fragments[0].parse(data.autoMergeRequest.enabledBy),
        merge_method: data.autoMergeRequest.mergeMethod
      },
      base_ref_name: data.baseRefName,
      base_ref_oid: data.baseRefOid,
      base_repository: data.baseRepository?.nameWithOwner,
      can_be_rebased: data.canBeRebased,
      changed_files: data.changedFiles,
      deletions: data.deletions,
      files_count: data.files?.totalCount,
      head_ref_name: data.headRefName,
      head_ref_oid: data.headRefOid,
      head_repository: data.headRepository?.nameWithOwner,
      head_repository_owner: data.headRepositoryOwner?.login,
      is_cross_repository: data.isCrossRepository,
      is_draft: data.isDraft,
      maintainer_can_modify: data.maintainerCanModify,
      merge_commit: data.mergeCommit && data.mergeCommit.id,
      merge_state_status: data.mergeStateStatus,
      mergeable: data.mergeable,
      merged: data.merged,
      merged_at: data.mergedAt,
      merged_by: data.mergedBy && this.fragments[0].parse(data.mergedBy),
      potential_merge_commit: data.potentialMergeCommit && data.potentialMergeCommit.id,
      review_decision: data.reviewDecision,
      reviews_count: data.reviews!.totalCount,
      suggested_reviewers: data.suggestedReviewers?.map((node) => ({
        is_author: node!.isAuthor,
        is_commenter: node!.isCommenter,
        reviewer: node!.reviewer && this.fragments[0].parse(node!.reviewer)
      })),
      total_comments_count: data.totalCommentsCount
    });
  }
}
