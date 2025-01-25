import { z } from 'zod';
import { zodSanitize } from '../helpers/sanitize';
import { ActorSchema } from './Actor';
import { RepositoryNodeSchema } from './base/RepositoryNode';

export const StargazerSchema = zodSanitize(
  RepositoryNodeSchema.extend({
    __typename: z.literal('Stargazer'),
    starred_at: z.coerce.date(),
    user: z.union([z.string(), ActorSchema])
  })
);

export type Stargazer = z.output<typeof StargazerSchema>;
