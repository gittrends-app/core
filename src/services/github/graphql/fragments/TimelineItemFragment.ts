import { TimelineItem, TimelineItemSchema } from '../../../../entities/TimelineItem';
import { PullRequestTimelineItems } from '../../graphql-schema';
import { ExtendedIssueTimelineItems } from '../types/ExtendedIssueTimelineItems';
import { ActorFragment } from './ActorFragment';
import { AbstractFragment, FragmentFactory } from './Fragment';

/**
 *  A fragment to get a timeline item.
 */
class TimelineItemFragment extends AbstractFragment<TimelineItem> {
  private readonly pullRequest: boolean;

  constructor(alias = 'IssueTimelineItemFrag', opts: { factory: FragmentFactory; pullRequest?: boolean }) {
    super(alias, opts);
    this.fragments.push(opts.factory.create(ActorFragment));
    this.pullRequest = opts.pullRequest || false;
  }

  toString(): string {
    return `
      fragment ${this.alias}_Node on Node { __typename id }

      fragment ${this.alias}_AddedToProjectEvent on AddedToProjectEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
      }

      fragment ${this.alias}_AddedToProjectV2Event on AddedToProjectV2Event {
        actor { ...${this.fragments[0].alias} }
      }

      fragment ${this.alias}_AssignedEvent on AssignedEvent {
        actor { ...${this.fragments[0].alias} }
        assignee { ...${this.fragments[0].alias} }
        createdAt
      }

      fragment ${this.alias}_ClosedEvent on ClosedEvent {
        actor { ...${this.fragments[0].alias} }
        closer { ...${this.alias}_Node }
        createdAt
        duplicateOf { ...${this.alias}_Node }
      }

      fragment ${this.alias}_BlockedByAddedEvent on BlockedByAddedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        blockingIssue { ...${this.alias}_Node }
      }

      fragment ${this.alias}_BlockedByRemovedEvent on BlockedByRemovedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        blockingIssue { ...${this.alias}_Node }
      }

      fragment ${this.alias}_BlockingAddedEvent on BlockingAddedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        blockedIssue { ...${this.alias}_Node }
      }

      fragment ${this.alias}_BlockingRemovedEvent on BlockingRemovedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        blockedIssue { ...${this.alias}_Node }
      }

      fragment ${this.alias}_CommentDeletedEvent on CommentDeletedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        databaseId
        deletedCommentAuthor { ...${this.fragments[0].alias} }
      }

      fragment ${this.alias}_ConnectedEvent on ConnectedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        isCrossRepository
        source { ...${this.alias}_Node }
      }

      fragment ${this.alias}_ConvertedNoteToIssueEvent on ConvertedNoteToIssueEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        databaseId
        projectColumnName
      }

      fragment ${this.alias}_ConvertedFromDraftEvent on ConvertedFromDraftEvent {
        actor { ...${this.fragments[0].alias} }
      }

      fragment ${this.alias}_ConvertedToDiscussionEvent on ConvertedToDiscussionEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        discussion { id }
      }

      fragment ${this.alias}_CrossReferencedEvent on CrossReferencedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        isCrossRepository
        referencedAt
        source { ...${this.alias}_Node }
        willCloseTarget
      }

      fragment ${this.alias}_DemilestonedEvent on DemilestonedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        milestoneTitle
      }

      fragment ${this.alias}_DisconnectedEvent on DisconnectedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        isCrossRepository
        source { ...${this.alias}_Node }
      }

      fragment ${this.alias}_IssueComment on IssueComment {
        author { ...${this.fragments[0].alias} }
        authorAssociation
        body
        createdAt
        createdViaEmail
        databaseId
        editor { ...${this.fragments[0].alias} }
        fullDatabaseId
        includesCreatedEdit
        isMinimized
        lastEditedAt
        minimizedReason
        publishedAt
        reactions { totalCount }
        updatedAt
      }

      fragment ${this.alias}_IssueTypeAddedEvent on IssueTypeAddedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        issueType { name }
      }

      fragment ${this.alias}_IssueTypeChangedEvent on IssueTypeChangedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        issueType { name }
        prevIssueType { name }
      }

      fragment ${this.alias}_IssueTypeRemovedEvent on IssueTypeRemovedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        issueType { name }
      }

      fragment ${this.alias}_LabeledEvent on LabeledEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        label { name }
      }

      fragment ${this.alias}_LockedEvent on LockedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        lockReason
      }

      fragment ${this.alias}_MarkedAsDuplicateEvent on MarkedAsDuplicateEvent {
        actor { ...${this.fragments[0].alias} }
        canonical { ...${this.alias}_Node }
        createdAt
        isCrossRepository
      }

      fragment ${this.alias}_MentionedEvent on MentionedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        databaseId	
      }

      fragment ${this.alias}_MilestonedEvent on MilestonedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        milestoneTitle
      }

      fragment ${this.alias}_MovedColumnsInProjectEvent on MovedColumnsInProjectEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
      }

      fragment ${this.alias}_ParentIssueAddedEvent on ParentIssueAddedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        parent { id }
      }

      fragment ${this.alias}_ParentIssueRemovedEvent on ParentIssueRemovedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        parent { id }
      }

      fragment ${this.alias}_PinnedEvent on PinnedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
      }

      fragment ${this.alias}_ProjectV2ItemStatusChangedEvent on ProjectV2ItemStatusChangedEvent {
        actor { ...${this.fragments[0].alias} }
      }

      fragment ${this.alias}_ReferencedEvent on ReferencedEvent {
        actor { ...${this.fragments[0].alias} }
        commit { id }
        commitRepository { id }
        createdAt
        isCrossRepository
        isDirectReference
      }

      fragment ${this.alias}_RemovedFromProjectEvent on RemovedFromProjectEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
      }

      fragment ${this.alias}_RemovedFromProjectV2Event on RemovedFromProjectV2Event {
        actor { ...${this.fragments[0].alias} }
      }

      fragment ${this.alias}_RenamedTitleEvent on RenamedTitleEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        currentTitle
        previousTitle
      }

      fragment ${this.alias}_ReopenedEvent on ReopenedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        stateReason
      }

      fragment ${this.alias}_SubIssueAddedEvent on SubIssueAddedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        subIssue { id }
      }

      fragment ${this.alias}_SubIssueRemovedEvent on SubIssueRemovedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        subIssue { id }
      }

      fragment ${this.alias}_SubscribedEvent on SubscribedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
      }

      fragment ${this.alias}_TransferredEvent on TransferredEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        fromRepository { id }
      }

      fragment ${this.alias}_UnassignedEvent on UnassignedEvent {
        actor { ...${this.fragments[0].alias} }
        assignee { ...${this.fragments[0].alias} }
        createdAt
      }

      fragment ${this.alias}_UnlabeledEvent on UnlabeledEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        label { name }
      }

      fragment ${this.alias}_UnlockedEvent on UnlockedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
      }

      fragment ${this.alias}_UnmarkedAsDuplicateEvent on UnmarkedAsDuplicateEvent {
        actor { ...${this.fragments[0].alias} }
        canonical { ...${this.alias}_Node }
        createdAt
        isCrossRepository
      }

      fragment ${this.alias}_UnpinnedEvent on UnpinnedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
      }

      fragment ${this.alias}_UnsubscribedEvent on UnsubscribedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
      }

      fragment ${this.alias}_UserBlockedEvent on UserBlockedEvent {
        actor { ...${this.fragments[0].alias} }
        blockDuration
        createdAt
      }

      ${
        this.pullRequest
          ? `
      fragment ${this.alias}_AddedToMergeQueueEvent on AddedToMergeQueueEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        enqueuer { ...${this.fragments[0].alias} }
        mergeQueue { id }
      }

      fragment ${this.alias}_AutoMergeDisabledEvent on AutoMergeDisabledEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        disabler { ...${this.fragments[0].alias} }
        reason
        reasonCode
      }

      fragment ${this.alias}_AutoMergeEnabledEvent on AutoMergeEnabledEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        enabler { ...${this.fragments[0].alias} }
      }

      fragment ${this.alias}_AutoRebaseEnabledEvent on AutoRebaseEnabledEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        enabler { ...${this.fragments[0].alias} }
      }

      fragment ${this.alias}_AutoSquashEnabledEvent on AutoSquashEnabledEvent{
        actor { ...${this.fragments[0].alias} }
        createdAt
        enabler { ...${this.fragments[0].alias} }
      }

      fragment ${this.alias}_AutomaticBaseChangeFailedEvent on AutomaticBaseChangeFailedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        newBase
        oldBase
      }

      fragment  ${this.alias}_AutomaticBaseChangeSucceededEvent on  AutomaticBaseChangeSucceededEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        newBase
        oldBase
      }

      fragment  ${this.alias}_BaseRefChangedEvent on  BaseRefChangedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        currentRefName
        databaseId
        previousRefName
      }

      fragment ${this.alias}_BaseRefDeletedEvent on BaseRefDeletedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        baseRefName
      }

      fragment ${this.alias}_BaseRefForcePushedEvent on BaseRefForcePushedEvent {
        actor { ...${this.fragments[0].alias} }
        afterCommit { id }
        beforeCommit { id }
        createdAt
        ref { name }
      }

      fragment ${this.alias}_ConvertToDraftEvent on ConvertToDraftEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
      }

      fragment ${this.alias}_DeployedEvent on DeployedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        databaseId
        deployment { id }
        ref { name }
      }


      fragment ${this.alias}_DeploymentEnvironmentChangedEvent on DeploymentEnvironmentChangedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        deploymentStatus { state }
      }


      fragment ${this.alias}_HeadRefDeletedEvent on HeadRefDeletedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        headRefName
      }

      fragment ${this.alias}_HeadRefRestoredEvent on HeadRefRestoredEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
      }

      fragment ${this.alias}_HeadRefForcePushedEvent on HeadRefForcePushedEvent {
        actor { ...${this.fragments[0].alias} }
        afterCommit { id }
        beforeCommit { id }
        createdAt
        ref { name }
      }

      fragment ${this.alias}_MergedEvent on MergedEvent {
        actor { ...${this.fragments[0].alias} }
        commit { id }
        createdAt
        mergeRefName
      }

      fragment ${this.alias}_PullRequestCommit on PullRequestCommit {
        commit { id }
      }

      fragment ${this.alias}_PullRequestCommitCommentThread on PullRequestCommitCommentThread {
        comments { totalCount }
        commit { id }
        path
        position
      }

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

      fragment ${this.alias}_PullRequestReview on PullRequestReview {
        ...${this.alias}_Comment
        authorCanPushToRepository
        comments { totalCount  }
        commit { id }
        fullDatabaseId
        isMinimized
        minimizedReason
        reactions { totalCount }
        state
        submittedAt
      }

      fragment ${this.alias}_PullRequestReviewThread on PullRequestReviewThread {
        comments { totalCount }
        diffSide
        isCollapsed
        isOutdated
        isResolved
        line
        originalLine
        originalStartLine
        path
        resolvedBy { ...${this.fragments[0].alias} }
        startDiffSide
        startLine
        subjectType
      }

      fragment ${this.alias}_PullRequestRevisionMarker on PullRequestTimelineItems {
        ... on PullRequestRevisionMarker {
      	  createdAt
      	  lastSeenCommit { id }
        }
      }

      fragment ${this.alias}_ReadyForReviewEvent on ReadyForReviewEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
      }

      fragment ${this.alias}_RemovedFromMergeQueueEvent on RemovedFromMergeQueueEvent {
        actor { ...${this.fragments[0].alias} }
        beforeCommit { id }
        createdAt
        enqueuer { ...${this.fragments[0].alias} }
        mergeQueue { id }
        reason
      }

      fragment ${this.alias}_ReviewDismissedEvent on ReviewDismissedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        databaseId
        dismissalMessage
        previousReviewState
        pullRequestCommit { commit { id } }
        review { id }
      }

      fragment ${this.alias}_ReviewRequestRemovedEvent on ReviewRequestRemovedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        requestedReviewer { ...${this.fragments[0].alias} }
      }

      fragment ${this.alias}_ReviewRequestedEvent on ReviewRequestedEvent {
        actor { ...${this.fragments[0].alias} }
        createdAt
        requestedReviewer { ...${this.fragments[0].alias} }
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
      `
          : ''
      }

      fragment ${this.alias} on Node {
        ...${this.alias}_Node						
        ...${this.alias}_AddedToProjectEvent
        ...${this.alias}_AddedToProjectV2Event
        ...${this.alias}_AssignedEvent
        ...${this.alias}_BlockedByAddedEvent
        ...${this.alias}_BlockedByRemovedEvent
        ...${this.alias}_BlockingAddedEvent
        ...${this.alias}_BlockingRemovedEvent
        ...${this.alias}_ClosedEvent
        ...${this.alias}_CommentDeletedEvent
        ...${this.alias}_ConnectedEvent
        ...${this.alias}_ConvertedNoteToIssueEvent
        ...${this.alias}_ConvertedFromDraftEvent
        ...${this.alias}_ConvertedToDiscussionEvent
        ...${this.alias}_CrossReferencedEvent
        ...${this.alias}_DemilestonedEvent
        ...${this.alias}_DisconnectedEvent
        ...${this.alias}_IssueComment
        ...${this.alias}_IssueTypeAddedEvent
        ...${this.alias}_IssueTypeChangedEvent
        ...${this.alias}_IssueTypeRemovedEvent
        ...${this.alias}_LabeledEvent
        ...${this.alias}_LockedEvent
        ...${this.alias}_MarkedAsDuplicateEvent
        ...${this.alias}_MentionedEvent
        ...${this.alias}_MilestonedEvent
        ...${this.alias}_MovedColumnsInProjectEvent
        ...${this.alias}_ParentIssueAddedEvent
        ...${this.alias}_ParentIssueRemovedEvent
        ...${this.alias}_PinnedEvent
        ...${this.alias}_ProjectV2ItemStatusChangedEvent
        ...${this.alias}_ReferencedEvent
        ...${this.alias}_RemovedFromProjectEvent
        ...${this.alias}_RemovedFromProjectV2Event
        ...${this.alias}_RenamedTitleEvent
        ...${this.alias}_ReopenedEvent
        ...${this.alias}_SubIssueAddedEvent
        ...${this.alias}_SubIssueRemovedEvent
        ...${this.alias}_SubscribedEvent
        ...${this.alias}_TransferredEvent
        ...${this.alias}_UnassignedEvent
        ...${this.alias}_UnlabeledEvent
        ...${this.alias}_UnlockedEvent
        ...${this.alias}_UnmarkedAsDuplicateEvent
        ...${this.alias}_UnpinnedEvent
        ...${this.alias}_UnsubscribedEvent
        ...${this.alias}_UserBlockedEvent

        ${
          this.pullRequest
            ? `
        ...${this.alias}_AddedToMergeQueueEvent
        ...${this.alias}_AutoMergeDisabledEvent
        ...${this.alias}_AutoMergeEnabledEvent
        ...${this.alias}_AutoRebaseEnabledEvent 
        ...${this.alias}_AutoSquashEnabledEvent
        ...${this.alias}_AutomaticBaseChangeFailedEvent
        ...${this.alias}_AutomaticBaseChangeSucceededEvent
        ...${this.alias}_BaseRefChangedEvent
        ...${this.alias}_BaseRefDeletedEvent
        ...${this.alias}_BaseRefForcePushedEvent
        ...${this.alias}_ConvertToDraftEvent
        ...${this.alias}_DeployedEvent
        ...${this.alias}_DeploymentEnvironmentChangedEvent
        ...${this.alias}_HeadRefDeletedEvent
        ...${this.alias}_HeadRefRestoredEvent
        ...${this.alias}_HeadRefForcePushedEvent
        ...${this.alias}_MergedEvent
        ...${this.alias}_PullRequestCommit
        ...${this.alias}_PullRequestCommitCommentThread
        ...${this.alias}_PullRequestReview
        ...${this.alias}_PullRequestReviewThread
        ...${this.alias}_PullRequestRevisionMarker
        ...${this.alias}_ReadyForReviewEvent
        ...${this.alias}_RemovedFromMergeQueueEvent 
        ...${this.alias}_ReviewDismissedEvent
        ...${this.alias}_ReviewRequestRemovedEvent
        ...${this.alias}_ReviewRequestedEvent
        ...${this.alias}_PullRequestReviewCommentFragment
              `
            : ''
        }
      }
    `;
  }

  parse(data: ExtendedIssueTimelineItems | PullRequestTimelineItems): TimelineItem {
    let _data: Record<string, any> = { __typename: data.__typename, id: (data as any).id };

    switch (data.__typename) {
      case 'AddedToProjectEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt
        };
        break;
      case 'AddedToProjectV2Event':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor)
        };
        break;
      case 'ConvertedNoteToIssueEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          database_id: data.databaseId,
          project_column_name: data.projectColumnName
        };
        break;
      case 'AssignedEvent':
      case 'UnassignedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          assignee: data.assignee && this.fragments[0].parse(data.assignee),
          created_at: data.createdAt
        };
        break;
      case 'ClosedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          closer: data.closer && { id: data.closer.id, __typename: data.closer.__typename },
          created_at: data.createdAt,
          duplicate_of: data.duplicateOf?.id
        };
        break;
      case 'BlockedByAddedEvent':
      case 'BlockedByRemovedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          blocking_issue: data.blockingIssue && { id: data.blockingIssue.id, __typename: data.blockingIssue.__typename }
        };
        break;
      case 'BlockingAddedEvent':
      case 'BlockingRemovedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          blocked_issue: data.blockedIssue && { id: data.blockedIssue.id, __typename: data.blockedIssue.__typename }
        };
        break;
      case 'CommentDeletedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          database_id: data.databaseId,
          deleted_comment_author: data.deletedCommentAuthor?.login
        };
        break;
      case 'ConnectedEvent':
      case 'DisconnectedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          is_cross_repository: data.isCrossRepository,
          source: data.source
        };
        break;
      case 'ConvertedFromDraftEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor)
        };
        break;
      case 'ConvertedToDiscussionEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          discussion: data.discussion?.id
        };
        break;
      case 'CrossReferencedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          is_cross_repository: data.isCrossRepository,
          referenced_at: data.referencedAt,
          source: data.source,
          will_close_target: data.willCloseTarget
        };
        break;
      case 'DemilestonedEvent':
      case 'MilestonedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          milestone_title: data.milestoneTitle
        };
        break;
      case 'IssueComment':
        _data = {
          ..._data,
          author: data.author && this.fragments[0].parse(data.author),
          author_association: data.authorAssociation,
          body: data.body,
          created_at: data.createdAt,
          created_via_email: data.createdViaEmail,
          database_id: data.databaseId,
          editor: data.editor && this.fragments[0].parse(data.editor),
          full_database_id: data.fullDatabaseId,
          includes_created_edit: data.includesCreatedEdit,
          is_minimized: data.isMinimized,
          last_edited_at: data.lastEditedAt,
          minimized_reason: data.minimizedReason,
          published_at: data.publishedAt,
          reactions_count: data.reactions?.totalCount,
          updated_at: data.updatedAt
        };
        break;
      case 'IssueTypeAddedEvent':
      case 'IssueTypeChangedEvent':
      case 'IssueTypeRemovedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          issue_type: data.issueType?.name
        };
        if (data.__typename === 'IssueTypeChangedEvent') _data.prev_issue_type = data.prevIssueType?.name;
        break;
      case 'LabeledEvent':
      case 'UnlabeledEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          label: data.label?.name
        };
        break;
      case 'LockedEvent':
      case 'UnlockedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          lock_reason: data.__typename === 'LockedEvent' && data.lockReason
        };
        break;
      case 'MarkedAsDuplicateEvent':
      case 'UnmarkedAsDuplicateEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          canonical: data.canonical,
          created_at: data.createdAt,
          is_cross_repository: data.isCrossRepository
        };
        break;
      case 'ParentIssueAddedEvent':
      case 'ParentIssueRemovedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          parent: data.parent?.id
        };
        break;
      case 'SubIssueAddedEvent':
      case 'SubIssueRemovedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          sub_issue: data.subIssue?.id
        };
        break;
      case 'PinnedEvent':
      case 'UnpinnedEvent':
      case 'SubscribedEvent':
      case 'UnsubscribedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt
        };
        break;
      case 'ProjectV2ItemStatusChangedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor)
        };
        break;
      case 'UserBlockedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          block_duration: data.blockDuration,
          created_at: data.createdAt
        };
        break;
      case 'MentionedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          database_id: data.databaseId
        };
        break;
      case 'MovedColumnsInProjectEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt
        };
        break;
      case 'ReferencedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          commit: data.commit?.id,
          commit_repository: data.commitRepository?.id,
          created_at: data.createdAt,
          is_cross_repository: data.isCrossRepository,
          is_direct_reference: data.isDirectReference
        };
        break;
      case 'RemovedFromProjectEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt
        };
        break;
      case 'RemovedFromProjectV2Event':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor)
        };
        break;
      case 'RenamedTitleEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          current_title: data.currentTitle,
          previous_title: data.previousTitle
        };
        break;
      case 'ReopenedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          state_reason: data.stateReason
        };
        break;
      case 'TransferredEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          from_repository: data.fromRepository?.id
        };
        break;

      case 'AddedToMergeQueueEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          enqueuer: data.enqueuer && this.fragments[0].parse(data.enqueuer),
          merge_queue: data.mergeQueue?.id
        };
        break;
      case 'AutoMergeDisabledEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          disabler: data.disabler && this.fragments[0].parse(data.disabler),
          reason: data.reason,
          reason_code: data.reasonCode
        };
        break;
      case 'AutoMergeEnabledEvent':
      case 'AutoRebaseEnabledEvent':
      case 'AutoSquashEnabledEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          enabler: data.enabler && this.fragments[0].parse(data.enabler)
        };
        break;
      case 'AutomaticBaseChangeFailedEvent':
      case 'AutomaticBaseChangeSucceededEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          new_base: data.newBase,
          old_base: data.oldBase
        };
        break;
      case 'BaseRefChangedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          current_ref_name: data.currentRefName,
          database_id: data.databaseId,
          previous_ref_name: data.previousRefName
        };
        break;
      case 'BaseRefDeletedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          base_ref_name: data.baseRefName,
          created_at: data.createdAt
        };
        break;
      case 'BaseRefForcePushedEvent':
      case 'HeadRefForcePushedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          after_commit: data.afterCommit?.id,
          before_commit: data.beforeCommit?.id,
          created_at: data.createdAt,
          ref: data.ref?.name
        };
        break;
      case 'ConvertToDraftEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt
        };
        break;
      case 'DeployedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          database_id: data.databaseId,
          deployment: data.deployment?.id,
          ref: data.ref?.name
        };
        break;
      case 'DeploymentEnvironmentChangedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          deployment_status: data.deploymentStatus?.state
        };
        break;
      case 'HeadRefDeletedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          head_ref_name: data.headRefName
        };
        break;
      case 'HeadRefRestoredEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt
        };
        break;
      case 'MergedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          commit: data.commit?.id,
          created_at: data.createdAt,
          merge_ref_name: data.mergeRefName
        };
        break;
      case 'PullRequestCommit':
        _data = {
          ..._data,
          commit: data.commit?.id
        };
        break;
      case 'PullRequestCommitCommentThread':
        _data = {
          ..._data,
          comments_count: data.comments.totalCount,
          commit: data.commit?.id,
          path: data.path,
          position: data.position
        };
        break;
      case 'PullRequestReview':
        _data = {
          ..._data,
          author_can_push_to_repository: data.authorCanPushToRepository,
          comments_count: data.comments.totalCount,
          commit: data.commit?.id,
          full_database_id: data.fullDatabaseId,
          is_minimized: data.isMinimized,
          minimized_reason: data.minimizedReason,
          reactions_count: data.reactions?.totalCount,
          state: data.state,
          submitted_at: data.submittedAt,

          author: data.author && this.fragments[0].parse(data.author),
          author_association: data.authorAssociation,
          body: data.body,
          created_at: data.createdAt,
          created_via_email: data.createdViaEmail,
          editor: data.editor && this.fragments[0].parse(data.editor),
          includes_created_edit: data.includesCreatedEdit,
          last_edited_at: data.lastEditedAt,
          published_at: data.publishedAt,
          updated_at: data.updatedAt
        };
        break;
      case 'PullRequestReviewThread':
        _data = {
          ..._data,
          comments_count: data.comments.totalCount,
          diff_side: data.diffSide,
          is_collapsed: data.isCollapsed,
          is_outdated: data.isOutdated,
          is_resolved: data.isResolved,
          line: data.line,
          original_line: data.originalLine,
          original_start_line: data.originalStartLine,
          path: data.path,
          resolved_by: data.resolvedBy && this.fragments[0].parse(data.resolvedBy),
          start_diff_side: data.startDiffSide,
          start_line: data.startLine,
          subject_type: data.subjectType
        };
        break;
      case 'PullRequestRevisionMarker':
        _data = {
          ..._data,
          created_at: data.createdAt,
          last_seen_commit: data.lastSeenCommit?.id
        };
        break;
      case 'ReadyForReviewEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt
        };
        break;
      case 'RemovedFromMergeQueueEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          before_commit: data.beforeCommit?.id,
          created_at: data.createdAt,
          enqueuer: data.enqueuer && this.fragments[0].parse(data.enqueuer),
          merge_queue: data.mergeQueue?.id,
          reason: data.reason
        };
        break;
      case 'ReviewDismissedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          database_id: data.databaseId,
          dismissal_message: data.dismissalMessage,
          previous_review_state: data.previousReviewState,
          pull_request_commit: data.pullRequestCommit?.commit.id,
          review: data.review?.id
        };
        break;
      case 'ReviewRequestRemovedEvent':
      case 'ReviewRequestedEvent':
        _data = {
          ..._data,
          actor: data.actor && this.fragments[0].parse(data.actor),
          created_at: data.createdAt,
          requested_reviewer: data.requestedReviewer && this.fragments[0].parse(data.requestedReviewer)
        };
        break;

      default:
        // biome-ignore lint/suspicious/noConsole: This is useful for debugging unknown types
        console.warn(`Unknown timeline item type: ${data.__typename}. Using UnknownEvent fallback.`);
        _data = {
          __typename: data.__typename,
          id: (data as any).id,
          ...(data as any)
        };
        break;
    }

    return TimelineItemSchema.parse(_data);
  }
}

/**
 *
 */
export class IssueTimelineItemFragment extends TimelineItemFragment {
  constructor(
    public alias = 'IssueTimelineItemFrag',
    opts: { factory: FragmentFactory }
  ) {
    super(alias, { ...opts, pullRequest: false });
  }
}

/**
 *
 */
export class PullRequestTimelineItemFragment extends TimelineItemFragment {
  constructor(
    public alias = 'PullTimelineItemFrag',
    opts: { factory: FragmentFactory }
  ) {
    super(alias, { ...opts, pullRequest: true });
  }
}
