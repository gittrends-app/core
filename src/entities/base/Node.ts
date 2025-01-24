import { z } from 'zod';

export const NodeSchema = z.object({
  id: z.string(),
  __typename: z.string()
});

export type Node = z.infer<typeof NodeSchema>;
