import { z } from 'zod';
import { CommentSchema } from './Comment';
import { MinimizableSchema } from './Minimizable';
import { NodeSchema } from './Node';
import { ReactableSchema } from './Reactable';

export const PullRequestReviewCommentSchema = NodeSchema.merge(CommentSchema)
  .merge(MinimizableSchema)
  .merge(ReactableSchema)
  .extend({
    __typename: z.literal('PullRequestReviewComment'),
    commit: z.string().optional(),
    diff_hunk: z.string(),
    drafted_at: z.coerce.date(),
    full_database_id: z.coerce.number().int().optional(),
    line: z.number().int().optional(),
    original_commit: z.string().optional(),
    original_line: z.number().int().optional(),
    original_start_line: z.number().int().optional(),
    outdated: z.boolean(),
    path: z.string(),
    pull_request_review: z.string().optional(),
    reply_to: z.string().optional(),
    start_line: z.number().int().optional(),
    state: z.string(),
    subject_type: z.string()
  });

export type PullRequestReviewComment = z.output<typeof PullRequestReviewCommentSchema>;
