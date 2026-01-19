import 'dotenv/config';
import { BufferedService, CacheService, GithubClient, GithubService } from '../src';
import type { Cache } from '../src/services/CacheService';

// Simple in-memory cache implementation for the example
class MemoryCache implements Cache {
  private map = new Map<string, any>();

  async get<T>(key: string): Promise<T | null> {
    return this.map.has(key) ? (this.map.get(key) as T) : null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.map.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.map.delete(key);
  }

  async clear(): Promise<void> {
    this.map.clear();
  }
}

async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_API_TOKEN;
  if (!token) {
    console.error('Set GITHUB_TOKEN environment variable with a GitHub personal access token.');
    process.exit(1);
  }

  // Create client and base service
  const client = new GithubClient('https://api.github.com', { apiToken: token });
  const base = new GithubService(client);

  // Wrap with cache (in-memory for the example)
  const cache = new MemoryCache();
  const cached = new CacheService(base, cache);

  // Optional: buffer results into batches of 5 iterations
  const buffered = new BufferedService(cached, 5);

  // Run a simple search for TypeScript repositories
  const total = 20;
  // NOTE: search() expects SearchParams; this example demonstrates name/language filtering
  const opts = { name: 'language:TypeScript', per_page: 5 } as any;

  console.log('Searching GitHub repositories (this will use the cache for repeated runs)...');

  for await (const page of buffered.search(total, opts)) {
    console.log('--- page ---');
    for (const repo of page.data) {
      // Some Repository shapes may differ depending on fragment fields; be defensive
      const owner = repo.owner?.login || repo.owner?.name || 'unknown';
      const repoName = repo.name || repo.full_name || `${owner}/${repo.name}`;
      console.log(`${repoName} — ★ ${repo.stargazers_count ?? repo.stargazers_count}`);
    }

    if (!page.metadata.has_more) break;
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
