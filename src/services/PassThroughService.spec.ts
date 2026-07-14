import { describe, expect, it, vi } from 'vitest';

import { PassThroughService } from './PassThroughService';
import type { Service } from './Service';

function createServiceMock() {
  return {
    search: vi.fn(),
    user: vi.fn(),
    repository: vi.fn(),
    resources: vi.fn()
  };
}

function createIterable() {
  return {
    async *[Symbol.asyncIterator]() {
      yield { data: [], metadata: { has_more: false } };
    }
  };
}

describe('PassThroughService', () => {
  it('forwards search arguments and returns the underlying iterable', () => {
    const service = createServiceMock();
    const result = createIterable();
    const passThrough = new PassThroughService(service as unknown as Service);
    const opts = { name: 'repository', per_page: 10 };

    service.search.mockReturnValue(result);

    expect(passThrough.search(25, opts)).toBe(result);
    expect(service.search).toHaveBeenCalledWith(25, opts);
  });

  it('forwards scalar and array user lookups', async () => {
    const service = createServiceMock();
    const passThrough = new PassThroughService(service as unknown as Service);
    const opts = { byLogin: true };
    const scalarResult = Promise.resolve(null);
    const arrayResult = Promise.resolve([null, null]);

    service.user.mockReturnValueOnce(scalarResult).mockReturnValueOnce(arrayResult);

    expect(passThrough.user('octocat', opts)).toBe(scalarResult);
    expect(passThrough.user(['octocat', 'hubot'], opts)).toBe(arrayResult);
    expect(service.user).toHaveBeenNthCalledWith(1, 'octocat', opts);
    expect(service.user).toHaveBeenNthCalledWith(2, ['octocat', 'hubot'], opts);
  });

  it('forwards repository arguments and returns the underlying promise', () => {
    const service = createServiceMock();
    const passThrough = new PassThroughService(service as unknown as Service);
    const result = Promise.resolve(null);

    service.repository.mockReturnValue(result);

    expect(passThrough.repository('octocat', 'hello-world')).toBe(result);
    expect(service.repository).toHaveBeenCalledWith('octocat', 'hello-world');
  });

  it('forwards resource arguments and returns the underlying iterable', () => {
    const service = createServiceMock();
    const result = createIterable();
    const passThrough = new PassThroughService(service as unknown as Service);
    const opts = {
      repository: 'octocat/hello-world',
      per_page: 10,
      since: new Date('2026-01-01T00:00:00.000Z'),
      until: new Date('2026-02-01T00:00:00.000Z')
    };

    service.resources.mockReturnValue(result);

    expect(passThrough.resources('commits', opts)).toBe(result);
    expect(service.resources).toHaveBeenCalledWith('commits', opts);
  });
});
