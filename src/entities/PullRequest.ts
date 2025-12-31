import { z } from 'zod';
import { zodSanitize } from '../helpers/sanitize';
import { ActorSchema } from './Actor';
import { CommentSchema } from './base/Comment';
import { NodeSchema } from './base/Node';
import { ReactableSchema } from './base/Reactable';
import { RepositoryNodeSchema } from './base/RepositoryNode';
import { TimelineItemSchema } from './TimelineItem';

// Schema base sem timeline_items para reduzir complexidade de inferência
const basePr = NodeSchema.extend(RepositoryNodeSchema.shape)
  .extend(CommentSchema.shape)
  .extend(ReactableSchema.shape)
  .extend({
    __typename: z.literal('PullRequest'),
    active_lock_reason: z.string().optional(),
    assignees: z.union([ActorSchema.array(), NodeSchema.array()]).optional(),
    closed: z.boolean(),
    closed_at: z.coerce.date().optional(),
    comments_count: z.number().int(),
    database_id: z.number().int(),
    full_database_id: z.coerce.number().int().optional(),
    id: z.string(),
    labels: z.array(z.string()).optional(),
    locked: z.boolean(),
    milestone: z.string().optional(),
    number: z.number().int(),
    participants_count: z.number().int(),
    repository: z.string(),
    state: z.string(),
    timeline_items_count: z.number().int(),
    title: z.string(),

    additions: z.number().int(),
    auto_merge_request: z
      .object({
        author_email: z.string().optional(),
        commit_body: z.string().optional(),
        commit_headline: z.string().optional(),
        enabled_at: z.coerce.date().optional(),
        enabled_by: z.union([ActorSchema, NodeSchema]).optional(),
        merge_method: z.string().optional()
      })
      .optional(),
    base_ref_name: z.string(),
    base_ref_oid: z.string(),
    base_repository: z.string(),
    can_be_rebased: z.boolean(),
    changed_files: z.number().int(),
    deletions: z.number().int(),
    files_count: z.number().int().optional(),
    head_ref_name: z.string(),
    head_ref_oid: z.string(),
    head_repository: z.string().optional(),
    head_repository_owner: z.string().optional(),
    is_cross_repository: z.boolean(),
    is_draft: z.boolean(),
    maintainer_can_modify: z.boolean(),
    merge_commit: z.string().optional(),
    merge_state_status: z.string(),
    mergeable: z.string(),
    merged: z.boolean(),
    merged_at: z.coerce.date().optional(),
    merged_by: z.union([ActorSchema, NodeSchema]).optional(),
    potential_merge_commit: z.string().optional(),
    review_decision: z.string().optional(),
    reviews_count: z.number().int(),
    suggested_reviewers: z
      .array(
        z.object({
          is_author: z.boolean(),
          is_commenter: z.boolean(),
          reviewer: ActorSchema
        })
      )
      .optional(),
    total_comments_count: z.number().int()
  });

// Tipo base inferido
type BasePullRequest = z.infer<typeof basePr>;

// Tipo extendido inferido
type ExtendedPullRequest = z.ZodType<
  BasePullRequest & {
    timeline_items?: z.infer<typeof TimelineItemSchema>[] | z.infer<typeof NodeSchema>[];
  }
>;

// Schema completo com timeline_items
export const PullRequestSchema = zodSanitize(
  basePr.extend({
    timeline_items: z.union([TimelineItemSchema.array(), NodeSchema.array()]).optional()
  }) as ExtendedPullRequest
);

export type PullRequest = z.output<typeof PullRequestSchema>;
