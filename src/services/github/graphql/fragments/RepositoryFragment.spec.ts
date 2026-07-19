import { describe, expect, it } from 'vitest';
import { BaseFragmentFactory } from './Fragment';
import { RepositoryFragment } from './RepositoryFragment';

describe('RepositoryFragment', () => {
  it('always selects the base fields', () => {
    const fragment = new RepositoryFragment('RepoTest', { factory: new BaseFragmentFactory(), fields: false });
    const query = fragment.toString();

    expect(query).toContain('fragment RepoTest on Repository');
    expect(query).toContain('databaseId');
    expect(query).toContain('nameWithOwner');
    expect(query).toContain(`owner { ...${fragment.fragments[0].alias} }`);
    expect(query).toContain('primaryLanguage { name }');
  });

  it('includes every optional selection when fields is true', () => {
    const fragment = new RepositoryFragment('RepoTest', { factory: new BaseFragmentFactory(true), fields: true });
    const query = fragment.toString();

    expect(query).toContain('branches:refs(refPrefix: "refs/heads/") { totalCount }');
    expect(query).toContain('tags:refs(refPrefix: "refs/tags/") { totalCount }');
    expect(query).toContain('defaultBranchRef { name target { ... on Commit { history { totalCount } } } }');
    expect(query).toContain('stargazerCount');
  });

  it('only selects the requested optional fields when fields is an object', () => {
    const fragment = new RepositoryFragment('RepoTest', {
      factory: new BaseFragmentFactory(),
      fields: { stargazers_count: true } as never
    });
    const query = fragment.toString();

    expect(query).toContain('stargazerCount');
    expect(query).not.toContain('forkCount');
    expect(query).not.toContain('watchers { totalCount }');
  });

  it('maps selected fields into the Repository entity', () => {
    const fragment = new RepositoryFragment('RepoTest', { factory: new BaseFragmentFactory(true), fields: true });
    const result = fragment.parse({
      __typename: 'Repository',
      databaseId: 100,
      description: 'desc',
      id: 'repo-id',
      name: 'repo',
      nameWithOwner: 'owner/repo',
      owner: { __typename: 'User', id: 'owner-id', login: 'owner', avatarUrl: 'https://example.com/a.png' },
      primaryLanguage: { name: 'TypeScript' },
      stargazerCount: 42,
      forkCount: 7,
      defaultBranchRef: { name: 'main', target: { history: { totalCount: 500 } } },
      branches: { totalCount: 3 },
      tags: { totalCount: 9 }
    } as never);

    expect(result).toMatchObject({
      __typename: 'Repository',
      id: 'repo-id',
      name_with_owner: 'owner/repo',
      primary_language: 'TypeScript',
      stargazers_count: 42,
      fork_count: 7,
      default_branch: 'main',
      commits_count: 500,
      branches_count: 3,
      tags_count: 9
    });
  });
});
