import { describe, expect, it, vi } from 'vitest';
import { BufferedService } from '../BufferedService';
import { Cache, CacheService } from '../CacheService';
import type { GithubClient } from './GithubClient';
import { GithubService } from './GithubService';

function repository(id: string) {
  return {
    __typename: 'Repository',
    databaseId: 1,
    description: null,
    id,
    name: id,
    nameWithOwner: `owner/${id}`,
    owner: { __typename: 'User', id: 'owner-id', login: 'owner', avatarUrl: 'avatar' },
    primaryLanguage: null
  };
}

function actor(id: string) {
  return { __typename: 'User', id, login: id, avatarUrl: 'https://example.com/avatar.png' };
}

function createService(graphql: ReturnType<typeof vi.fn>) {
  return new GithubService({ graphql } as unknown as GithubClient);
}

describe('GithubService', () => {
  it('starts search after an incoming cursor and honors the requested total', async () => {
    const graphql = vi.fn().mockResolvedValue({
      search: {
        nodes: [repository('one'), repository('two'), repository('three')],
        pageInfo: { hasNextPage: true, endCursor: 'next-cursor' }
      }
    });
    const service = createService(graphql);

    const pages = [];
    for await (const page of service.search(2, { cursor: 'start-cursor', per_page: 100 })) pages.push(page);

    expect(pages[0].data.map(({ id }) => id)).toEqual(['one', 'two']);
    expect(pages[0].metadata).toMatchObject({ has_more: false, per_page: 2 });
    expect(graphql.mock.calls[0][0]).toContain('after: "start-cursor"');
  });

  it('composes with cache and buffering without duplicate pages', async () => {
    const graphql = vi.fn().mockImplementation((query: string) =>
      Promise.resolve({
        search: {
          nodes: query.includes('after: "page-1"') ? [repository('three')] : [repository('one'), repository('two')],
          pageInfo: query.includes('after: "page-1"')
            ? { hasNextPage: false, endCursor: 'page-2' }
            : { hasNextPage: true, endCursor: 'page-1' }
        }
      })
    );
    const values = new Map<string, unknown>();
    const cache: Cache = {
      get: async <T>(key: string) => (values.get(key) as T | undefined) ?? null,
      set: async <T>(key: string, value: T) => {
        values.set(key, value);
      },
      remove: async (key: string) => {
        values.delete(key);
      },
      clear: async () => {
        values.clear();
      }
    };
    const github = createService(graphql);
    const service = new BufferedService(new CacheService(github, cache), 2);

    const first = [];
    for await (const page of service.search(3, { per_page: 2 })) first.push(...page.data);
    expect(first.map(({ id }) => id)).toEqual(['one', 'two', 'three']);
    expect(graphql).toHaveBeenCalledTimes(2);

    const second = [];
    for await (const page of service.search(3, { per_page: 2 })) second.push(...page.data);
    expect(second.map(({ id }) => id)).toEqual(['one', 'two', 'three']);
    expect(graphql).toHaveBeenCalledTimes(2);
  });

  it('fetches a user by id and supports login-based lookup', async () => {
    const graphql = vi.fn().mockImplementation((query: string) => {
      expect(query).toContain('repositoryOwner(login: "octocat")');
      return Promise.resolve({ octocat: actor('U_1') });
    });
    const service = createService(graphql);

    const result = await service.user('octocat', { byLogin: true });

    expect(result).toMatchObject({ __typename: 'User', id: 'U_1', login: 'U_1' });
  });

  it('fetches multiple users while preserving input order', async () => {
    const graphql = vi.fn().mockResolvedValue({ U1: actor('U1'), U2: actor('U2') });
    const service = createService(graphql);

    const result = await service.user(['U1', 'U2']);

    expect(result.map((user) => user?.id)).toEqual(['U1', 'U2']);
  });

  it('rejects an empty user id instead of treating it as the viewer', async () => {
    const service = createService(vi.fn());

    await expect(service.user('')).rejects.toThrow('Invalid user ID.');
  });

  it('fetches a repository by owner and name', async () => {
    const graphql = vi.fn().mockImplementation((query: string) => {
      expect(query).toContain('repository(owner: "owner", name: "repo")');
      return Promise.resolve({ ownerrepo: repository('R_1') });
    });
    const service = createService(graphql);

    const result = await service.repository('owner', 'repo');

    expect(result).toMatchObject({ __typename: 'Repository', id: 'R_1' });
  });

  it('dispatches repository resources through the requested lookup', async () => {
    const graphql = vi.fn().mockResolvedValue({
      repoid: {
        watchers: {
          nodes: [actor('U_1'), actor('U_2')],
          pageInfo: { endCursor: null, hasNextPage: false }
        }
      }
    });
    const service = createService(graphql);
    const pages = [];

    for await (const page of service.resources('watchers', { repository: 'repo-id' })) pages.push(page);

    expect(pages).toHaveLength(1);
    expect(pages[0].data.map(({ user }) => user.id)).toEqual(['U_1', 'U_2']);
    expect(pages[0].metadata).toMatchObject({ has_more: false, per_page: 2 });
  });
});
