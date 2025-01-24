import { z } from 'zod';
import { NodeSchema } from './Node.js';

export const MinimizableSchema = NodeSchema.extend({
  is_minimized: z.boolean(),
  minimized_reason: z.string().optional()
});

export type Minimizable = z.output<typeof MinimizableSchema>;
