# GitTrends Schema Migration Instructions

## Purpose

Apply GitHub GraphQL schema revisions safely while preserving runtime validation and public service contracts.

## Scope and Precedence

- This file defines schema migration rules and change sequencing.
- `.opencode/instructions/architecture.md` defines architectural contracts.
- `AGENTS.md` defines operational workflow (commands, formatting, and verification routines).
- If guidance overlaps, use this file for migration sequencing and architecture doc for layer invariants.

## Pre-Migration Requirements

- MUST confirm current schema revision in `package.json` (`gittrends.schemaRevision`).
- SHOULD start from a healthy baseline (`npm run verify`) before migration edits.
- SHOULD migrate one upstream revision batch at a time to keep diffs auditable.

## Required Migration Order

Apply changes in this order unless a change is strictly layer-local:

1. Entity schema (`src/entities/**`)
2. Fragment selection and parse mapping (`src/services/github/graphql/fragments/**`)
3. Lookup behavior and pagination (`src/services/github/graphql/lookups/**`)
4. Resource/service plumbing (`src/services/github/resources/**`, `src/services/github/GithubService.ts`)
5. Tests

This order MUST be preserved for cross-layer field and type changes.

## Impact Analysis Rules

For each upstream schema change, classify first, then apply only required updates:

- Removed field/type:
  - MUST remove selection, mapping, schema field, and downstream usage.
- Added field/type:
  - SHOULD add only when relevant to current domain/service contracts.
  - MUST add schema + selection + mapping together when included.
- Renamed field:
  - MUST update selection and mapping.
  - MAY support dual read (legacy + new) during compatibility windows.
- Type/nullability change:
  - MUST update Zod semantics intentionally.
  - SHOULD document compatibility rationale when broadening types.

## Mapping and Nullability Rules

- MUST keep GraphQL camelCase to domain snake_case mapping consistent.
- MUST verify upstream nullability before final schema decisions.
- SHOULD choose `.optional()` vs `.nullable()` explicitly rather than loosely widening both.
- SHOULD prefer schema inference over duplicate interfaces.

## Change Patterns

### Remove field

- Remove from fragment selection.
- Remove from fragment parse mapping.
- Remove from entity schema.
- Update lookup/resource consumers and tests.

### Add field

- Confirm business relevance first.
- Add to entity schema.
- Add to fragment selection.
- Add to fragment parse mapping.
- Update tests and any affected public contract expectations.

### Rename field

- Update fragment selection and mapping atomically.
- If compatibility is required, parse both names into one domain key temporarily.
- Add a short migration note describing when legacy support can be removed.

### Type or nullability change

- Tighten types when safe (`z.enum`, stricter object shape).
- Use compatibility unions only for explicit transitions.
- Validate parse behavior for both nominal and edge payloads.

## Validation Cadence

After each meaningful batch:

```bash
npm run lint
npm run build
npm test
```

Before finalizing migration work:

```bash
npm run verify
```

Optional deeper signal:

```bash
npm run test:coverage
```

## Common Migration Failure Modes

- Fragment field changed but entity schema/mapping not updated, causing runtime parse failures.
- Entity field widened without intentional nullability handling, causing silent contract drift.
- Lookup pagination shape changed without corresponding resource metadata updates.
- Batched lookups collide on alias values (enforced by `QueryRunner`).
- Schema revision is updated without complete downstream synchronization.

## Definition of Done

- Entity schema, fragment selection, and parse mapping are synchronized.
- Lookup pagination, aliases, and `next` behavior remain correct.
- Resource/service outputs stay contract-compatible unless intentionally versioned.
- `gittrends.schemaRevision` in `package.json` is updated when this migration batch requires it.
- `npm run verify` passes.

## References

- GitHub GraphQL changelog: `https://docs.github.com/graphql/overview/changelog`
- GitHub schema docs: `https://docs.github.com/public/fpt/schema.docs.graphql`
- Architecture contracts: `.opencode/instructions/architecture.md`
