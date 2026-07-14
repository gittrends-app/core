## 1. Formalize Service Page Contracts

- [x] 1.1 Update `Service.ts` page metadata types and API documentation to define end-cursor continuation, terminal-page behavior, and emitted-item `per_page` semantics.
- [x] 1.2 Add an internal resource-to-entity type mapping and use it to reduce `any` casts in `PassThroughService`, `BufferedService`, `CacheService`, and `GithubService` without changing public overloads.
- [x] 1.3 Update `BufferedService` and GitHub resource iterators to emit accurate item counts, final cursors, and terminal metadata.
- [x] 1.4 Add decorator tests covering incoming cursors, buffered cursor propagation, terminal pages, and exact search totals.

## 2. Correct Cache Identity And Continuation

- [x] 2.1 Add a versioned canonical cache-key helper that normalizes operation, resource, lookup mode, structured options, dates, and cursors while excluding mutable search totals.
- [x] 2.2 Update `CacheService.search()` to use page-addressable keys, honor incoming cursors, truncate the final cached/source page to the requested total, and stop without extra requests.
- [x] 2.3 Update `GithubService.search()` and `SearchLookup` integration so an incoming `SearchParams.cursor` is used for the first GraphQL request and subsequent pages continue from returned end cursors.
- [x] 2.4 Update user, repository, and resource cache keys to include every identity dimension, including `byLogin`, repository naming mode, filters, date bounds, page size, and cursor.
- [x] 2.5 Make cache reads and writes best effort with no unhandled rejections, while preserving source-service errors; add tests for read failures, write failures, source failures, key collisions, and cache/service composition.

## 3. Harden GraphQL Retry And Error Handling

- [x] 3.1 Refactor `QueryRunner` error classification to safely handle missing or malformed response data and attach lookup aliases without replacing the original error.
- [x] 3.2 Implement retry attempts with cloned lookup state, transient-status filtering, page-size reduction, and guaranteed preservation of the caller's original lookup parameters.
- [x] 3.3 Add `QueryRunner` tests for network errors, tolerated partial responses, non-transient errors, transient retries, exhausted retries, and state preservation on success and failure.

## 4. Enforce GitHub Transport Controls

- [x] 4.1 Extend `GithubClient` options with validated timeout and shared request-concurrency configuration, retaining a documented finite default.
- [x] 4.2 Wrap the configured fetcher with abort-based timeout handling and a shared concurrency limiter for both the default and custom fetchers; preserve abort causes.
- [x] 4.3 Add `GithubClient` tests for timeout expiry, no-timeout behavior, invalid option values, custom fetchers, and maximum in-flight requests.

## 5. Bound Nested Resource Enrichment

- [x] 5.1 Verify issues, discussions, pull requests, releases, and their nested reactions/comments/review lookups all use the shared `GithubClient` transport limiter.
- [x] 5.2 Add resource-level tests proving enrichment waits for all queued work, preserves source order and completeness, never exceeds the configured limit, and propagates nested failures.
- [x] 5.3 Review enrichment code for direct fetches or independent limiters and remove any path that bypasses the shared client controls.

## 6. Public Contract And Regression Verification

- [x] 6.1 Update API comments and relevant sample/documentation text for cursor continuation, page metadata, cache best-effort behavior, timeout, and concurrency options.
- [x] 6.2 Add an integration-style test composing `CacheService`, `BufferedService`, and `GithubService` with mocked GraphQL responses to prove no duplicate pages and exact totals.
- [x] 6.3 Run `npm run verify` and resolve lint, declaration-build, and test failures before marking the change complete.
