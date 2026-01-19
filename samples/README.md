# Samples

This folder contains small runnable examples demonstrating how to use `@gittrends-app/core`. Each sample is a self-contained script showing a common usage pattern (searching, fetching resources, caching, buffering).

Samples

- `search-with-cache.ts` — TypeScript example showing how to create a `GithubClient`, wrap `GithubService` with an in-memory `CacheService`, optionally add `BufferedService`, and run a repository search.
- `search-repositories.ts` — Interactive CLI that prompts for search parameters and lists repositories in a table. Uses `GithubService` directly.
- `get-resources.ts` — Interactive CLI that fetches a repository and iterates over chosen resources (commits, issues, PRs, releases, stargazers, tags, watchers). Demonstrates `CacheService` usage and entity field selection.

Quick run (yarn)

```bash
# install dependencies with yarn
yarn install

# run the search-with-cache sample (from repo root)
GITHUB_TOKEN=your_token npx tsx samples/search-with-cache.ts
```

Notes

- Environment variables: `GITHUB_TOKEN` (or `GH_TOKEN`) — a GitHub Personal Access Token is recommended to avoid strict unauthenticated rate limits.
- The `search-with-cache.ts` sample uses an in-memory cache; swap in Redis or file-backed caches for persistent runs.
- Use `npx tsx` to run TypeScript samples without building the project.
