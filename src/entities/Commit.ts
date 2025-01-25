import { z } from 'zod';
import { zodSanitize } from '../helpers/sanitize';
import { GitActorSchema } from './base/GitActorSchema';
import { NodeSchema } from './base/Node';
import { RepositoryNodeSchema } from './base/RepositoryNode';

export const CommitSchema = zodSanitize(
  NodeSchema.merge(RepositoryNodeSchema).extend({
    __typename: z.literal('Commit'),
    additions: z.number().int(),
    author: GitActorSchema.optional(),
    authored_by_committer: z.boolean(),
    authored_date: z.coerce.date().optional(),
    changed_files_if_available: z.number().int().optional(),
    comments_count: z.number().int(),
    committed_date: z.coerce.date().optional(),
    committed_via_web: z.boolean(),
    committer: GitActorSchema.optional(),
    deletions: z.number().int(),
    deployments_count: z.number().int(),
    message: z.string().optional(),
    message_body: z.string().optional(),
    message_headline: z.string().optional(),
    oid: z.string(),
    parents: z.array(z.string()).optional(),
    status: z.string().optional()
  })
);

export type Commit = z.output<typeof CommitSchema>;
