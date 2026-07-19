import { Repository, RepositorySchema } from '../../../../entities/Repository';
import { Booleanify, NullableFields } from '../../../../helpers/types';
import { Commit as GsCommit, Repository as GsRepository } from '../../graphql-schema';
import { ActorFragment } from './ActorFragment';
import { DeclarativeFragment, FragmentFactory, FragmentField } from './Fragment';

/**
 *  A fragment to get a repository.
 */
export class RepositoryFragment extends DeclarativeFragment<GsRepository, Repository> {
  protected readonly fieldMap: readonly FragmentField<GsRepository>[] = [];
  private readonly fields: boolean | Booleanify<NullableFields<Repository>>;

  constructor(
    alias = 'RepositoryFrag',
    opts: { factory: FragmentFactory; fields: boolean | Booleanify<NullableFields<Repository>> }
  ) {
    super(alias, opts);
    this.fields = opts.fields;
    this.fragments.push(opts.factory.create(ActorFragment));

    const when = (field: string) => (): boolean => this.isFieldIncluded(field);

    this.fieldMap = [
      { key: '__typename', selection: '__typename', value: (data) => data.__typename },
      { key: 'database_id', selection: 'databaseId', value: (data) => data.databaseId! },
      { key: 'description', selection: 'description', value: (data) => data.description! },
      { key: 'id', selection: 'id', value: (data) => data.id },
      { key: 'name', selection: 'name', value: (data) => data.name },
      { key: 'name_with_owner', selection: 'nameWithOwner', value: (data) => data.nameWithOwner },
      {
        key: 'owner',
        selection: (fragment) => `owner { ...${fragment.fragments[0].alias} }`,
        value: (data, fragment) => fragment.fragments[0].parse(data.owner)
      },
      { key: 'primary_language', selection: 'primaryLanguage { name }', value: (data) => data.primaryLanguage?.name },

      {
        key: 'allow_update_branch',
        selection: 'allowUpdateBranch',
        value: (data) => data.allowUpdateBranch,
        include: when('allow_update_branch')
      },
      {
        key: 'archived_at',
        selection: 'archivedAt',
        value: (data) => data.archivedAt,
        include: when('archived_at')
      },
      {
        key: 'assignable_users_count',
        selection: 'assignableUsers { totalCount }',
        value: (data) => data.assignableUsers?.totalCount,
        include: when('assignable_users_count')
      },
      {
        key: 'auto_merge_allowed',
        selection: 'autoMergeAllowed',
        value: (data) => data.autoMergeAllowed,
        include: when('auto_merge_allowed')
      },
      {
        key: 'branches_count',
        selection: 'branches:refs(refPrefix: "refs/heads/") { totalCount }',
        value: (data) => (data as any).branches?.totalCount,
        include: when('branches_count')
      },
      {
        key: 'code_of_conduct',
        selection: 'codeOfConduct { key }',
        value: (data) => data.codeOfConduct?.key,
        include: when('code_of_conduct')
      },
      {
        key: 'contributing_guidelines',
        selection: 'contributingGuidelines { body }',
        value: (data) => data.contributingGuidelines?.body || undefined,
        include: when('contributing_guidelines')
      },
      {
        key: 'created_at',
        selection: 'createdAt',
        value: (data) => data.createdAt,
        include: when('created_at')
      },
      {
        key: 'default_branch',
        selection: 'defaultBranchRef { name target { ... on Commit { history { totalCount } } } }',
        value: (data) => data.defaultBranchRef?.name,
        additional: [
          {
            key: 'commits_count',
            value: (data) => (data.defaultBranchRef?.target as GsCommit | undefined)?.history?.totalCount
          }
        ],
        include: when('default_branch')
      },
      {
        key: 'delete_branch_on_merge',
        selection: 'deleteBranchOnMerge',
        value: (data) => data.deleteBranchOnMerge,
        include: when('delete_branch_on_merge')
      },
      {
        key: 'deployments_count',
        selection: 'deployments { totalCount }',
        value: (data) => data.deployments?.totalCount,
        include: when('deployments_count')
      },
      {
        key: 'discussions_count',
        selection: 'discussions { totalCount }',
        value: (data) => data.discussions?.totalCount,
        include: when('discussions_count')
      },
      {
        key: 'disk_usage',
        selection: 'diskUsage',
        value: (data) => data.diskUsage || undefined,
        include: when('disk_usage')
      },
      {
        key: 'environments_count',
        selection: 'environments { totalCount }',
        value: (data) => data.environments?.totalCount,
        include: when('environments_count')
      },
      {
        key: 'fork_count',
        selection: 'forkCount',
        value: (data) => data.forkCount,
        include: when('fork_count')
      },
      {
        key: 'forking_allowed',
        selection: 'forkingAllowed',
        value: (data) => data.forkingAllowed,
        include: when('forking_allowed')
      },
      {
        key: 'funding_links',
        selection: 'fundingLinks { platform url }',
        value: (data) => data.fundingLinks?.map(({ platform, url }) => ({ platform, url })),
        include: when('funding_links')
      },
      {
        key: 'has_discussions_enabled',
        selection: 'hasDiscussionsEnabled',
        value: (data) => data.hasDiscussionsEnabled,
        include: when('has_discussions_enabled')
      },
      {
        key: 'has_issues_enabled',
        selection: 'hasIssuesEnabled',
        value: (data) => data.hasIssuesEnabled,
        include: when('has_issues_enabled')
      },
      {
        key: 'has_projects_enabled',
        selection: 'hasProjectsEnabled',
        value: (data) => data.hasProjectsEnabled,
        include: when('has_projects_enabled')
      },
      {
        key: 'has_sponsorships_enabled',
        selection: 'hasSponsorshipsEnabled',
        value: (data) => data.hasSponsorshipsEnabled,
        include: when('has_sponsorships_enabled')
      },
      {
        key: 'has_vulnerability_alerts_enabled',
        selection: 'hasVulnerabilityAlertsEnabled',
        value: (data) => data.hasVulnerabilityAlertsEnabled,
        include: when('has_vulnerability_alerts_enabled')
      },
      {
        key: 'has_wiki_enabled',
        selection: 'hasWikiEnabled',
        value: (data) => data.hasWikiEnabled,
        include: when('has_wiki_enabled')
      },
      {
        key: 'homepage_url',
        selection: 'homepageUrl',
        value: (data) => data.homepageUrl,
        include: when('homepage_url')
      },
      {
        key: 'is_archived',
        selection: 'isArchived',
        value: (data) => data.isArchived,
        include: when('is_archived')
      },
      {
        key: 'is_blank_issues_enabled',
        selection: 'isBlankIssuesEnabled',
        value: (data) => data.isBlankIssuesEnabled,
        include: when('is_blank_issues_enabled')
      },
      {
        key: 'is_disabled',
        selection: 'isDisabled',
        value: (data) => data.isDisabled,
        include: when('is_disabled')
      },
      {
        key: 'is_empty',
        selection: 'isEmpty',
        value: (data) => data.isEmpty,
        include: when('is_empty')
      },
      {
        key: 'is_fork',
        selection: 'isFork',
        value: (data) => data.isFork,
        include: when('is_fork')
      },
      {
        key: 'is_in_organization',
        selection: 'isInOrganization',
        value: (data) => data.isInOrganization,
        include: when('is_in_organization')
      },
      {
        key: 'is_locked',
        selection: 'isLocked',
        value: (data) => data.isLocked,
        include: when('is_locked')
      },
      {
        key: 'is_mirror',
        selection: 'isMirror',
        value: (data) => data.isMirror,
        include: when('is_mirror')
      },
      {
        key: 'is_security_policy_enabled',
        selection: 'isSecurityPolicyEnabled',
        value: (data) => data.isSecurityPolicyEnabled || undefined,
        include: when('is_security_policy_enabled')
      },
      {
        key: 'issues_count',
        selection: 'issues { totalCount }',
        value: (data) => data.issues?.totalCount,
        include: when('issues_count')
      },
      {
        key: 'languages',
        selection: 'languages(first: 100) { edges { node { name } size } }',
        value: (data) => data.languages?.edges?.map((edge) => ({ name: edge!.node.name, size: edge!.size })),
        include: when('languages')
      },
      {
        key: 'license_info',
        selection: 'licenseInfo { key }',
        value: (data) => data.licenseInfo?.key,
        include: when('license_info')
      },
      {
        key: 'lock_reason',
        selection: 'lockReason',
        value: (data) => data.lockReason || undefined,
        include: when('lock_reason')
      },
      {
        key: 'merge_commit_allowed',
        selection: 'mergeCommitAllowed',
        value: (data) => data.mergeCommitAllowed,
        include: when('merge_commit_allowed')
      },
      {
        key: 'merge_commit_message',
        selection: 'mergeCommitMessage',
        value: (data) => data.mergeCommitMessage || undefined,
        include: when('merge_commit_message')
      },
      {
        key: 'merge_commit_title',
        selection: 'mergeCommitTitle',
        value: (data) => data.mergeCommitTitle || undefined,
        include: when('merge_commit_title')
      },
      {
        key: 'milestones_count',
        selection: 'milestones { totalCount }',
        value: (data) => data.milestones?.totalCount,
        include: when('milestones_count')
      },
      {
        key: 'mirror_url',
        selection: 'mirrorUrl',
        value: (data) => data.mirrorUrl || undefined,
        include: when('mirror_url')
      },
      {
        key: 'open_graph_image_url',
        selection: 'openGraphImageUrl',
        value: (data) => data.openGraphImageUrl,
        include: when('open_graph_image_url')
      },
      {
        key: 'packages_count',
        selection: 'packages { totalCount }',
        value: (data) => data.packages?.totalCount,
        include: when('packages_count')
      },
      {
        key: 'parent',
        selection: 'parent { id nameWithOwner }',
        value: (data) => data.parent?.nameWithOwner,
        include: when('parent')
      },
      {
        key: 'pull_requests_count',
        selection: 'pullRequests { totalCount }',
        value: (data) => data.pullRequests?.totalCount,
        include: when('pull_requests_count')
      },
      {
        key: 'pushed_at',
        selection: 'pushedAt',
        value: (data) => data.pushedAt,
        include: when('pushed_at')
      },
      {
        key: 'rebase_merge_allowed',
        selection: 'rebaseMergeAllowed',
        value: (data) => data.rebaseMergeAllowed,
        include: when('rebase_merge_allowed')
      },
      {
        key: 'releases_count',
        selection: 'releases { totalCount }',
        value: (data) => data.releases?.totalCount,
        include: when('releases_count')
      },
      {
        key: 'repository_topics',
        selection: 'repositoryTopics(first: 100) { nodes { topic { name } } }',
        value: (data) => data.repositoryTopics?.nodes?.map((node) => node!.topic.name),
        include: when('repository_topics')
      },
      {
        key: 'rulesets_count',
        selection: 'rulesets { totalCount }',
        value: (data) => data.rulesets?.totalCount,
        include: when('rulesets_count')
      },
      {
        key: 'security_policy_url',
        selection: 'securityPolicyUrl',
        value: (data) => data.securityPolicyUrl || undefined,
        include: when('security_policy_url')
      },
      {
        key: 'squash_merge_allowed',
        selection: 'squashMergeAllowed',
        value: (data) => data.squashMergeAllowed,
        include: when('squash_merge_allowed')
      },
      {
        key: 'squash_merge_commit_message',
        selection: 'squashMergeCommitMessage',
        value: (data) => data.squashMergeCommitMessage || undefined,
        include: when('squash_merge_commit_message')
      },
      {
        key: 'squash_merge_commit_title',
        selection: 'squashMergeCommitTitle',
        value: (data) => data.squashMergeCommitTitle || undefined,
        include: when('squash_merge_commit_title')
      },
      {
        key: 'stargazers_count',
        selection: 'stargazerCount',
        value: (data) => data.stargazerCount,
        include: when('stargazers_count')
      },
      {
        key: 'submodules_count',
        selection: 'submodules { totalCount }',
        value: (data) => data.submodules?.totalCount,
        include: when('submodules_count')
      },
      {
        key: 'tags_count',
        selection: 'tags:refs(refPrefix: "refs/tags/") { totalCount }',
        value: (data) => (data as any).tags?.totalCount,
        include: when('tags_count')
      },
      {
        key: 'template_repository',
        selection: 'templateRepository { nameWithOwner }',
        value: (data) => data.templateRepository?.nameWithOwner || undefined,
        include: when('template_repository')
      },
      {
        key: 'updated_at',
        selection: 'updatedAt',
        value: (data) => data.updatedAt,
        include: when('updated_at')
      },
      {
        key: 'uses_custom_open_graph_image',
        selection: 'usesCustomOpenGraphImage',
        value: (data) => data.usesCustomOpenGraphImage,
        include: when('uses_custom_open_graph_image')
      },
      {
        key: 'visibility',
        selection: 'visibility',
        value: (data) => data.visibility,
        include: when('visibility')
      },
      {
        key: 'vulnerability_alerts_count',
        selection: 'vulnerabilityAlerts { totalCount }',
        value: (data) => data.vulnerabilityAlerts?.totalCount,
        include: when('vulnerability_alerts_count')
      },
      {
        key: 'watchers_count',
        selection: 'watchers { totalCount }',
        value: (data) => data.watchers?.totalCount,
        include: when('watchers_count')
      },
      {
        key: 'web_commit_signoff_required',
        selection: 'webCommitSignoffRequired',
        value: (data) => data.webCommitSignoffRequired,
        include: when('web_commit_signoff_required')
      }
    ];
  }

  private isFieldIncluded(field: string): boolean {
    return (
      this.fields === true || (typeof this.fields === 'object' && Boolean((this.fields as Record<string, any>)[field]))
    );
  }

  toString(): string {
    return `
    fragment ${this.alias} on Repository {
      ${this.selection()}
    }`;
  }

  parse(data: GsRepository): Repository {
    return RepositorySchema.parse(this.values(data));
  }
}
