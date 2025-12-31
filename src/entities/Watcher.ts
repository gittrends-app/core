import { z } from 'zod';
import { zodSanitize } from '../helpers/sanitize';
import { ActorSchema } from './Actor';
import { RepositoryNodeSchema } from './base/RepositoryNode';
import { NodeSchema } from './base';

export const WatcherSchema = zodSanitize(
  RepositoryNodeSchema.extend({
    __typename: z.literal('Watcher'),
    user: z.union([ActorSchema, NodeSchema])
  })
);

export type Watcher = z.output<typeof WatcherSchema>;
