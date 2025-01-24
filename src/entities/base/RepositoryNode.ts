import { z } from 'zod';

export const RepositoryNodeSchema = z.object({
  repository: z.string()
});

export type RepositoryNode = z.infer<typeof RepositoryNodeSchema>;
