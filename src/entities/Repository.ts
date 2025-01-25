import { z } from 'zod';
import { zodSanitize } from '../helpers/sanitize';
import { ActorSchema } from './Actor';
import { NodeSchema } from './base/Node';

const baseRepository = NodeSchema.extend({
  __typename: z.literal('Repository'),
  database_id: z.number().int(),
  description: z.string().optional(),
  name: z.string(),
  name_with_owner: z.string(),
  owner: z.union([z.string(), ActorSchema]),
  primary_language: z.string().optional()
});

const extendedRepository = z
  .object({
    allow_update_branch: z.boolean(),
    archived_at: z.coerce.date(),
    auto_merge_allowed: z.boolean(),
    code_of_conduct: z.string(),
    contributing_guidelines: z.string(),
    created_at: z.coerce.date(),
    default_branch: z.string(),
    commits_count: z.number().int(),
    delete_branch_on_merge: z.boolean(),
    disk_usage: z.number().int(),
    forking_allowed: z.boolean(),
    funding_links: z.array(z.object({ platform: z.string(), url: z.string() })),
    has_discussions_enabled: z.boolean(),
    has_issues_enabled: z.boolean(),
    has_projects_enabled: z.boolean(),
    has_sponsorships_enabled: z.boolean(),
    has_vulnerability_alerts_enabled: z.boolean(),
    has_wiki_enabled: z.boolean(),
    homepage_url: z.string(),
    is_archived: z.boolean(),
    is_blank_issues_enabled: z.boolean(),
    is_disabled: z.boolean(),
    is_empty: z.boolean(),
    is_fork: z.boolean(),
    is_in_organization: z.boolean(),
    is_locked: z.boolean(),
    is_mirror: z.boolean(),
    is_security_policy_enabled: z.boolean(),
    languages: z.array(z.object({ name: z.string(), size: z.number().int() })),
    license_info: z.string(),
    lock_reason: z.string().nullable(),
    merge_commit_allowed: z.boolean(),
    merge_commit_message: z.string().nullable(),
    merge_commit_title: z.string().nullable(),
    mirror_url: z.string().nullable(),
    parent: z.string(),
    pushed_at: z.coerce.date(),
    rebase_merge_allowed: z.boolean(),
    repository_topics: z.array(z.string()),
    security_policy_url: z.string().nullable(),
    squash_merge_allowed: z.boolean(),
    squash_merge_commit_message: z.string().nullable(),
    squash_merge_commit_title: z.string().nullable(),
    template_repository: z.string().nullable(),
    updated_at: z.coerce.date(),
    uses_custom_open_graph_image: z.boolean(),
    visibility: z.string(),
    web_commit_signoff_required: z.boolean(),

    assignable_users_count: z.number().int(),
    deployments_count: z.number().int(),
    discussions_count: z.number().int(),
    environments_count: z.number().int(),
    fork_count: z.number().int(),
    issues_count: z.number().int(),
    milestones_count: z.number().int(),
    packages_count: z.number().int(),
    pull_requests_count: z.number().int(),
    branches_count: z.number().int(),
    tags_count: z.number().int(),
    releases_count: z.number().int(),
    rulesets_count: z.number().int(),
    stargazers_count: z.number().int(),
    submodules_count: z.number().int(),
    vulnerability_alerts_count: z.number().int(),
    watchers_count: z.number().int()
  })
  .partial();

export const RepositorySchema = zodSanitize(baseRepository.merge(extendedRepository));
export type Repository = z.infer<typeof RepositorySchema>;
