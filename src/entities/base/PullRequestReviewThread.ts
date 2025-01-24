import { z } from 'zod';
import { ActorSchema } from '../Actor.js';
import { NodeSchema } from './Node.js';
import { PullRequestReviewCommentSchema } from './PullRequestReviewComment.js';

export const PullRequestReviewThreadSchema = NodeSchema.extend({
  __typename: z.literal('PullRequestReviewThread'),
  comments_count: z.number().int(),
  comments: z.array(PullRequestReviewCommentSchema).optional(),
  diff_side: z.string(),
  is_collapsed: z.boolean(),
  is_outdated: z.boolean(),
  is_resolved: z.boolean(),
  line: z.number().int().optional(),
  original_line: z.number().int().optional(),
  original_start_line: z.number().int().optional(),
  path: z.string(),
  resolved_by: z.union([z.string(), ActorSchema]).optional(),
  start_diff_side: z.string().optional(),
  start_line: z.number().int().optional(),
  subject_type: z.string()
});

export type PullRequestReviewThread = z.infer<typeof PullRequestReviewThreadSchema>;
