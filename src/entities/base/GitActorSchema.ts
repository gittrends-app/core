import { z } from 'zod';
import { ActorSchema } from '../Actor';

export const GitActorSchema = z.object({
  date: z.coerce.date().optional(),
  email: z.string().optional(),
  name: z.string().optional(),
  user: ActorSchema.optional()
});

export type GitActor = z.output<typeof GitActorSchema>;
