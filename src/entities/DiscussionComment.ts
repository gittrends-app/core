import { z } from 'zod';
import { zodSanitize } from '../helpers/sanitize';
import { CommentSchema } from './base/Comment';
import { NodeSchema } from './base/Node';
import { ReactableSchema } from './base/Reactable';
import { ReactionSchema } from './Reaction';

const base = NodeSchema.extend(CommentSchema.shape)
  .extend(ReactableSchema.shape)
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

const Comment: z.ZodType<Output, Input> = base.extend({
  reactions: z.array(ReactionSchema).optional(),
  replies: z.lazy(() => z.union([z.string().array(), Comment.array()])).optional()
});

export const DiscussionCommentSchema = zodSanitize(Comment);
export type DiscussionComment = z.output<typeof DiscussionCommentSchema>;
