/* eslint-disable require-jsdoc */
import { input, select } from '@inquirer/prompts';
import consola from 'consola';
import prettyjson from 'prettyjson';
import { Cache, CacheService, EntitiesFields, GithubClient, GithubService, Service } from '../src/index.js';

// This class implements a simple in-memory cache.
class MemCache implements Cache {
  private readonly cache: Map<string, any> = new Map();

  async get<T>(key: string): Promise<T | null> {
    return this.cache.get(key);
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

// This file demonstrates how to fetch resources from a Github repository.
(async function main() {
  {
    // First, we need to create a Github client to interact with the Github API.
    // This client requires an access token with basic read permissions.
    // You can also use an proxy server, such as github-proxy-server (https://github.com/gittrends-app/github-proxy-server)
    consola.info('Creating Github client ...');
    const client = new GithubClient('https://api.github.com', { apiToken: process.env.GH_TOKEN });

    // Next, we need to create a Github service to fetch resources from the Github API.
    // By default, the service fetches only a few number of fields from the base entities such as Actor and Repository.
    // You can customize the fields to be fetched by passing an object to the constructor.
    consola.info('Selecting fields from common entities, such as actors ...');
    const fields: EntitiesFields = { actors: { name: true, email: true }, repositories: true };

    // Now, we can create the Github service with the client and fields.
    consola.info('Preparing Github service example ...');
    let service: Service = new GithubService(client, { fields });

    // Optionally, we can cache the fetched resources to save locally the resources.
    // The cache service requires a service and a cache implementation.
    service = new CacheService(service, new MemCache());

    const repoName = await input({
      message: 'Enter the repository name (e.g. octokit/octokit.js):',
      default: 'octokit/octokit.js',
      required: true,
      validate: (value) => value.split('/').length === 2
    });

    // Now, we can fetch the repository details.
    // We can find by its ID or by its owner and name.
    consola.info(`Resolving repository ${repoName} ...`);
    const [owner, name] = repoName.split('/');
    const repo = await service.repository(owner, name);

    if (repo) {
      consola.success(`Repository found:`);
      consola.log(prettyjson.render(repo));

      const resource = await select<any>({
        message: 'Which resource do you want to fetch?',
        choices: ['commits', 'discussions', 'issues', 'pull_requests', 'releases', 'stargazers', 'tags', 'watchers'],
        default: 'releases'
      });

      // With the repository ID, we can fetch the desired resources.
      // The service provides methods to fetch commits, discussions, issues, pull requests, releases, stargazers, tags, and watchers.
      // Each method returns an async generator that yields the resources.
      consola.info(`Fetching ${resource} of repository ${repo.name_with_owner} ...`);
      for await (const res of service.resources(resource, { repository: repo.id, per_page: 100 })) {
        consola.log(prettyjson.render(res));
      }

      consola.success('Done.');
    } else {
      consola.error('Repository not found.');
      process.exit(1);
    }
  }
})();
