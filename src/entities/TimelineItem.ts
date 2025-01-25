import { z, ZodDiscriminatedUnionDef } from 'zod';
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
  created_at: z.coerce.date(),
  database_id: z.number().int().optional(),
  project: z.string().optional(),
  project_card: z.string().optional(),
  project_column_name: z.string()
});

const AssignedEvent = NodeSchema.extend({
  __typename: z.literal('AssignedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  assignee: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date()
});

const ClosedEvent = NodeSchema.extend({
  __typename: z.literal('ClosedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  closer: z.object({ id: z.string(), __typename: z.string() }).optional(),
  created_at: z.coerce.date(),
  state_reason: z.string().optional()
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
  project: z.string().optional(),
  project_card: z.string().optional(),
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

const IssueComment = NodeSchema.merge(CommentSchema)
  .merge(ReactableSchema)
  .merge(MinimizableSchema)
  .extend({
    __typename: z.literal('IssueComment'),
    database_id: z.number().int().optional(),
    full_database_id: z.coerce.number().int().optional()
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
  created_at: z.coerce.date(),
  database_id: z.number().int().optional(),
  previous_project_column_name: z.string(),
  project: z.string().optional(),
  project_card: z.string().optional(),
  project_column_name: z.string()
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
  created_at: z.coerce.date(),
  database_id: z.number().int().optional(),
  project: z.string().optional(),
  project_column_name: z.string()
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

const PullRequestReview = NodeSchema.merge(CommentSchema)
  .merge(MinimizableSchema)
  .merge(ReactableSchema)
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

const list = z.discriminatedUnion('__typename', [
  AddedToMergeQueueEvent,
  AddedToProjectEvent,
  AssignedEvent,
  AutoMergeDisabledEvent,
  AutoMergeEnabledEvent,
  AutoRebaseEnabledEvent,
  AutoSquashEnabledEvent,
  AutomaticBaseChangeFailedEvent,
  AutomaticBaseChangeSucceededEvent,
  BaseRefChangedEvent,
  BaseRefDeletedEvent,
  BaseRefForcePushedEvent,
  ClosedEvent,
  CommentDeletedEvent,
  ConnectedEvent,
  ConvertToDraftEvent,
  ConvertedNoteToIssueEvent,
  ConvertedToDiscussionEvent,
  CrossReferencedEvent,
  DemilestonedEvent,
  DeployedEvent,
  DeploymentEnvironmentChangedEvent,
  DisconnectedEvent,
  HeadRefDeletedEvent,
  HeadRefForcePushedEvent,
  HeadRefRestoredEvent,
  IssueComment,
  LabeledEvent,
  LockedEvent,
  MarkedAsDuplicateEvent,
  MentionedEvent,
  MergedEvent,
  MilestonedEvent,
  MovedColumnsInProjectEvent,
  PinnedEvent,
  PullRequestCommit,
  PullRequestCommitCommentThread,
  PullRequestReview,
  PullRequestReviewThreadSchema,
  ReadyForReviewEvent,
  ReferencedEvent,
  RemovedFromMergeQueueEvent,
  RemovedFromProjectEvent,
  RenamedTitleEvent,
  ReopenedEvent,
  ReviewDismissedEvent,
  ReviewRequestRemovedEvent,
  ReviewRequestedEvent,
  SubscribedEvent,
  TransferredEvent,
  UnassignedEvent,
  UnlabeledEvent,
  UnlockedEvent,
  UnmarkedAsDuplicateEvent,
  UnpinnedEvent,
  UnsubscribedEvent,
  UserBlockedEvent
]);

export const TimelineItemSchema = zodSanitize(
  list as z.ZodType<z.output<typeof list>, ZodDiscriminatedUnionDef<'__typename'>, z.input<typeof list>>
);

export type TimelineItem = z.output<typeof TimelineItemSchema>;
