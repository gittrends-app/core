# GitTrends Core Architecture Instructions

## Purpose

Use this guide to make architecture-safe changes to GitTrends core (TypeScript package that collects and normalizes GitHub GraphQL data).

## Scope and Precedence

- This file defines architecture rules and cross-layer contracts.
- `AGENTS.md` defines operational workflow (commands, lint/test expectations, commit constraints).
- If guidance overlaps, architecture behavior in this file takes precedence for code design, while `AGENTS.md` remains the source for execution steps.

## Architecture Pipeline (in order)

1. `Entity` (`src/entities/**`): Zod schema, runtime validation, domain type export.
2. `Fragment` (`src/services/github/graphql/fragments/**`): GraphQL field selection and payload-to-domain mapping.
3. `Lookup` (`src/services/github/graphql/lookups/**`): query composition, pagination state, and parse envelope.
4. `Resource/Service` (`src/services/github/resources/**`, `src/services/github/GithubService.ts`): public typed iterables/fetchers and stable contract exposure.

For field-level changes, update layers in this order unless the change is layer-local.

## Layer Contracts

### Entity

- MUST define domain contracts with Zod.
- SHOULD export types via `z.output<typeof Schema>`.
- SHOULD prefer schema inference over duplicate manual interfaces.
- MUST keep nullability and coercion explicit (`.optional()`, `.nullable()`, `z.coerce.*`) where needed.

### Fragment

- MUST request all fields required by downstream entity parsing.
- MUST map GraphQL payload keys (usually camelCase) to domain keys (usually snake_case) consistently.
- MUST parse through entity schemas before returning domain objects.
- Reference contract: `src/services/github/graphql/fragments/Fragment.ts`.

### Lookup

- MUST return parse envelopes shaped like `{ data, params, next? }`.
- MUST keep pagination behavior explicit (`first`, `after`, `pageInfo`/cursor wiring).
- SHOULD avoid hidden shape changes in `params` or `data` without corresponding service updates.
- Reference contract: `src/services/github/graphql/lookups/Lookup.ts`.

### Resource / Service

- MUST preserve public service contract compatibility unless a breaking change is intentional.
- MUST keep metadata conventions stable (snake_case keys like `per_page`, `has_more`).
- SHOULD isolate GitHub-specific query details to lookup/fragment layers.
- Reference contracts: `src/services/github/GithubService.ts`, `src/Service.ts`.

### Query Runner invariants

- MUST keep batch lookup aliases unique (enforced in `QueryRunner`).
- MUST keep retry behavior bounded.
- SHOULD preserve error context with lookup identifiers when rethrowing.
- Reference: `src/services/github/graphql/QueryRunner.ts`.

## Change Impact Matrix

- Add field:
  - MUST update entity schema, fragment selection, and fragment mapping.
  - SHOULD update lookup/resource only if query shape, pagination, or service output changes.
- Remove field:
  - MUST remove from fragment selection, mapping, and entity schema.
  - MUST update downstream consumers/tests.
- Rename field:
  - MUST update fragment selection and mapping.
  - SHOULD support temporary dual mapping only when compatibility window is required.
- Nullability/type change:
  - MUST update entity schema semantics intentionally.
  - MUST verify parse behavior for both expected and edge payloads.
- Pagination/query-shape change:
  - MUST update lookup parse/`next` behavior and resource metadata semantics.

## Mapping and Naming Rules

- GraphQL payload keys are usually camelCase.
- Domain keys are usually snake_case.
- Paging metadata keys are snake_case (`per_page`, `has_more`).
- Resource names are snake_case (`pull_requests`, `stargazers`, etc.).

Examples:
- `createdAt -> created_at`
- `updatedAt -> updated_at`
- `assignedActors -> assigned_actors`

## Error and Robustness Rules

- MUST throw for invalid local state or unsupported operations.
- SHOULD follow existing GraphQL error-handling patterns in `QueryRunner` and resource modules.
- SHOULD attach useful context (lookup/query information) to errors.
- MUST avoid unbounded retries or recursion.

## Public API Stability

- Treat `src/index.ts`, `src/entities/index.ts`, and `src/services/index.ts` as public API boundaries.
- SHOULD avoid changing exported shapes accidentally when updating internal mapping/query layers.
- MUST ensure service overloads and iterable metadata remain coherent after changes.

## Common Failure Modes

- Fragment selection updated but entity schema not updated, causing runtime parse failures.
- Entity key renamed without fragment mapping update, causing silent data loss or `undefined` fields.
- Batched lookups share alias values, causing query assembly failure.
- Pagination fields change in lookup but resource metadata remains stale.
- Domain naming drifts from snake_case conventions.

## Definition of Done (architecture)

- Entity, fragment selection, and fragment mapping are synchronized for changed fields.
- Lookup pagination and `next` behavior match the intended query shape.
- Service/resource output and metadata contracts remain stable (or intentionally versioned).
- Public entrypoint exports remain valid and coherent.
- `npm run verify` passes.

## Task-Oriented File Map

- Domain schema/type changes: `src/entities/**`
- GraphQL field and parse mapping changes: `src/services/github/graphql/fragments/**`
- Pagination/query wiring changes: `src/services/github/graphql/lookups/**`
- Error/retry/batch behavior: `src/services/github/graphql/QueryRunner.ts`
- Public service behavior: `src/services/github/resources/**`, `src/services/github/GithubService.ts`
- Public API surface checks: `src/index.ts`, `src/entities/index.ts`, `src/services/index.ts`
