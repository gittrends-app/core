import { z } from 'zod';
import { zodSanitize } from '../helpers/sanitize';
import { ActorSchema } from './Actor';
import { NodeSchema } from './base';
import { RepositoryNodeSchema } from './base/RepositoryNode';

export const WatcherSchema = zodSanitize(
  RepositoryNodeSchema.extend({
    __typename: z.literal('Watcher'),
    user: z.union([ActorSchema, NodeSchema])
  })
);

export type Watcher = z.output<typeof WatcherSchema>;
