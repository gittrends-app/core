# Architecture Guardrails Skill

- version: 1
- last-reviewed: 2026-05-29

## Purpose

Apply architecture-safe changes to `@gittrends-app/core` while preserving cross-layer contracts.

## Use This Skill When

- The task changes data models, GraphQL selections, lookup behavior, or GitHub service outputs.
- The task adds, removes, renames, or changes nullability/type of fields.
- The task could impact public API entrypoints in `src/index.ts`, `src/entities/index.ts`, or `src/services/index.ts`.

## Do Not Use This Skill When

- The task is purely operational (install, lint, build) without code design changes.
- The task only changes docs unrelated to architecture contracts.

## Source Of Truth

- Architecture pipeline: `Entity <- Fragment <- Lookup <- Resource/Service`.
- Domain contracts are defined with Zod in `src/entities/**`.
- GraphQL payload keys are usually camelCase and domain keys are usually snake_case.

## Required Workflow

1. Read impacted files in all affected layers.
2. For field-level changes, update in order:
   - `src/entities/**`
   - `src/services/github/graphql/fragments/**`
   - `src/services/github/graphql/lookups/**`
   - `src/services/github/resources/**` and `src/services/github/GithubService.ts`
3. Keep parse envelope shape stable for lookups: `{ data, params, next? }`.
4. Ensure batched lookup aliases are unique.
5. Re-check public API entrypoints for accidental export shape drift.

## Must-Hold Invariants

- Entity schema, fragment selection, and fragment mapping stay synchronized.
- Pagination and `next` behavior remain explicit and bounded.
- Metadata conventions stay snake_case (`per_page`, `has_more`).
- Retry behavior stays bounded and errors preserve useful context.

## Failure Modes To Prevent

- Fragment selection updated without entity schema update.
- Entity key rename without mapping update.
- Lookup pagination updates without resource metadata updates.
- Alias collisions in batched lookups.

## Exit Criteria

- Cross-layer synchronization is complete.
- Public service contracts remain compatible unless intentionally changed.
- `npm run verify` passes.
