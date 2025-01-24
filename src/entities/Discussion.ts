import { z } from 'zod';
import { zodSanitize } from '../helpers/sanitize.js';
import { ActorSchema } from './Actor.js';
import { DiscussionCommentSchema } from './DiscussionComment.js';
import { CommentSchema } from './base/Comment.js';
import { NodeSchema } from './base/Node.js';
import { ReactableSchema } from './base/Reactable.js';
import { RepositoryNodeSchema } from './base/RepositoryNode.js';

export const DiscussionSchema = zodSanitize(
  NodeSchema.merge(RepositoryNodeSchema)
    .merge(CommentSchema)
    .merge(ReactableSchema)
    .extend({
      __typename: z.literal('Discussion'),
      database_id: z.number(),
      active_lock_reason: z.string().optional(),
      answer: z.union([z.string(), DiscussionCommentSchema]).optional(),
      answer_chosen_at: z.coerce.date().optional(),
      answer_chosen_by: z.union([z.string(), ActorSchema]).optional(),
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

      comments: z.union([z.string().array(), DiscussionCommentSchema.array()]).optional()
    })
);

export type Discussion = z.output<typeof DiscussionSchema>;
