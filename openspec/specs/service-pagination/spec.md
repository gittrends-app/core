# Purpose

TBD: Define service page metadata, continuation, and search total behavior.

## Requirements

### Requirement: Service pages expose composable continuation metadata
Every service iterable SHALL emit metadata where `cursor` is the opaque upstream end cursor for the next request, `has_more` is true only when another page can be requested, and `per_page` equals the number of items in the emitted `data` array.

#### Scenario: A non-terminal page is emitted
- **WHEN** a provider returns another page with an end cursor
- **THEN** the service emits that end cursor, `has_more: true`, and the emitted data count as `per_page`

#### Scenario: A terminal page is emitted
- **WHEN** a provider reports no next page
- **THEN** the service emits `has_more: false` and does not advertise a usable continuation cursor

#### Scenario: A buffered page is emitted
- **WHEN** `BufferedService` combines multiple upstream pages
- **THEN** it emits the concatenated data, the final upstream cursor, and `per_page` equal to the concatenated data length

### Requirement: Service continuation honors an incoming cursor
Every service implementation that accepts `PageableParams.cursor` SHALL use that cursor as the starting point of its first provider request, and every decorator SHALL forward the updated cursor without restarting from the beginning.

#### Scenario: GitHub search starts after the supplied cursor
- **WHEN** `search()` receives a cursor
- **THEN** its first GraphQL lookup includes that cursor and does not request earlier search pages

#### Scenario: A resource resumes after a cached page
- **WHEN** a decorator supplies the previous page's metadata cursor to a resource service
- **THEN** the underlying service begins at that cursor and the resulting sequence contains no duplicate cached page

### Requirement: Search honors the requested total
Search iterables SHALL emit no more than the requested total number of repositories, including when buffering or replaying cached pages.

#### Scenario: The final page exceeds the remaining total
- **WHEN** a page contains more repositories than the remaining requested total
- **THEN** the service emits only the remaining repositories and stops iteration

#### Scenario: The requested total is non-positive
- **WHEN** `search()` is called with a total less than or equal to zero
- **THEN** it emits no pages and performs no provider request
