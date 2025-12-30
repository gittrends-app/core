import { z } from 'zod';
import { zodSanitize } from '../helpers/sanitize';
import { ActorSchema } from './Actor';
import { CommentSchema } from './base/Comment';
import { CommitCommentSchema } from './base/CommitComment';
import { MinimizableSchema } from './base/Minimizable';
import { NodeSchema } from './base/Node';
import { PullRequestReviewCommentSchema } from './base/PullRequestReviewComment';
import { PullRequestReviewThreadSchema } from './base/PullRequestReviewThread';
import { ReactableSchema } from './base/Reactable';

const AddedToProjectEvent = NodeSchema.extend({
  __typename: z.literal('AddedToProjectEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date()
});

const AssignedEvent = NodeSchema.extend({
  __typename: z.literal('AssignedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  assignee: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date()
});

const BlockedByAddedEvent = NodeSchema.extend({
  __typename: z.literal('BlockedByAddedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  blocking_issue: z.object({ id: z.string(), __typename: z.enum(['Issue', 'PullRequest']) }).optional()
});

const BlockedByRemovedEvent = NodeSchema.extend({
  __typename: z.literal('BlockedByRemovedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  blocking_issue: z.object({ id: z.string(), __typename: z.enum(['Issue', 'PullRequest']) }).optional()
});

const BlockingAddedEvent = NodeSchema.extend({
  __typename: z.literal('BlockingAddedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  blocked_issue: z.object({ id: z.string(), __typename: z.enum(['Issue', 'PullRequest']) }).optional()
});

const BlockingRemovedEvent = NodeSchema.extend({
  __typename: z.literal('BlockingRemovedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  blocked_issue: z.object({ id: z.string(), __typename: z.enum(['Issue', 'PullRequest']) }).optional()
});

const ClosedEvent = NodeSchema.extend({
  __typename: z.literal('ClosedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  closer: z.object({ id: z.string(), __typename: z.string() }).optional(),
  created_at: z.coerce.date(),
  duplicate_of: z.string().optional()
});

const CommentDeletedEvent = NodeSchema.extend({
  __typename: z.literal('CommentDeletedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  database_id: z.number().int().optional(),
  deleted_comment_author: z.union([z.string(), ActorSchema]).optional()
});

const ConnectedEvent = NodeSchema.extend({
  __typename: z.literal('ConnectedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  is_cross_repository: z.boolean(),
  source: z.object({ id: z.string(), __typename: z.enum(['Issue', 'PullRequest']) })
});

const ConvertedNoteToIssueEvent = NodeSchema.extend({
  __typename: z.literal('ConvertedNoteToIssueEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  database_id: z.number().int().optional(),
  project_column_name: z.string()
});

const ConvertedToDiscussionEvent = NodeSchema.extend({
  __typename: z.literal('ConvertedToDiscussionEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  discussion: z.string().optional()
});

const CrossReferencedEvent = NodeSchema.extend({
  __typename: z.literal('CrossReferencedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  is_cross_repository: z.boolean(),
  referenced_at: z.coerce.date(),
  source: z.object({ id: z.string(), __typename: z.enum(['Issue', 'PullRequest']) }),
  will_close_target: z.boolean()
});

const DemilestonedEvent = NodeSchema.extend({
  __typename: z.literal('DemilestonedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  milestone_title: z.string()
});

const DisconnectedEvent = NodeSchema.extend({
  __typename: z.literal('DisconnectedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  is_cross_repository: z.boolean(),
  source: z.object({ id: z.string(), __typename: z.enum(['Issue', 'PullRequest']) })
});

const IssueComment = NodeSchema.extend(CommentSchema.shape)
  .extend(ReactableSchema.shape)
  .extend(MinimizableSchema.shape)
  .extend({
    __typename: z.literal('IssueComment'),
    database_id: z.number().int().optional(),
    full_database_id: z.coerce.number().int().optional()
  });

const IssueTypeAddedEvent = NodeSchema.extend({
  __typename: z.literal('IssueTypeAddedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  issue_type: z.string().optional()
});

const IssueTypeChangedEvent = NodeSchema.extend({
  __typename: z.literal('IssueTypeChangedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  issue_type: z.string().optional(),
  prev_issue_type: z.string().optional()
});

const IssueTypeRemovedEvent = NodeSchema.extend({
  __typename: z.literal('IssueTypeRemovedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  issue_type: z.string().optional()
});

const LabeledEvent = NodeSchema.extend({
  __typename: z.literal('LabeledEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  label: z.string()
});

const LockedEvent = NodeSchema.extend({
  __typename: z.literal('LockedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  lock_reason: z.string().optional()
});

const MarkedAsDuplicateEvent = NodeSchema.extend({
  __typename: z.literal('MarkedAsDuplicateEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  canonical: NodeSchema.extend({ id: z.string(), __typename: z.string() }).optional(),
  created_at: z.coerce.date(),
  is_cross_repository: z.boolean()
});

const MentionedEvent = NodeSchema.extend({
  __typename: z.literal('MentionedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  database_id: z.number().int().optional()
});

const MilestonedEvent = NodeSchema.extend({
  __typename: z.literal('MilestonedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  milestone_title: z.string()
});

const MovedColumnsInProjectEvent = NodeSchema.extend({
  __typename: z.literal('MovedColumnsInProjectEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date()
});

const ParentIssueAddedEvent = NodeSchema.extend({
  __typename: z.literal('ParentIssueAddedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  parent: z.string().optional()
});

const ParentIssueRemovedEvent = NodeSchema.extend({
  __typename: z.literal('ParentIssueRemovedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  parent: z.string().optional()
});

const PinnedEvent = NodeSchema.extend({
  __typename: z.literal('PinnedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date()
});

const ReferencedEvent = NodeSchema.extend({
  __typename: z.literal('ReferencedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  commit: z.string().optional(),
  commit_repository: z.string(),
  created_at: z.coerce.date(),
  is_cross_repository: z.boolean(),
  is_direct_reference: z.boolean()
});

const RemovedFromProjectEvent = NodeSchema.extend({
  __typename: z.literal('RemovedFromProjectEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date()
});

const RenamedTitleEvent = NodeSchema.extend({
  __typename: z.literal('RenamedTitleEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  current_title: z.string(),
  previous_title: z.string()
});

const ReopenedEvent = NodeSchema.extend({
  __typename: z.literal('ReopenedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  state_reason: z.string().optional()
});

const SubIssueAddedEvent = NodeSchema.extend({
  __typename: z.literal('SubIssueAddedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  sub_issue: z.string().optional()
});

const SubIssueRemovedEvent = NodeSchema.extend({
  __typename: z.literal('SubIssueRemovedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  sub_issue: z.string().optional()
});

const SubscribedEvent = NodeSchema.extend({
  __typename: z.literal('SubscribedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date()
});

const TransferredEvent = NodeSchema.extend({
  __typename: z.literal('TransferredEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  from_repository: z.string().optional()
});

const UnassignedEvent = NodeSchema.extend({
  __typename: z.literal('UnassignedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  assignee: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date()
});

const UnlabeledEvent = NodeSchema.extend({
  __typename: z.literal('UnlabeledEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  label: z.string()
});

const UnlockedEvent = NodeSchema.extend({
  __typename: z.literal('UnlockedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date()
});

const UnmarkedAsDuplicateEvent = NodeSchema.extend({
  __typename: z.literal('UnmarkedAsDuplicateEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  canonical: NodeSchema.extend({ id: z.string(), __typename: z.string() }).optional(),
  created_at: z.coerce.date(),
  is_cross_repository: z.boolean()
});

const UnpinnedEvent = NodeSchema.extend({
  __typename: z.literal('UnpinnedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date()
});

const UnsubscribedEvent = NodeSchema.extend({
  __typename: z.literal('UnsubscribedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date()
});

const UserBlockedEvent = NodeSchema.extend({
  __typename: z.literal('UserBlockedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  block_duration: z.string(),
  created_at: z.coerce.date()
});

const AddedToMergeQueueEvent = NodeSchema.extend({
  __typename: z.literal('AddedToMergeQueueEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  enqueuer: z.union([z.string(), ActorSchema]).optional(),
  merge_queue: z.string().optional()
});

const AutoMergeDisabledEvent = NodeSchema.extend({
  __typename: z.literal('AutoMergeDisabledEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  disabler: z.union([z.string(), ActorSchema]).optional(),
  reason: z.string().optional(),
  reason_code: z.string().optional()
});

const AutoMergeEnabledEvent = NodeSchema.extend({
  __typename: z.literal('AutoMergeEnabledEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  enabler: z.union([z.string(), ActorSchema]).optional()
});

const AutoRebaseEnabledEvent = NodeSchema.extend({
  __typename: z.literal('AutoRebaseEnabledEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  enabler: z.union([z.string(), ActorSchema]).optional()
});

const AutoSquashEnabledEvent = NodeSchema.extend({
  __typename: z.literal('AutoSquashEnabledEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  enabler: z.union([z.string(), ActorSchema]).optional()
});

const AutomaticBaseChangeFailedEvent = NodeSchema.extend({
  __typename: z.literal('AutomaticBaseChangeFailedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  new_base: z.string(),
  old_base: z.string()
});

const AutomaticBaseChangeSucceededEvent = NodeSchema.extend({
  __typename: z.literal('AutomaticBaseChangeSucceededEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  new_base: z.string(),
  old_base: z.string()
});

const BaseRefChangedEvent = NodeSchema.extend({
  __typename: z.literal('BaseRefChangedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  current_ref_name: z.string(),
  database_id: z.number().int().optional(),
  previous_ref_name: z.string()
});

const BaseRefDeletedEvent = NodeSchema.extend({
  __typename: z.literal('BaseRefDeletedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  base_ref_name: z.string().optional(),
  created_at: z.coerce.date()
});

const BaseRefForcePushedEvent = NodeSchema.extend({
  __typename: z.literal('BaseRefForcePushedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  after_commit: z.string().optional(),
  before_commit: z.string().optional(),
  created_at: z.coerce.date(),
  ref: z.string().optional()
});

const ConvertToDraftEvent = NodeSchema.extend({
  __typename: z.literal('ConvertToDraftEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date()
});

const DeployedEvent = NodeSchema.extend({
  __typename: z.literal('DeployedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  database_id: z.number().int().optional(),
  deployment: z.string(),
  ref: z.string().optional()
});

const DeploymentEnvironmentChangedEvent = NodeSchema.extend({
  __typename: z.literal('DeploymentEnvironmentChangedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  deployment_status: z.string()
});

const HeadRefDeletedEvent = NodeSchema.extend({
  __typename: z.literal('HeadRefDeletedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  head_ref_name: z.string()
});

const HeadRefRestoredEvent = NodeSchema.extend({
  __typename: z.literal('HeadRefRestoredEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date()
});

const HeadRefForcePushedEvent = NodeSchema.extend({
  __typename: z.literal('HeadRefForcePushedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  after_commit: z.string().optional(),
  before_commit: z.string().optional(),
  created_at: z.coerce.date(),
  ref: z.string().optional()
});

const MergedEvent = NodeSchema.extend({
  __typename: z.literal('MergedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  commit: z.string().optional(),
  created_at: z.coerce.date(),
  merge_ref_name: z.string()
});

const AddedToProjectV2Event = NodeSchema.extend({
  __typename: z.literal('AddedToProjectV2Event'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  project: z.string().optional(),
  was_automated: z.boolean()
});

const ConvertedFromDraftEvent = NodeSchema.extend({
  __typename: z.literal('ConvertedFromDraftEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  project: z.string().optional(),
  was_automated: z.boolean()
});

const ProjectV2ItemStatusChangedEvent = NodeSchema.extend({
  __typename: z.literal('ProjectV2ItemStatusChangedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  previous_status: z.string(),
  project: z.string().optional(),
  status: z.string(),
  was_automated: z.boolean()
});

const RemovedFromProjectV2Event = NodeSchema.extend({
  __typename: z.literal('RemovedFromProjectV2Event'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  project: z.string().optional(),
  was_automated: z.boolean()
});

const PullRequestCommit = NodeSchema.extend({
  __typename: z.literal('PullRequestCommit'),
  commit: z.string()
});

const PullRequestCommitCommentThread = NodeSchema.extend({
  __typename: z.literal('PullRequestCommitCommentThread'),
  comments_count: z.number().int(),
  comments: z.array(CommitCommentSchema).optional(),
  commit: z.string(),
  path: z.string().optional(),
  position: z.number().int().optional()
});

const PullRequestReview = NodeSchema.extend(CommentSchema.shape)
  .extend(MinimizableSchema.shape)
  .extend(ReactableSchema.shape)
  .extend({
    __typename: z.literal('PullRequestReview'),
    author_can_push_to_repository: z.boolean(),
    comments_count: z.number().int(),
    comments: z.array(PullRequestReviewCommentSchema).optional(),
    commit: z.string().optional(),
    full_database_id: z.coerce.number().int().optional(),
    state: z.string(),
    submitted_at: z.coerce.date().optional()
  });

// const PullRequestRevisionMarker = node.extend({
//   __typename: z.literal('PullRequestRevisionMarker'),
//   created_at: z.coerce.date(),
//   last_seen_commit: z.string()
// });

const ReadyForReviewEvent = NodeSchema.extend({
  __typename: z.literal('ReadyForReviewEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date()
});

const RemovedFromMergeQueueEvent = NodeSchema.extend({
  __typename: z.literal('RemovedFromMergeQueueEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  before_commit: z.string().optional(),
  created_at: z.coerce.date(),
  enqueuer: z.union([z.string(), ActorSchema]).optional(),
  merge_queue: z.string().optional(),
  reason: z.string().optional()
});

const ReviewDismissedEvent = NodeSchema.extend({
  __typename: z.literal('ReviewDismissedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  database_id: z.number().int().optional(),
  dismissal_message: z.string().optional(),
  previous_review_state: z.string(),
  pull_request_commit: z.string().optional(),
  review: z.string().optional()
});

const ReviewRequestRemovedEvent = NodeSchema.extend({
  __typename: z.literal('ReviewRequestRemovedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  requested_reviewer: z.union([z.string(), ActorSchema]).optional()
});

const ReviewRequestedEvent = NodeSchema.extend({
  __typename: z.literal('ReviewRequestedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  requested_reviewer: z.union([z.string(), ActorSchema]).optional()
});

const UnknownEvent = z.looseObject({
  id: z.string(),
  __typename: z.string().refine((val) => val.endsWith('Event'), {
    message: 'Unknown timeline item type must be a valid event'
  })
});

// Tipos dos eventos (apenas assinaturas, sem corpo completo)
type TimelineEvents =
  | z.infer<typeof AddedToMergeQueueEvent>
  | z.infer<typeof AddedToProjectEvent>
  | z.infer<typeof AddedToProjectV2Event>
  | z.infer<typeof AssignedEvent>
  | z.infer<typeof AutomaticBaseChangeFailedEvent>
  | z.infer<typeof AutomaticBaseChangeSucceededEvent>
  | z.infer<typeof AutoMergeDisabledEvent>
  | z.infer<typeof AutoMergeEnabledEvent>
  | z.infer<typeof AutoRebaseEnabledEvent>
  | z.infer<typeof AutoSquashEnabledEvent>
  | z.infer<typeof BaseRefChangedEvent>
  | z.infer<typeof BaseRefDeletedEvent>
  | z.infer<typeof BaseRefForcePushedEvent>
  | z.infer<typeof BlockedByAddedEvent>
  | z.infer<typeof BlockedByRemovedEvent>
  | z.infer<typeof BlockingAddedEvent>
  | z.infer<typeof BlockingRemovedEvent>
  | z.infer<typeof ClosedEvent>
  | z.infer<typeof CommentDeletedEvent>
  | z.infer<typeof ConnectedEvent>
  | z.infer<typeof ConvertedFromDraftEvent>
  | z.infer<typeof ConvertedNoteToIssueEvent>
  | z.infer<typeof ConvertedToDiscussionEvent>
  | z.infer<typeof ConvertToDraftEvent>
  | z.infer<typeof CrossReferencedEvent>
  | z.infer<typeof DemilestonedEvent>
  | z.infer<typeof DeployedEvent>
  | z.infer<typeof DeploymentEnvironmentChangedEvent>
  | z.infer<typeof DisconnectedEvent>
  | z.infer<typeof HeadRefDeletedEvent>
  | z.infer<typeof HeadRefForcePushedEvent>
  | z.infer<typeof HeadRefRestoredEvent>
  | z.infer<typeof IssueComment>
  | z.infer<typeof IssueTypeAddedEvent>
  | z.infer<typeof IssueTypeChangedEvent>
  | z.infer<typeof IssueTypeRemovedEvent>
  | z.infer<typeof LabeledEvent>
  | z.infer<typeof LockedEvent>
  | z.infer<typeof MarkedAsDuplicateEvent>
  | z.infer<typeof MentionedEvent>
  | z.infer<typeof MergedEvent>
  | z.infer<typeof MilestonedEvent>
  | z.infer<typeof MovedColumnsInProjectEvent>
  | z.infer<typeof ParentIssueAddedEvent>
  | z.infer<typeof ParentIssueRemovedEvent>
  | z.infer<typeof PinnedEvent>
  | z.infer<typeof ProjectV2ItemStatusChangedEvent>
  | z.infer<typeof PullRequestCommit>
  | z.infer<typeof PullRequestCommitCommentThread>
  | z.infer<typeof PullRequestReview>
  | z.infer<typeof PullRequestReviewThreadSchema>
  | z.infer<typeof ReadyForReviewEvent>
  | z.infer<typeof ReferencedEvent>
  | z.infer<typeof RemovedFromMergeQueueEvent>
  | z.infer<typeof RemovedFromProjectEvent>
  | z.infer<typeof RemovedFromProjectV2Event>
  | z.infer<typeof RenamedTitleEvent>
  | z.infer<typeof ReopenedEvent>
  | z.infer<typeof ReviewDismissedEvent>
  | z.infer<typeof ReviewRequestedEvent>
  | z.infer<typeof ReviewRequestRemovedEvent>
  | z.infer<typeof SubIssueAddedEvent>
  | z.infer<typeof SubIssueRemovedEvent>
  | z.infer<typeof SubscribedEvent>
  | z.infer<typeof TransferredEvent>
  | z.infer<typeof UnassignedEvent>
  | z.infer<typeof UnlabeledEvent>
  | z.infer<typeof UnlockedEvent>
  | z.infer<typeof UnmarkedAsDuplicateEvent>
  | z.infer<typeof UnpinnedEvent>
  | z.infer<typeof UnsubscribedEvent>
  | z.infer<typeof UserBlockedEvent>;

const list: z.ZodType<TimelineEvents> = z.discriminatedUnion('__typename', [
  AddedToMergeQueueEvent,
  AddedToProjectEvent,
  AddedToProjectV2Event,
  AssignedEvent,
  AutomaticBaseChangeFailedEvent,
  AutomaticBaseChangeSucceededEvent,
  AutoMergeDisabledEvent,
  AutoMergeEnabledEvent,
  AutoRebaseEnabledEvent,
  AutoSquashEnabledEvent,
  BaseRefChangedEvent,
  BaseRefDeletedEvent,
  BaseRefForcePushedEvent,
  BlockedByAddedEvent,
  BlockedByRemovedEvent,
  BlockingAddedEvent,
  BlockingRemovedEvent,
  ClosedEvent,
  CommentDeletedEvent,
  ConnectedEvent,
  ConvertedFromDraftEvent,
  ConvertedNoteToIssueEvent,
  ConvertedToDiscussionEvent,
  ConvertToDraftEvent,
  CrossReferencedEvent,
  DemilestonedEvent,
  DeployedEvent,
  DeploymentEnvironmentChangedEvent,
  DisconnectedEvent,
  HeadRefDeletedEvent,
  HeadRefForcePushedEvent,
  HeadRefRestoredEvent,
  IssueComment,
  IssueTypeAddedEvent,
  IssueTypeChangedEvent,
  IssueTypeRemovedEvent,
  LabeledEvent,
  LockedEvent,
  MarkedAsDuplicateEvent,
  MentionedEvent,
  MergedEvent,
  MilestonedEvent,
  MovedColumnsInProjectEvent,
  ParentIssueAddedEvent,
  ParentIssueRemovedEvent,
  PinnedEvent,
  ProjectV2ItemStatusChangedEvent,
  PullRequestCommit,
  PullRequestCommitCommentThread,
  PullRequestReview,
  PullRequestReviewThreadSchema,
  ReadyForReviewEvent,
  ReferencedEvent,
  RemovedFromMergeQueueEvent,
  RemovedFromProjectEvent,
  RemovedFromProjectV2Event,
  RenamedTitleEvent,
  ReopenedEvent,
  ReviewDismissedEvent,
  ReviewRequestedEvent,
  ReviewRequestRemovedEvent,
  SubIssueAddedEvent,
  SubIssueRemovedEvent,
  SubscribedEvent,
  TransferredEvent,
  UnassignedEvent,
  UnlabeledEvent,
  UnlockedEvent,
  UnmarkedAsDuplicateEvent,
  UnpinnedEvent,
  UnsubscribedEvent,
  UserBlockedEvent,
  UnknownEvent
]) as z.ZodType<TimelineEvents>;

export const TimelineItemSchema = zodSanitize(list);

export type TimelineItem = z.output<typeof TimelineItemSchema>;
