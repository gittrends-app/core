import { z } from 'zod';
import { zodSanitize } from '../helpers/sanitize.js';
import { ReactionSchema } from './Reaction.js';
import { CommentSchema } from './base/Comment.js';
import { NodeSchema } from './base/Node.js';
import { ReactableSchema } from './base/Reactable.js';

const base = NodeSchema.merge(CommentSchema)
  .merge(ReactableSchema)
  .extend({
    __typename: z.literal('DiscussionComment'),
    database_id: z.number().int(),
    deleted_at: z.coerce.date().optional(),
    discussion: z.string().optional(),
    is_awnser: z.boolean(),
    is_minimized: z.boolean(),
    minimized_reason: z.string().optional(),
    replies_count: z.number().int(),
    reply_to: z.string().optional(),
    upvote_count: z.number().int()
  });

type Input = z.input<typeof base> & {
  reactions?: z.input<typeof ReactionSchema>[];
  replies?: string[] | Input[];
};

type Output = z.output<typeof base> & {
  reactions?: z.input<typeof ReactionSchema>[];
  replies?: string[] | Output[];
};

const Comment: z.ZodType<Output, z.ZodTypeDef, Input> = base.extend({
  reactions: z.array(ReactionSchema).optional(),
  replies: z.lazy(() => z.union([z.string().array(), Comment.array()])).optional()
});

export const DiscussionCommentSchema = zodSanitize(Comment);
export type DiscussionComment = z.output<typeof DiscussionCommentSchema>;
