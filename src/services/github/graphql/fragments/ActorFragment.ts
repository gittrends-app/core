import { Bot, EnterpriseUserAccount, Mannequin, Organization, User } from '@octokit/graphql-schema';
import snakeCase from 'lodash/snakeCase.js';
import { Actor, ActorSchema } from '../../../../entities/Actor.js';
import { CustomizableFragment, Fragment } from './Fragment.js';

/**
 * A fragment to select the common fields for an actor.
 */
export class ActorFragment extends CustomizableFragment {
  readonly fragments: Fragment[] = [];

  toString(): string {
    return `
    fragment ${this.alias}_User on User {
      ${this.includes('bio', 'bio')}
      ${this.includes('company', 'company')}
      ${this.includes('created_at', 'createdAt')}
      ${this.includes('database_id', 'databaseId')}
      ${this.includes('email', 'email')}
      ${this.includes('has_sponsors_listing', 'hasSponsorsListing')}
      ${this.includes('is_bounty_hunter', 'isBountyHunter')}
      ${this.includes('is_campus_expert', 'isCampusExpert')}
      ${this.includes('is_developer_program_member', 'isDeveloperProgramMember')}
      ${this.includes('is_employee', 'isEmployee')}
      ${this.includes('is_github_star', 'isGitHubStar')}
      ${this.includes('is_hireable', 'isHireable')}
      ${this.includes('is_site_admin', 'isSiteAdmin')}
      ${this.includes('location', 'location')}
      ${this.includes('name', 'name')}
      ${this.includes('pronouns', 'pronouns')}
      ${this.includes('twitter_username', 'twitterUsername')}
      ${this.includes('updated_at', 'updatedAt')}
      ${this.includes('website_url', 'websiteUrl')}
      
      ${this.includes('social_accounts', 'socialAccounts(first: 100) { nodes { provider displayName } }')}
      ${this.includes('followers_count', 'followers { totalCount }')} 
      ${this.includes('following_count', 'following { totalCount }')} 
      ${this.includes('gists_count', 'gists { totalCount }')} 
      ${this.includes('issues_count', 'issues { totalCount }')} 
      ${this.includes('organizations_count', 'organizations { totalCount }')} 
      ${this.includes('pull_requests_count', 'pullRequests { totalCount }')} 
      ${this.includes('repositories_count', 'repositories { totalCount }')} 
      ${this.includes('repositories_contributed_to_count', 'repositoriesContributedTo { totalCount }')} 
      ${this.includes('repository_discussions_count', 'repositoryDiscussions { totalCount }')} 
      ${this.includes('sponsoring_count', 'sponsoring { totalCount }')} 
      ${this.includes('sponsors_count', 'sponsors { totalCount }')} 
      ${this.includes('starred_repositories_count', 'starredRepositories { totalCount }')} 
      ${this.includes('watching_count', 'watching { totalCount }')} 
    }

    fragment ${this.alias} on Actor {
      ... on Node { id }
      login
      avatarUrl
      __typename
      
      ... on Bot {
        ${this.includes('created_at', 'createdAt')}
        ${this.includes('database_id', 'databaseId')}
        ${this.includes('updated_at', 'updatedAt')}
      }
      
      ... on Mannequin {
        ${this.includes('claimant', `claimant { ...${this.alias}_User }`)}
        ${this.includes('created_at', 'createdAt')}
        ${this.includes('database_id', 'databaseId')}
        ${this.includes('email', 'email')}
        ${this.includes('updated_at', 'updatedAt')}
      }
      
      #... on EnterpriseUserAccount {
      #  ${this.includes('name', 'name')}
      #  ${this.includes('updated_at', 'updatedAt')}
      #  ${this.includes('user', `user { ...${this.alias}_User }`)}
      #}
      
      ... on User { ...${this.alias}_User }
      
      ... on Organization {
        ${this.includes('archived_at', 'archivedAt')}
        ${this.includes('created_at', 'createdAt')}
        ${this.includes('database_id', 'databaseId')}
        ${this.includes('description', 'description')}
        ${this.includes('email', 'email')}
        ${this.includes('has_sponsors_listing', 'hasSponsorsListing')}
        ${this.includes('is_verified', 'isVerified')}
        ${this.includes('location', 'location')}
        ${this.includes('members_with_role_count', 'membersWithRole { totalCount }')} 
        ${this.includes('name', 'name')}
        ${this.includes('repositories_count', 'repositories { totalCount }')} 
        ${this.includes('sponsoring_count', 'sponsoring { totalCount }')} 
        ${this.includes('sponsors_count', 'sponsors { totalCount }')} 
        ${this.includes('twitter_username', 'twitterUsername')}
        ${this.includes('updated_at', 'updatedAt')}
        ${this.includes('website_url', 'websiteUrl')}
      }
    }
    `;
  }

  parse(data: Bot | Mannequin | EnterpriseUserAccount | Organization | User): Actor {
    switch (data.__typename) {
      case 'Bot':
        return ActorSchema.parse({
          __typename: data.__typename,
          avatar_url: data.avatarUrl,
          created_at: data.createdAt,
          database_id: data.databaseId as number,
          id: data.id,
          login: data.login,
          updated_at: data.updatedAt
        });
      case 'Mannequin':
        return ActorSchema.parse({
          __typename: data.__typename,
          avatar_url: data.avatarUrl,
          claimant: data.claimant ? (this.parse(data.claimant) as any) : undefined,
          created_at: data.createdAt,
          database_id: data.databaseId,
          email: data.email,
          id: data.id,
          login: data.login,
          updated_at: data.updatedAt
        });
      case 'EnterpriseUserAccount':
        return ActorSchema.parse({
          __typename: data.__typename,
          avatar_url: data.avatarUrl,
          name: data.name as string,
          updated_at: data.updatedAt,
          user: data.user && (this.parse(data.user) as any),
          id: data.id,
          login: data.login
        });
      case 'Organization':
        return ActorSchema.parse({
          __typename: data.__typename,
          avatar_url: data.avatarUrl,
          created_at: data.createdAt,
          database_id: data.databaseId,
          description: data.description,
          email: data.email,
          has_sponsors_listing: data.hasSponsorsListing,
          id: data.id,
          is_verified: data.isVerified,
          location: data.location,
          login: data.login,
          name: data.name,
          twitter_username: data.twitterUsername,
          updated_at: data.updatedAt,
          website_url: data.websiteUrl,
          members_with_role_count: data.membersWithRole?.totalCount,
          repositories_count: data.repositories?.totalCount,
          sponsoring_count: data.sponsoring?.totalCount,
          sponsors_count: data.sponsors?.totalCount,
          archived_at: data.archivedAt ? data.archivedAt : undefined
        });
      case 'User':
        return ActorSchema.parse({
          __typename: data.__typename,
          avatar_url: data.avatarUrl,
          bio: data.bio,
          company: data.company,
          created_at: data.createdAt,
          database_id: data.databaseId as number,
          email: data.email,
          followers_count: data.followers?.totalCount,
          following_count: data.following?.totalCount,
          gists_count: data.gists?.totalCount,
          id: data.id,
          issues_count: data.issues?.totalCount,
          location: data.location,
          login: data.login,
          name: data.name,
          pronouns: data.pronouns,
          pull_requests_count: data.pullRequests?.totalCount,
          repositories_count: data.repositories?.totalCount,
          repositories_contributed_to_count: data.repositoriesContributedTo?.totalCount,
          repository_discussions_count: data.repositoryDiscussions?.totalCount,
          sponsoring_count: data.sponsoring?.totalCount,
          sponsors_count: data.sponsors?.totalCount,
          starred_repositories_count: data.starredRepositories?.totalCount,
          twitter_username: data.twitterUsername,
          updated_at: data.updatedAt,
          website_url: data.websiteUrl,
          watching_count: data.watching?.totalCount,
          is_bounty_hunter: data.isBountyHunter,
          is_campus_expert: data.isCampusExpert,
          is_developer_program_member: data.isDeveloperProgramMember,
          is_employee: data.isEmployee,
          is_github_star: data.isGitHubStar,
          is_hireable: data.isHireable,
          is_site_admin: data.isSiteAdmin,
          has_sponsors_listing: data.hasSponsorsListing,
          social_accounts: data.socialAccounts?.nodes?.reduce(
            (acc: Record<string, string> | undefined, node) =>
              node ? { ...(acc || {}), [snakeCase(node.provider)]: node.displayName } : acc,
            undefined
          ),
          organizations_count: data.organizations?.totalCount
        });
      default:
        throw new Error(`Unexpected actor __typename: ${data.__typename}`);
    }
  }
}
