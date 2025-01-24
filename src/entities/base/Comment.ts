import { z } from 'zod';
import { ActorSchema } from '../Actor.js';
import { NodeSchema } from './Node.js';

export const CommentSchema = NodeSchema.extend({
  author: z.union([z.string(), ActorSchema]).optional(),
  author_association: z.string(),
  body: z.string(),
  created_at: z.coerce.date(),
  created_via_email: z.boolean(),
  editor: z.union([z.string(), ActorSchema]).optional(),
  includes_created_edit: z.boolean(),
  last_edited_at: z.coerce.date().optional(),
  published_at: z.coerce.date().optional(),
  updated_at: z.coerce.date()
});

export type Comment = z.output<typeof CommentSchema>;
