import { z, ZodObjectDef } from 'zod';
import { zodSanitize } from '../helpers/sanitize.js';
import { ActorSchema } from './Actor.js';
import { TimelineItemSchema } from './TimelineItem.js';
import { CommentSchema } from './base/Comment.js';
import { NodeSchema } from './base/Node.js';
import { ReactableSchema } from './base/Reactable.js';
import { RepositoryNodeSchema } from './base/RepositoryNode.js';

const pr = NodeSchema.merge(RepositoryNodeSchema)
  .merge(CommentSchema)
  .merge(ReactableSchema)
  .extend({
    __typename: z.literal('PullRequest'),
    active_lock_reason: z.string().optional(),
    assignees: z.union([z.array(ActorSchema), z.array(z.string())]).optional(),
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
        enabled_by: z.union([z.string(), ActorSchema]).optional(),
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
    merged_by: z.union([ActorSchema, z.string()]).optional(),
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
    total_comments_count: z.number().int(),

    timeline_items: z.union([z.string().array(), TimelineItemSchema.array()]).optional()
  });

export const PullRequestSchema = zodSanitize(pr as z.ZodType<z.output<typeof pr>, ZodObjectDef, z.input<typeof pr>>);

export type PullRequest = z.output<typeof PullRequestSchema>;
