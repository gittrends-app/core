## ADDED Requirements

### Requirement: Cache identity includes all lookup dimensions
`CacheService` SHALL generate versioned keys that distinguish operation/resource, identity-defining parameters, lookup mode, and starting cursor, while excluding mutable search totals from page identity.

#### Scenario: User lookup modes do not collide
- **WHEN** the same string is requested once by node ID and once by login
- **THEN** the requests use different cache entries

#### Scenario: Search totals reuse pages
- **WHEN** two searches have the same filters and page size but different totals
- **THEN** their matching page requests can reuse the same page cache entry

#### Scenario: Resource cursors address different pages
- **WHEN** two resource requests differ only by continuation cursor
- **THEN** they use different cache entries

### Requirement: Cached iteration resumes exactly once
The cache decorator SHALL yield cached pages in order, pass each cached continuation cursor to the underlying service, and never yield the same page twice during one iteration.

#### Scenario: Cached search has a following uncached page
- **WHEN** the first search page is cached and the next page is absent
- **THEN** the decorator yields the cached page and requests the next page using its cursor

#### Scenario: Cached resource reaches its terminal page
- **WHEN** a cached resource page has `has_more: false`
- **THEN** the decorator yields it and performs no underlying request

### Requirement: Cache failures are non-authoritative
Cache backend read and write failures SHALL not fail or alter the underlying service operation, and source-service failures SHALL still propagate to the caller.

#### Scenario: Cache read fails
- **WHEN** `Cache.get()` rejects
- **THEN** the decorator bypasses that cache entry and calls the underlying service

#### Scenario: Cache write fails
- **WHEN** `Cache.set()` rejects after a source page is returned
- **THEN** the caller still receives the source page and no unhandled rejection is produced

#### Scenario: Source service fails
- **WHEN** the underlying service rejects
- **THEN** the same source failure is propagated regardless of cache state

### Requirement: Cached searches respect the requested total
`CacheService.search()` SHALL truncate a cached final page when necessary and SHALL not fetch or yield additional pages after the requested total has been satisfied.

#### Scenario: Cached page contains more items than requested
- **WHEN** the remaining total is smaller than a cached page
- **THEN** only the remaining items are emitted and iteration ends
