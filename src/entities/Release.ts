import { z } from 'zod';
import { zodSanitize } from '../helpers/sanitize';
import { ActorSchema } from './Actor';
import { NodeSchema } from './base/Node';
import { ReactableSchema } from './base/Reactable';
import { RepositoryNodeSchema } from './base/RepositoryNode';

export const ReleaseSchema = zodSanitize(
  NodeSchema.extend(RepositoryNodeSchema.shape)
    .extend(ReactableSchema.shape)
    .extend({
      __typename: z.literal('Release'),
      author: z.union([ActorSchema, NodeSchema]).optional(),
      created_at: z.coerce.date(),
      database_id: z.number().int().optional(),
      immutable: z.boolean().optional(),
      is_draft: z.boolean(),
      is_prerelease: z.boolean(),
      name: z.string().optional(),
      published_at: z.coerce.date().optional(),
      tag_commit: z.string().optional(),
      tag_name: z.string(),
      updated_at: z.coerce.date()
    })
);

export type Release = z.output<typeof ReleaseSchema>;
