import { z } from 'zod';
import { zodSanitize } from '../helpers/sanitize';
import { ActorSchema } from './Actor';
import { CommentSchema } from './base/Comment';
import { NodeSchema } from './base/Node';
import { ReactableSchema } from './base/Reactable';
import { RepositoryNodeSchema } from './base/RepositoryNode';
import { TimelineItemSchema } from './TimelineItem';

const baseIssue = NodeSchema.extend(RepositoryNodeSchema.shape)
  .extend(ReactableSchema.shape)
  .extend(CommentSchema.shape)
  .extend({
    __typename: z.literal('Issue'),
    active_lock_reason: z.string().optional(),
    assignees: z.union([z.array(ActorSchema), z.array(z.string())]).optional(),
    blocked_by: z.array(z.string()).optional(),
    blocked_by_count: z.number().int().optional(),
    blocking: z.array(z.string()).optional(),
    blocking_count: z.number().int().optional(),
    closed: z.boolean(),
    closed_at: z.coerce.date().optional(),
    comments_count: z.number().int(),
    database_id: z.number().int(),
    duplicate_of: z.string().optional(),
    full_database_id: z.coerce.number().int().optional(),
    is_pinned: z.boolean().optional(),
    issue_type: z.string().optional(),
    labels: z.array(z.string()).optional(),
    linked_branches: z.array(z.string()).optional(),
    locked: z.boolean(),
    milestone: z.string().optional(),
    number: z.number().int(),
    parent: z.string().optional(),
    participants_count: z.number().int(),
    state: z.string(),
    timeline_items_count: z.number().int(),
    title: z.string(),

    timeline_items: z.array(TimelineItemSchema).optional()
  });

export const IssueSchema = zodSanitize(baseIssue as z.ZodType<z.output<typeof baseIssue>, z.input<typeof baseIssue>>);

export type Issue = z.output<typeof IssueSchema>;
