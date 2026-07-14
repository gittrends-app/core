## ADDED Requirements

### Requirement: GraphQL errors retain their original diagnosis
`QueryRunner` SHALL inspect optional error fields defensively, preserve the original error when response metadata is missing or malformed, and attach the affected lookup aliases without replacing the error with a secondary `TypeError`.

#### Scenario: A network error has no response object
- **WHEN** the GraphQL fetch rejects with an error that has no `response`
- **THEN** `QueryRunner` rejects with that error and includes lookup context

#### Scenario: A partial GraphQL response contains only tolerated errors
- **WHEN** GitHub returns a recognized partial response error for every lookup
- **THEN** `QueryRunner` applies the documented partial-response behavior without throwing a property-access error

### Requirement: Retries are limited to transient failures
`QueryRunner` SHALL retry only configured transient server failures, reduce explicit page sizes toward one for each retry, and stop after the request succeeds or no smaller retry is possible.

#### Scenario: A transient server error occurs with a large page size
- **WHEN** a request returns status 500, 502, or 504 and its page size is greater than one
- **THEN** the runner retries with a smaller page size

#### Scenario: A non-transient GraphQL error occurs
- **WHEN** a request returns a not-found, forbidden, validation, or malformed error
- **THEN** the runner does not retry it as a generic server failure

#### Scenario: Retries are exhausted
- **WHEN** a transient request still fails at page size one
- **THEN** the runner rejects with the original failure and lookup context

### Requirement: Retry attempts do not mutate caller-visible lookup state
Retry attempts SHALL use independent lookup state, and the original lookup's parameters and pagination state SHALL be unchanged after success or failure.

#### Scenario: A retry succeeds
- **WHEN** the first attempt fails and a reduced-page retry succeeds
- **THEN** the caller's lookup retains its original page size and cursor

#### Scenario: A retry fails
- **WHEN** all reduced-page attempts fail
- **THEN** the caller's lookup still retains its original page size and cursor

### Requirement: Configured client timeouts abort requests
`GithubClient` SHALL enforce a positive configured timeout for every request made through its configured fetcher and SHALL preserve the timeout cause when the request is aborted.

#### Scenario: A request exceeds the timeout
- **WHEN** a fetcher does not settle before the configured timeout
- **THEN** the client aborts the request and rejects with a timeout-identifiable error

#### Scenario: No timeout is configured
- **WHEN** the timeout option is omitted
- **THEN** the client does not install a deadline

#### Scenario: Invalid timeout is configured
- **WHEN** timeout is zero, negative, non-finite, or non-integer
- **THEN** client construction fails with a validation error
