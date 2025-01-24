import { z } from 'zod';
import { zodSanitize } from '../helpers/sanitize.js';
import { ActorSchema } from './Actor.js';
import { RepositoryNodeSchema } from './base/RepositoryNode.js';

export const WatcherSchema = zodSanitize(
  RepositoryNodeSchema.extend({
    __typename: z.literal('Watcher'),
    user: z.union([z.string(), ActorSchema])
  })
);

export type Watcher = z.output<typeof WatcherSchema>;
