import { z } from 'zod';
import { zodSanitize } from '../helpers/sanitize';
import { NodeSchema } from './base/Node';

const Actor = NodeSchema.extend({
  login: z.string(),
  avatar_url: z.string(),
  __typename: z.enum(['User', 'Organization', 'Bot', 'Mannequin', 'EnterpriseUserAccount'])
});

const Bot = Actor.extend({ __typename: z.literal('Bot') }).merge(
  z
    .object({
      created_at: z.coerce.date(),
      database_id: z.number().int().optional(),
      updated_at: z.coerce.date()
    })
    .partial()
);

const User = Actor.extend({ __typename: z.literal('User') }).merge(
  z
    .object({
      bio: z.string().optional(),
      company: z.string().optional(),
      created_at: z.coerce.date(),
      database_id: z.number().int().optional(),
      email: z.string().optional(),
      has_sponsors_listing: z.boolean(),
      is_bounty_hunter: z.boolean(),
      is_campus_expert: z.boolean(),
      is_developer_program_member: z.boolean(),
      is_employee: z.boolean(),
      is_github_star: z.boolean(),
      is_hireable: z.boolean(),
      is_site_admin: z.boolean(),
      location: z.string().optional(),
      name: z.string().optional(),
      pronouns: z.string().optional(),
      social_accounts: z.record(z.string()).optional(),
      twitter_username: z.string().optional(),
      updated_at: z.coerce.date(),
      website_url: z.string().optional(),

      followers_count: z.number().int(),
      following_count: z.number().int(),
      gists_count: z.number().int(),
      issues_count: z.number().int(),
      organizations_count: z.number().int(),
      pull_requests_count: z.number().int(),
      repositories_count: z.number().int(),
      repositories_contributed_to_count: z.number().int(),
      repository_discussions_count: z.number().int(),
      sponsoring_count: z.number().int(),
      sponsors_count: z.number().int(),
      starred_repositories_count: z.number().int(),
      watching_count: z.number().int()
    })
    .partial()
);

const Mannequin = Actor.extend({ __typename: z.literal('Mannequin') }).merge(
  z
    .object({
      claimant: z.union([z.string(), User]),
      created_at: z.coerce.date(),
      database_id: z.number().int().optional(),
      email: z.string().optional(),
      updated_at: z.coerce.date()
    })
    .partial()
);

const Enterprise = Actor.extend({ __typename: z.literal('EnterpriseUserAccount') }).merge(
  z
    .object({
      name: z.string(),
      updated_at: z.coerce.date(),
      user: z.union([z.string(), User])
    })
    .partial()
);

const organization = Actor.extend({ __typename: z.literal('Organization') }).merge(
  z
    .object({
      archived_at: z.coerce.date().optional(),
      created_at: z.coerce.date(),
      database_id: z.number().int().optional(),
      description: z.string().optional(),
      email: z.string().optional(),
      has_sponsors_listing: z.boolean(),
      is_verified: z.boolean(),
      location: z.string().optional(),
      name: z.string().optional(),
      twitter_username: z.string().optional(),
      updated_at: z.coerce.date(),
      website_url: z.string().optional(),

      members_with_role_count: z.number().int(),
      repositories_count: z.number().int(),
      sponsoring_count: z.number().int(),
      sponsors_count: z.number().int()
    })
    .partial()
);

export const ActorSchema = zodSanitize(
  z.discriminatedUnion('__typename', [User, Bot, Mannequin, Enterprise, organization])
);

export type Actor = z.output<typeof ActorSchema>;
export type Bot = z.output<typeof Bot>;
export type User = z.output<typeof User>;
export type Mannequin = z.output<typeof Mannequin>;
export type EnterpriseUserAccount = z.output<typeof Enterprise>;
export type Organization = z.output<typeof organization>;
