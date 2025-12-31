import { z } from 'zod';
import { zodSanitize } from '../helpers/sanitize';
import { ActorSchema } from './Actor';
import { CommentSchema } from './base/Comment';
import { NodeSchema } from './base/Node';
import { ReactableSchema } from './base/Reactable';
import { RepositoryNodeSchema } from './base/RepositoryNode';
import { DiscussionCommentSchema } from './DiscussionComment';

export const DiscussionSchema = zodSanitize(
  NodeSchema.extend(RepositoryNodeSchema.shape)
    .extend(CommentSchema.shape)
    .extend(ReactableSchema.shape)
    .extend({
      __typename: z.literal('Discussion'),
      database_id: z.number(),
      active_lock_reason: z.string().optional(),
      answer: z.union([DiscussionCommentSchema, NodeSchema]).optional(),
      answer_chosen_at: z.coerce.date().optional(),
      answer_chosen_by: z.union([ActorSchema, NodeSchema]).optional(),
      category: z.string(),
      closed: z.boolean(),
      closed_at: z.coerce.date().optional(),
      comments_count: z.number().optional(),
      is_awnsered: z.boolean().optional(),
      labels: z.array(z.string()).optional(),
      locked: z.boolean(),
      number: z.number(),
      state_reason: z.string().optional(),
      title: z.string(),
      upvote_count: z.number(),

      comments: z.union([DiscussionCommentSchema.array(), NodeSchema.array()]).optional()
    })
);

export type Discussion = z.output<typeof DiscussionSchema>;
