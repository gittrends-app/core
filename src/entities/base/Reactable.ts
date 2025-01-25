import { z } from 'zod';
import { ReactionSchema } from '../Reaction';
import { NodeSchema } from './Node';

export const ReactableSchema = NodeSchema.extend({
  reactions_count: z.number().int(),
  reactions: z.union([z.string().array(), ReactionSchema.array()]).optional()
});

export type Reactable = z.output<typeof ReactableSchema>;
