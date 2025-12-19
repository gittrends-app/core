import { Repository, RepositorySchema } from '../../../../entities/Repository';
import { Booleanify, NullableFields } from '../../../../helpers/types';
import { Commit as GsCommit, Repository as GsRepository } from '../../graphql-schema';
import { ActorFragment } from './ActorFragment';
import { CustomizableFragment, FragmentFactory } from './Fragment';

/**
 *  A fragment to get a repository.
 */
export class RepositoryFragment extends CustomizableFragment<Repository> {
  constructor(
    alias = 'RepositoryFrag',
    opts: { factory: FragmentFactory; fields: boolean | Booleanify<NullableFields<Repository>> }
  ) {
    super(alias, opts);
    this.fragments.push(opts.factory.create(ActorFragment));
  }

  toString(): string {
    return `
    fragment ${this.alias} on Repository {
      __typename
      databaseId
      description
      id
      name
      nameWithOwner
      owner { ...${this.fragments[0].alias} }
      primaryLanguage { name }

      ${this.includes('allow_update_branch', 'allowUpdateBranch')}
      ${this.includes('archived_at', 'archivedAt')}
      ${this.includes('assignable_users_count', 'assignableUsers { totalCount }')}
      ${this.includes('auto_merge_allowed', 'autoMergeAllowed')}
      ${this.includes('branches_count', 'branches:refs(refPrefix: "refs/heads/") { totalCount }')}
      ${this.includes('code_of_conduct', 'codeOfConduct { key }')}
      ${this.includes('contributing_guidelines', 'contributingGuidelines { body }')}
      ${this.includes('created_at', 'createdAt')}
      ${this.includes('default_branch', 'defaultBranchRef { name target { ... on Commit { history { totalCount } } } }')}
      ${this.includes('delete_branch_on_merge', 'deleteBranchOnMerge')}
      ${this.includes('deployments_count', 'deployments { totalCount }')}
      ${this.includes('discussions_count', 'discussions { totalCount }')}
      ${this.includes('disk_usage', 'diskUsage')}
      ${this.includes('environments_count', 'environments { totalCount }')}
      ${this.includes('fork_count', 'forkCount')}
      ${this.includes('forking_allowed', 'forkingAllowed')}
      ${this.includes('funding_links', 'fundingLinks { platform url }')}
      ${this.includes('has_discussions_enabled', 'hasDiscussionsEnabled')}
      ${this.includes('has_issues_enabled', 'hasIssuesEnabled')}
      ${this.includes('has_projects_enabled', 'hasProjectsEnabled')}
      ${this.includes('has_sponsorships_enabled', 'hasSponsorshipsEnabled')}
      ${this.includes('has_vulnerability_alerts_enabled', 'hasVulnerabilityAlertsEnabled')}
      ${this.includes('has_wiki_enabled', 'hasWikiEnabled')}
      ${this.includes('homepage_url', 'homepageUrl')}
      ${this.includes('is_archived', 'isArchived')}
      ${this.includes('is_blank_issues_enabled', 'isBlankIssuesEnabled')}
      ${this.includes('is_disabled', 'isDisabled')}
      ${this.includes('is_empty', 'isEmpty')}
      ${this.includes('is_fork', 'isFork')}
      ${this.includes('is_in_organization', 'isInOrganization')}
      ${this.includes('is_locked', 'isLocked')}
      ${this.includes('is_mirror', 'isMirror')}
      ${this.includes('is_security_policy_enabled', 'isSecurityPolicyEnabled')}
      ${this.includes('issues_count', 'issues { totalCount }')}
      ${this.includes('languages', 'languages(first: 100) { edges { node { name } size } }')}
      ${this.includes('license_info', 'licenseInfo { key }')}
      ${this.includes('lock_reason', 'lockReason')}
      ${this.includes('merge_commit_allowed', 'mergeCommitAllowed')}
      ${this.includes('merge_commit_message', 'mergeCommitMessage')}
      ${this.includes('merge_commit_title', 'mergeCommitTitle')}
      ${this.includes('milestones_count', 'milestones { totalCount }')}
      ${this.includes('mirror_url', 'mirrorUrl')}
      ${this.includes('open_graph_image_url', 'openGraphImageUrl')}
      ${this.includes('packages_count', 'packages { totalCount }')}
      ${this.includes('parent', 'parent { id nameWithOwner }')}
      ${this.includes('pull_requests_count', 'pullRequests { totalCount }')}
      ${this.includes('pushed_at', 'pushedAt')}
      ${this.includes('rebase_merge_allowed', 'rebaseMergeAllowed')}
      ${this.includes('releases_count', 'releases { totalCount }')}
      ${this.includes('repository_topics', 'repositoryTopics(first: 100) { nodes { topic { name } } }')}
      ${this.includes('rulesets_count', 'rulesets { totalCount }')}
      ${this.includes('security_policy_url', 'securityPolicyUrl')}
      ${this.includes('squash_merge_allowed', 'squashMergeAllowed')}
      ${this.includes('squash_merge_commit_message', 'squashMergeCommitMessage')}
      ${this.includes('squash_merge_commit_title', 'squashMergeCommitTitle')}
      ${this.includes('stargazers_count', 'stargazerCount')}
      ${this.includes('submodules_count', 'submodules { totalCount }')}
      ${this.includes('tags_count', 'tags:refs(refPrefix: "refs/tags/") { totalCount }')}
      ${this.includes('template_repository', 'templateRepository { nameWithOwner }')}
      ${this.includes('updated_at', 'updatedAt')}
      ${this.includes('uses_custom_open_graph_image', 'usesCustomOpenGraphImage')}
      ${this.includes('visibility', 'visibility')}
      ${this.includes('vulnerability_alerts_count', 'vulnerabilityAlerts { totalCount }')}
      ${this.includes('watchers_count', 'watchers { totalCount }')}
      ${this.includes('web_commit_signoff_required', 'webCommitSignoffRequired')}
    }`;
  }

  parse(data: GsRepository): Repository {
    return RepositorySchema.parse({
      __typename: data.__typename,
      id: data.id,
      database_id: data.databaseId!,
      description: data.description!,
      name: data.name,
      name_with_owner: data.nameWithOwner,
      open_graph_image_url: data.openGraphImageUrl,
      owner: this.fragments[0].parse(data.owner),
      primary_language: data.primaryLanguage?.name,

      allow_update_branch: data.allowUpdateBranch,
      archived_at: data.archivedAt,
      auto_merge_allowed: data.autoMergeAllowed,
      code_of_conduct: data.codeOfConduct?.key,
      contributing_guidelines: data.contributingGuidelines?.body || undefined,
      created_at: data.createdAt,
      default_branch: data.defaultBranchRef?.name,
      commits_count: (data.defaultBranchRef?.target as GsCommit | undefined)?.history?.totalCount,
      delete_branch_on_merge: data.deleteBranchOnMerge,
      disk_usage: data.diskUsage || undefined,
      forking_allowed: data.forkingAllowed,
      funding_links: data.fundingLinks?.map(({ platform, url }) => ({ platform, url })),
      has_discussions_enabled: data.hasDiscussionsEnabled,
      has_issues_enabled: data.hasIssuesEnabled,
      has_projects_enabled: data.hasProjectsEnabled,
      has_sponsorships_enabled: data.hasSponsorshipsEnabled,
      has_vulnerability_alerts_enabled: data.hasVulnerabilityAlertsEnabled,
      has_wiki_enabled: data.hasWikiEnabled,
      homepage_url: data.homepageUrl,
      is_archived: data.isArchived,
      is_blank_issues_enabled: data.isBlankIssuesEnabled,
      is_disabled: data.isDisabled,
      is_empty: data.isEmpty,
      is_fork: data.isFork,
      is_in_organization: data.isInOrganization,
      is_locked: data.isLocked,
      is_mirror: data.isMirror,
      is_security_policy_enabled: data.isSecurityPolicyEnabled || undefined,
      languages: data.languages?.edges?.map((edge) => ({ name: edge!.node.name, size: edge!.size })),
      license_info: data.licenseInfo?.key,
      lock_reason: data.lockReason || undefined,
      merge_commit_allowed: data.mergeCommitAllowed,
      merge_commit_message: data.mergeCommitMessage || undefined,
      merge_commit_title: data.mergeCommitTitle || undefined,
      mirror_url: data.mirrorUrl || undefined,
      parent: data.parent?.nameWithOwner,
      pushed_at: data.pushedAt,
      rebase_merge_allowed: data.rebaseMergeAllowed,
      repository_topics: data.repositoryTopics?.nodes?.map((node) => node!.topic.name),
      security_policy_url: data.securityPolicyUrl || undefined,
      squash_merge_allowed: data.squashMergeAllowed,
      squash_merge_commit_message: data.squashMergeCommitMessage || undefined,
      squash_merge_commit_title: data.squashMergeCommitTitle || undefined,
      template_repository: data.templateRepository?.nameWithOwner || undefined,
      updated_at: data.updatedAt,
      uses_custom_open_graph_image: data.usesCustomOpenGraphImage,
      visibility: data.visibility,
      web_commit_signoff_required: data.webCommitSignoffRequired,

      assignable_users_count: data.assignableUsers?.totalCount,
      deployments_count: data.deployments?.totalCount,
      discussions_count: data.discussions?.totalCount,
      environments_count: data.environments?.totalCount,
      issues_count: data.issues?.totalCount,
      milestones_count: data.milestones?.totalCount,
      pull_requests_count: data.pullRequests?.totalCount,
      branches_count: (data as any).branches?.totalCount,
      fork_count: data.forkCount,
      packages_count: data.packages?.totalCount,
      releases_count: data.releases?.totalCount,
      tags_count: (data as any).tags?.totalCount,
      rulesets_count: data.rulesets?.totalCount,
      stargazers_count: data.stargazerCount,
      submodules_count: data.submodules?.totalCount,
      vulnerability_alerts_count: data.vulnerabilityAlerts?.totalCount,
      watchers_count: data.watchers?.totalCount
    });
  }
}
