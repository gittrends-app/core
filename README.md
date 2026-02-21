# @gittrends-app/core

`@gittrends-app/core` is a TypeScript library for collecting and normalizing GitHub GraphQL data into validated domain entities, with optional caching and buffered iteration.

> Current schema revision is tracked in `gittrends.schemaRevision` in [`package.json`](./package.json).

## Requirements

- Node.js `>= 20`
- GitHub API token

## Installation

```bash
npm install @gittrends-app/core
# or
yarn add @gittrends-app/core
```

## Quick Start

```ts
import {
  BufferedService,
  Cache,
  CacheService,
  GithubClient,
  GithubService,
  Service
} from '@gittrends-app/core';

class MyCache implements Cache {
  // implement cache interface
}

async function main() {
  const client = new GithubClient('https://api.github.com', {
    apiToken: process.env.GITHUB_TOKEN ?? ''
  });

  let service: Service = new GithubService(client);

  // Optional wrappers
  service = new CacheService(service, new MyCache());
  service = new BufferedService(service, 10);

  const repository = await service.repository('owner', 'repo');
  if (!repository) throw new Error('Repository not found');

  const tags = service.resources('tags', { repository: repository.id });

  for await (const page of tags) {
    console.log(page.data);
  }
}

void main();
```

## Core Capabilities

- Runtime-validated entities with Zod-backed contracts
- GraphQL-to-domain mapping through typed service APIs
- Resource iteration for paginated data
- Optional `CacheService` and `BufferedService` composition

## Samples

See runnable examples in [`samples/`](./samples):

- `samples/search-with-cache.ts`
- `samples/search-repositories.ts`
- `samples/get-resources.ts`

## Development (repo)

```bash
npm install
npm run verify
```

Useful commands:

```bash
npm run lint
npm run build
npm test
npm run generate:schema
```

## License

MIT
