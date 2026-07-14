## ADDED Requirements

### Requirement: GitHub request concurrency is bounded
All GitHub GraphQL requests made by a client SHALL pass through a shared finite concurrency limit, including nested enrichment requests and requests made with a custom fetcher.

#### Scenario: Multiple issues require enrichment
- **WHEN** a page contains multiple issues with reactions or timeline items
- **THEN** the number of in-flight GitHub requests never exceeds the configured limit

#### Scenario: Nested discussion or pull-request enrichment occurs
- **WHEN** comments, replies, review threads, or reactions trigger additional requests
- **THEN** those requests use the same shared client limit rather than an unbounded `Promise.all`

#### Scenario: A custom fetcher is supplied
- **WHEN** `GithubClient` is constructed with a custom fetcher
- **THEN** the custom fetcher is also protected by the configured concurrency limit

### Requirement: Concurrency configuration is validated and predictable
The client SHALL expose a documented finite default concurrency and SHALL reject invalid concurrency configuration during construction.

#### Scenario: A valid concurrency limit is supplied
- **WHEN** the configured limit is a positive integer
- **THEN** requests use that limit

#### Scenario: An invalid concurrency limit is supplied
- **WHEN** the configured limit is zero, negative, non-finite, or non-integer
- **THEN** client construction fails with a validation error

### Requirement: Enrichment preserves result completeness
Applying the concurrency limit SHALL delay work rather than drop, reorder, or partially yield enriched entities.

#### Scenario: Enrichment requests are queued
- **WHEN** more enrichment work exists than available concurrency slots
- **THEN** all requested enrichment completes before the containing page is yielded, in the original entity order

#### Scenario: An enrichment request fails
- **WHEN** a nested enrichment request rejects
- **THEN** the containing service operation rejects with that failure instead of yielding silently incomplete data
