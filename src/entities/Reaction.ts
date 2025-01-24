import snakeCase from 'lodash/snakeCase.js';
import { z } from 'zod';
import { zodSanitize } from '../helpers/sanitize.js';
import { ActorSchema } from './Actor.js';
import { NodeSchema } from './base/Node.js';

export const ReactionSchema = zodSanitize(
  NodeSchema.extend({
    __typename: z.literal('Reaction'),
    database_id: z.number().int(),
    user: z.union([z.string(), ActorSchema]).optional(),
    content: z.preprocess(
      (v) => (typeof v === 'string' ? snakeCase(v) : v),
      z.enum(['thumbs_up', 'thumbs_down', 'laugh', 'confused', 'heart', 'hooray', 'rocket', 'eyes'])
    ),
    created_at: z.coerce.date(),
    reactable: z.object({ name: z.string(), id: z.string() })
  })
);

export type Reaction = z.output<typeof ReactionSchema>;
