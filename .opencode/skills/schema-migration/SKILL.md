# Schema Migration Skill

- version: 1
- last-reviewed: 2026-05-29

## Purpose

Apply GitHub GraphQL schema revisions safely while preserving runtime validation and service contracts.

## Use This Skill When

- Updating to a new upstream GitHub GraphQL schema revision.
- Responding to upstream field/type/nullability deprecations or additions.
- Running `npm run generate:schema` and propagating contract changes.

## Do Not Use This Skill When

- The task does not involve schema revision or upstream GraphQL contract changes.

## Preconditions

- Confirm current revision in `package.json` at `gittrends.schemaRevision`.
- Start from a healthy baseline when possible (`npm run verify`).
- Migrate one upstream revision batch at a time.

## Required Migration Order

1. `src/entities/**`
2. `src/services/github/graphql/fragments/**`
3. `src/services/github/graphql/lookups/**`
4. `src/services/github/resources/**` and `src/services/github/GithubService.ts`
5. Tests

## Change Classification Rules

- Removed field/type: remove selection, mapping, schema field, and downstream usage.
- Added field/type: include only when relevant; if included, add schema + selection + mapping together.
- Renamed field: update selection and mapping atomically; optionally support dual read temporarily.
- Type/nullability changes: update Zod semantics intentionally; verify edge payload parsing.

## Validation Cadence

- During migration batches: `npm run lint`, `npm run build`, `npm test`.
- Before finalize: `npm run verify`.

## Failure Modes To Prevent

- Partial layer synchronization causing runtime parse failures.
- Unintentional contract widening from loose optional/nullable handling.
- Pagination shape drift not reflected in resource metadata.
- Schema revision update without downstream synchronization.

## Exit Criteria

- Entity, fragment selection, and mapping are synchronized.
- Lookup aliases/pagination/`next` behavior remain correct.
- Service outputs stay compatible unless intentionally versioned.
- `gittrends.schemaRevision` is updated when required.
- `npm run verify` passes.
