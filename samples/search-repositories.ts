/* eslint-disable require-jsdoc */
import { confirm, input, number } from '@inquirer/prompts';
import consola from 'consola';
import { createStream } from 'table';
import { BufferedService, CacheService, GithubClient, GithubService, Service } from '../src/index.js';

// Simple in-memory cache implementation shared with other samples
class MemCache {
  private readonly cache: Map<string, any> = new Map();

  async get<T>(key: string): Promise<T | null> {
    return this.cache.get(key) ?? null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.cache.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

(async function main() {
  consola.info('Creating Github client ...');
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  const client = new GithubClient('https://api.github.com', { apiToken: token });

  consola.info('Preparing Github service ...');
  let service: Service = new GithubService(client);

  // Optional decorators
  const useCache = await confirm({ message: 'Wrap service with CacheService?', initial: true });
  if (useCache) service = new CacheService(service, new MemCache());

  const useBuffer = await confirm({ message: 'Wrap service with BufferedService?', initial: true });
  if (useBuffer) {
    const bufferSize = await number({ message: 'Buffer size (iterations):', default: 5, required: true });
    service = new BufferedService(service, bufferSize ?? 5);
  }

  // Query params
  const total = await number({ message: 'Number of repositories to search:', default: 10, required: true });
  const name = await input({ message: 'Filter by name (optional):', required: false });
  const language = await input({ message: 'Filter by language (optional):', required: false });
  const org = await input({ message: 'Filter by organization (optional):', required: false });

  consola.info('Searching repositories ...');

  const it = service.search(total!, {
    per_page: 50,
    language: language || undefined,
    name: name || undefined,
    org: org || undefined
  });

  const stream = createStream({
    columns: [{ width: 4 }, {}, { width: 7 }, { width: 16 }],
    columnDefault: { width: 50, truncate: 50 },
    columnCount: 4
  });

  consola.info('Repositories found:');
  stream.write(['#', 'Repository', 'Stars', 'Language']);

  let count = 0;
  for await (const { data } of it) {
    for (const repo of data) {
      stream.write([`${++count}`, repo.name_with_owner, `${repo.stargazers_count ?? ''}`, repo.primary_language || '']);
    }
  }

  process.stdout.write('\n');
  consola.success('Done.');
})();
