# AGENTS.md

Guidance for OpenCode agents in `@gittrends-app/core`.

## Fast Facts

- Single-package TypeScript ESM library (Node `>=20`), published from `dist/`.
- Public API boundaries: `src/index.ts`, `src/entities/index.ts`, `src/services/index.ts`.
- Data flow for GitHub data changes: `Entity (Zod) -> Fragment -> Lookup -> Resource/Service`.

## Commands (source of truth: `package.json`)

- Install: `npm install`
- Lint: `npm run lint`
- Auto-fix lint: `npm run lint:fix`
- Format: `npm run format`
- Build: `npm run build`
- Test all: `npm test`
- Coverage: `npm run test:coverage`
- Full gate: `npm run verify` (runs `lint -> build -> test`)
- Regenerate GraphQL schema types: `npm run generate:schema`

## Focused Testing

- Single file: `npx vitest run src/helpers/sanitize.spec.ts`
- Single test: `npx vitest run src/helpers/sanitize.spec.ts -t "should remove null values at root"`
- `npm test -- <file>` also works.

## Commit/Hook Constraints

- Pre-commit hook runs `npm run verify`.
- Commit-msg hook runs commitlint (`npx --no-install commitlint --edit`).
- Allowed commit types: `ci`, `chore`, `docs`, `ticket`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`.

## Repo-Specific Gotchas

- Biome enforces `noConsole` as error.
- TS declaration emit excludes tests (`src/**/*.spec.ts`, `src/**/*.test.ts`).
- Generated file: `src/services/github/graphql-schema.d.ts` (from `codegen.ts`); prefer regenerate over manual edits.
- `gittrends.schemaRevision` in `package.json` tracks current upstream schema revision.

## Change Workflow (for schema/field changes)

1. Update entity schema (`src/entities/**`).
2. Update GraphQL fragment selection + mapping (`src/services/github/graphql/fragments/**`).
3. Update lookup pagination/parse (`src/services/github/graphql/lookups/**`).
4. Update service/resource outputs (`src/services/github/resources/**`, `src/services/github/GithubService.ts`).
5. Update tests.
6. Run `npm run verify`.

## OpenCode Local Command

- Repo provides `/schema-migration` in `.opencode/opencode.json`.
- It uses the `plan` agent and is intended to plan first, then execute using the `schema-migration` skill.
