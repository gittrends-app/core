# @gittrends-app/core

`@gittrends-app/core` is a core library for interacting with GitHub's API, providing caching mechanisms and other utilities to simplify the process of fetching and managing data from GitHub.

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
import { Cache, GithubClient, GithubService, Service } from '@gittrends-app/core';

class MyCache implements Cache {
  // Implement cache methods here
}

(async function main() {
  console.log('Creating Github client ...');
  const client = new GithubClient('https://api.github.com', { apiToken: '<your_access_token>' });

  console.log('Fetching resources from GitHub ...');
  let service: Service = new GithubService(client);

  console.log('Wraps base services with caching capabilities');
  service = new CacheService(service, new MyCache());

  console.log('Fetching resources from GitHub ...');
  const repo = await service.repository('owner', 'repo');

  if (!repo) throw new Error('Repository not found!');

  console.log(`Fetching tags of repository owner/repo ...`);
  const it = service.resources(resource, { repository: repo.id });
  for await (const res of it) console.log(res.data);

  console.log('Done!');
})();
```

## Features

- Interact with GitHub's API
- Simple caching mechanisms
- Utility functions for managing data

## License

MIT
