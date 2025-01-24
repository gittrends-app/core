import { z } from 'zod';
import { CommentSchema } from './Comment.js';
import { MinimizableSchema } from './Minimizable.js';
import { NodeSchema } from './Node.js';
import { ReactableSchema } from './Reactable.js';

export const CommitCommentSchema = NodeSchema.merge(CommentSchema)
  .merge(MinimizableSchema)
  .merge(ReactableSchema)
  .extend({
    __typename: z.literal('CommitComment'),
    commit: z.string().optional(),
    database_id: z.number().int().optional(),
    path: z.string().optional(),
    position: z.number().int().optional()
  });

export type CommitComment = z.output<typeof CommitCommentSchema>;
