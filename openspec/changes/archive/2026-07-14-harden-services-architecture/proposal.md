## Why

The service decorators and GitHub implementation have a sound shape, but pagination, caching, retries, and nested resource loading do not yet share reliable behavioral contracts. In particular, cached searches can restart from the beginning, cache failures behave inconsistently, and GitHub errors or enrichment bursts can produce surprising failures for library consumers.

This change hardens those boundaries before additional providers, resources, or consumers depend on them.

## What Changes

- Define a provider-neutral continuation and page-metadata contract that remains correct through buffering and caching.
- Make cached searches and resources resume from the exact upstream cursor without duplicate pages or cache-key collisions.
- Define and apply one cache failure policy across search, user, repository, and resource operations.
- Harden GraphQL error classification and retry behavior without mutating caller-visible lookup state.
- Make the GitHub client timeout option enforce request deadlines.
- Add bounded, configurable concurrency for nested resource enrichment.
- Replace service implementation `any` paths with a typed resource mapping where practical.
- Add focused tests for decorator composition, pagination continuation, cache failures, retries, timeouts, and enrichment limits.

## Capabilities

### New Capabilities

- `service-pagination`: Stable page metadata, cursor continuation, and buffering semantics for all service iterables.
- `service-cache`: Correct cache identity, continuation, and consistent cache failure behavior for service decorators.
- `github-query-resilience`: Safe GraphQL error handling, bounded page-size retries, and enforced request timeouts.
- `github-resource-enrichment`: Bounded and configurable concurrency for nested GitHub resource loading.

### Modified Capabilities

- None.

## Impact

- Affected APIs: `Service`, `Iterable`, `PageableParams`, `CacheService`, `GithubClient`, and `GithubService` options and metadata.
- Affected implementation areas: `src/services/**`, especially decorators, `QueryRunner`, lookup pagination, GitHub resources, and client transport setup.
- Tests will add mock services, cache backends, fetchers, and GraphQL responses to verify composition and failure behavior.
- No new runtime dependency is expected; existing `p-limit` or an equivalent local mechanism can provide enrichment bounds.
- Consumers may observe corrected continuation, timeout failures, and cache-error behavior. Any intentional public-contract changes must be documented as breaking in the implementation plan.
