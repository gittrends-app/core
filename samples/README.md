# Samples

This folder contains small runnable examples demonstrating how to use `@gittrends-app/core`. Each sample is a self-contained script showing a common usage pattern (searching, fetching resources, caching, buffering).

Samples

- `search-repositories.ts` — Interactive search CLI. Prompts for search parameters (total, name, language, organization) and optionally asks whether to wrap the service with `CacheService` and/or `BufferedService` (you can toggle these at runtime). This is the primary search sample.
- `get-resources.ts` — Interactive CLI that fetches a repository and iterates over chosen resources (commits, issues, pull requests, releases, stargazers, tags, watchers). Demonstrates `CacheService` and entity field selection.

Quick run (yarn)

```bash
# install dependencies with yarn
yarn install

# run the interactive search sample (from repo root)
GITHUB_TOKEN=your_token npx tsx samples/search-repositories.ts
```

Notes

- Environment variables: `GITHUB_TOKEN` or `GH_TOKEN` — a GitHub Personal Access Token is recommended to avoid strict unauthenticated rate limits.
- The `search-repositories.ts` sample asks whether to enable caching and buffering at runtime. If you enable caching the sample uses an in-memory cache implementation for demo purposes; swap in Redis or file-backed caches for persistence.
- Use `npx tsx` to run TypeScript samples without building the project.
