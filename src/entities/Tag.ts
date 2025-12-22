import { z } from 'zod';
import { zodSanitize } from '../helpers/sanitize';
import { GitActorSchema } from './base/GitActorSchema';
import { NodeSchema } from './base/Node';
import { RepositoryNodeSchema } from './base/RepositoryNode';

export const TagSchema = zodSanitize(
  NodeSchema.extend(RepositoryNodeSchema.shape).extend({
    __typename: z.literal('Tag'),
    name: z.string(),
    oid: z.string().optional(),
    message: z.string().optional(),
    tagger: GitActorSchema.optional(),
    target: z.string().optional().describe('The commit the tag points to.')
  })
);

export type Tag = z.output<typeof TagSchema>;
