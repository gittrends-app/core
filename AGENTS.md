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
- Spellcheck: `npm run spellcheck` (cspell, gitignore-aware)
- Full gate: `npm run verify` (runs `lint -> build -> test`)
- Regenerate GraphQL schema types: `npm run generate:schema` (no token needed; fetches public schema from docs.github.com)

## Focused Testing

- Single file: `npx vitest run src/helpers/sanitize.spec.ts`
- Single test: `npx vitest run src/helpers/sanitize.spec.ts -t "should remove null values at root"`
- `npm test -- <file>` also works.
- No vitest config file exists (defaults only). Tests are pure unit tests using `vi.fn`/`vi.spyOn`; no env vars, network, or fixtures required.

## Commit/Hook Constraints

- Pre-commit hook runs `npm run spellcheck && npm run verify`.
- Commit-msg hook runs commitlint (`npx --no-install commitlint --edit`).
- Allowed commit types: `ci`, `chore`, `docs`, `ticket`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`.
- No CI workflows in this package; the pre-commit hook is the only automated gate.

## Repo-Specific Gotchas

- Biome enforces `noConsole` as error; it ignores `src/services/github/graphql-schema.d.ts`.
- Biome formatting: single quotes, line width 120, no trailing commas, 2-space indent.
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

## OpenCode Local Commands & Skills

- `/schema-migration` (in `.opencode/opencode.json`): uses the `plan` agent; plan first, then execute using the `schema-migration` skill.
- OpenSpec workflow: `/opsx-*` commands (`.opencode/command/`) with matching `openspec-*` skills; change artifacts live in the root `openspec/` directory.
- Other local skills: `architecture-guardrails`, `conventional-committing`.
