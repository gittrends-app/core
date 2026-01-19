# @gittrends-app/core

`@gittrends-app/core` is a core library for interacting with GitHub's API, providing caching mechanisms and other utilities to simplify the process of fetching and managing data from GitHub.

> For last schema revision, check `gittrends.schemaRevision` at [package.json](./package.json)

## Installation

To install the package, use npm or yarn:

```bash
npm install @gittrends-app/core
# or
yarn add @gittrends-app/core
```

## Usage

Here is an example of how to use the `@gittrends-app/core` package to fetch resources from a GitHub repository:

```typescript
import { Cache, GithubClient, GithubService, Service, CacheService, BufferedService } from '@gittrends-app/core';

class MyCache implements Cache {
  // Implement cache methods here
}

(async function main() {
  const client = new GithubClient('https://api.github.com', { apiToken: '<your_access_token>' });
  let service: Service = new GithubService(client);

  // Wrap the base service with caching
  service = new CacheService(service, new MyCache());

  // Optional: wrap with buffering to reduce iteration overhead
  service = new BufferedService(service, 10);

  const repo = await service.repository('owner', 'repo');
  if (!repo) throw new Error('Repository not found!');

  const it = service.resources('tags', { repository: repo.id });
  for await (const res of it) console.log(res.data);
})();
```

See the `samples/` folder for runnable examples (TypeScript) demonstrating search, caching, and resource iteration: `samples/search-with-cache.ts`, `samples/search-repositories.ts`, and `samples/get-resources.ts`.

## Features

- Interact with GitHub's API
- Simple caching mechanisms
- Utility functions for managing data

## License

MIT
