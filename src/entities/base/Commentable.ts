import { z } from 'zod';
import { zodSanitize } from '../../helpers/sanitize.js';
import { CommitCommentSchema } from './CommitComment.js';
import { PullRequestReviewCommentSchema } from './PullRequestReviewComment.js';

export const CommentableSchema = zodSanitize(
  z.object({
    comments_count: z.number().int(),
    comments: z.union([z.array(PullRequestReviewCommentSchema), z.array(CommitCommentSchema)]).optional()
  })
);

export type Commentable = z.output<typeof CommentableSchema>;
