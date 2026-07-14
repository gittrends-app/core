## Context

The service layer exposes async iterables with cursor metadata and composes provider services with pass-through, buffering, and caching decorators. The GitHub implementation builds GraphQL lookups and enriches top-level resources with additional requests. Today, continuation state is represented inconsistently: `CacheService` forwards cached cursors, while `GithubService.search()` drops an incoming cursor; buffered metadata can describe multiple upstream pages; and cache keys include mutable request state. GraphQL retries also mutate lookup parameters and classify every `GraphqlResponseError` as retryable.

The package is a Node 20 TypeScript library. Its public API should remain provider-neutral, and existing entity and resource names should remain stable.

## Goals / Non-Goals

**Goals:**

- Make page metadata and cursor continuation composable across the base service and decorators.
- Make caching transparent: it must not change result identity, ordering, requested totals, or source-error behavior.
- Make transient GraphQL failures retryable without masking non-transient errors or leaking mutable retry state.
- Enforce configured request timeouts and a finite request concurrency limit for custom and default fetchers.
- Preserve the existing public resource overloads while improving internal type safety and testability.

**Non-Goals:**

- Introducing a second provider or changing entity schemas.
- Adding cache eviction, TTL, persistence, or distributed cache coordination.
- Changing GraphQL query selection or enrichment depth by default.
- Adding a new logging framework or exposing GraphQL implementation classes as public API.

## Decisions

### 1. Use end cursors as continuation cursors

Every emitted page uses `metadata.cursor` as the opaque cursor to pass as the next request's `opts.cursor`. It represents the upstream page's `endCursor`, not the cursor that started the current request. A terminal page has `has_more: false` and no usable continuation. This matches GraphQL's `pageInfo` model and lets decorators resume without provider-specific knowledge.

`metadata.per_page` represents the number of items in the emitted `data` array. A buffered page therefore reports its aggregate emitted count, while the original request's `opts.per_page` remains the upstream request-size hint.

### 2. Make cache entries page-addressable and best effort

Cache keys will contain a version namespace, operation/resource name, all identity-defining parameters, lookup mode, and the starting cursor. Mutable search `total` is excluded from identity so different totals can reuse the same pages. Dates and other structured values are canonicalized before hashing.

Cache reads and writes will be best effort: cache backend failures are swallowed and the underlying service remains authoritative. Underlying service failures still propagate. Cached pages are yielded in order and the decorator stops at the requested search total, including truncating the final emitted page when necessary.

### 3. Retry with cloned lookup state

`QueryRunner` will classify errors defensively, retry only configured transient HTTP statuses, and reduce explicit page sizes until the request succeeds or reaches the minimum size. Retry attempts will use cloned lookup instances/state; the caller's lookup and its pagination state will not be mutated. Non-transient GraphQL errors, malformed errors, and exhausted retries will retain the original error and lookup aliases for diagnosis.

### 4. Apply transport controls in `GithubClient`

The client will wrap every configured fetcher with an optional abort-based timeout and a finite concurrency limiter. The default concurrency remains compatible with the current public GitHub throttling behavior, while custom fetchers receive the same protection. Invalid timeout or concurrency values fail during client construction.

### 5. Keep the public service API, strengthen its internals

The existing `Service` overloads and resource names remain. An internal resource-to-entity type map will drive decorator and GitHub implementations, reducing `any` casts without forcing consumers to adopt a new API. Tests will use a minimal fake `Service`, `Cache`, and fetcher rather than reaching into GraphQL internals wherever possible.

## Risks / Trade-offs

- [Risk] Existing consumers may interpret `metadata.per_page` as the upstream request size. → Document that it is the emitted page count and preserve the request size in input options; treat this as a deliberate contract correction.
- [Risk] Best-effort caching can hide operational problems in a cache backend. → Keep cache behavior observable through an optional error callback or documented hook if the existing API permits it; never hide source-service failures.
- [Risk] Lowering concurrency can reduce peak throughput. → Provide a validated client option and choose a finite default that protects rate limits while remaining configurable.
- [Risk] Cloning arbitrary `QueryLookup` subclasses can be fragile. → Centralize cloning in `QueryRunner`, preserve the subclass prototype and immutable fields, and add tests covering every lookup family used by resources.
- [Risk] Timeout cancellation may surface as an abort error with a runtime-specific shape. → normalize only the timeout marker/message while preserving the original cause for consumers and tests.

## Migration Plan

1. Implement the service contract and cache key changes behind the existing classes and add focused unit tests.
2. Update GitHub lookup continuation, retry handling, client transport controls, and resource concurrency.
3. Add composition tests covering `CacheService(GithubService)` and buffered/cached resources.
4. Run `npm run verify`; document corrected metadata, timeout, concurrency, and cache-error behavior in the public API comments and changelog.

Rollback is a source release rollback. Cache keys use a new version namespace, so old entries can remain readable by older releases without being interpreted by the new implementation.

## Open Questions

- Should cache backend errors be exposed through an optional `onError` callback, or is silent best-effort behavior sufficient for this release?
- Should the timeout default remain disabled when omitted, or should the client adopt a finite default deadline?
