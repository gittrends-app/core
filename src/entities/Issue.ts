import { z, ZodObjectDef } from 'zod';
import { zodSanitize } from '../helpers/sanitize.js';
import { ActorSchema } from './Actor.js';
import { TimelineItemSchema } from './TimelineItem.js';
import { CommentSchema } from './base/Comment.js';
import { NodeSchema } from './base/Node.js';
import { ReactableSchema } from './base/Reactable.js';
import { RepositoryNodeSchema } from './base/RepositoryNode.js';

const baseIssue = NodeSchema.merge(RepositoryNodeSchema)
  .merge(ReactableSchema)
  .merge(CommentSchema)
  .extend({
    __typename: z.literal('Issue'),
    active_lock_reason: z.string().optional(),
    assignees: z.union([z.array(ActorSchema), z.array(z.string())]).optional(),
    closed: z.boolean(),
    closed_at: z.coerce.date().optional(),
    comments_count: z.number().int(),
    database_id: z.number().int(),
    full_database_id: z.coerce.number().int().optional(),
    is_pinned: z.boolean().optional(),
    labels: z.array(z.string()).optional(),
    linked_branches: z.array(z.string()).optional(),
    locked: z.boolean(),
    milestone: z.string().optional(),
    number: z.number().int(),
    participants_count: z.number().int(),
    state: z.string(),
    state_reason: z.string().optional(),
    timeline_items_count: z.number().int(),
    title: z.string(),

    timeline_items: z.array(TimelineItemSchema).optional()
  });

export const IssueSchema = zodSanitize(
  baseIssue as z.ZodType<z.output<typeof baseIssue>, ZodObjectDef, z.input<typeof baseIssue>>
);

export type Issue = z.output<typeof IssueSchema>;
