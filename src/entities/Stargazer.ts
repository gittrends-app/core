import { z } from 'zod';
import { zodSanitize } from '../helpers/sanitize';
import { ActorSchema } from './Actor';
import { NodeSchema } from './base';
import { RepositoryNodeSchema } from './base/RepositoryNode';

export const StargazerSchema = zodSanitize(
  RepositoryNodeSchema.extend({
    __typename: z.literal('Stargazer'),
    starred_at: z.coerce.date(),
    user: z.union([ActorSchema, NodeSchema])
  })
);

export type Stargazer = z.output<typeof StargazerSchema>;
