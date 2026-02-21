# AGENTS.md

Guide for coding agents working in `@gittrends-app/core`.

## 1) Project Quick Facts
- Stack: TypeScript (ESM), Node.js >= 20.
- Package manager: npm scripts are canonical (yarn lock is present).
- Output: `dist/`.
- Architecture: Entity (Zod) <- Fragment (GraphQL) <- Lookup <- Resource/Service.
- Public API entrypoints: `src/index.ts`, `src/entities/index.ts`, `src/services/index.ts`.

## 2) Setup and Daily Commands
Run commands from the repository root.

```bash
npm install
```

### Lint / Format / Build / Test
```bash
npm run lint          # biome check ./src
npm run lint:fix      # biome check --write ./src
npm run format        # biome format --write ./src
npm run build         # clean + tsup compile + declaration build
npm test              # vitest run
npm run test:coverage # vitest run --coverage
npm run verify        # lint + build + test
```

### Run a Single Test (important)
```bash
npx vitest run src/helpers/sanitize.spec.ts
npx vitest run src/helpers/sanitize.spec.ts -t "should remove null values at root"
npm test -- src/helpers/sanitize.spec.ts
npm test -- src/helpers/sanitize.spec.ts -t "should remove null values at root"
```

Notes:
- Tests currently follow `src/**/*.spec.ts` (`src/helpers/sanitize.spec.ts` exists).
- `tsconfig.json` excludes `src/**/*.spec.ts` and `src/**/*.test.ts` from type declaration emit.

### Schema generation
```bash
npm run generate:schema
```
Generates `src/services/github/graphql-schema.d.ts` from GitHub GraphQL schema.

## 3) Hooks and Required Checks
- Pre-commit hook (`.husky/pre-commit`) runs `npm run verify`.
- Commit-msg hook (`.husky/commit-msg`) runs commitlint.
- Allowed commit types (`.commitlintrc.json`):
  - `ci`, `chore`, `docs`, `ticket`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`
- Expect commits to fail locally if lint/build/tests do not pass.

## 4) Formatting Rules (Biome + EditorConfig)
Sources: `biome.json`, `.editorconfig`.

- Indent: 2 spaces.
- EOL: LF.
- Charset: UTF-8.
- Line width: 120.
- Quotes: single.
- Semicolons: always.
- Trailing commas: none.
- Import organization: enabled (`assist.actions.source.organizeImports`).
- Lint rule: `noConsole` is error.
- Lint rule: `noExplicitAny` is off (still prefer specific typing).

Recommended loop after edits:
1. `npm run lint` (or `npm run lint:fix`)
2. targeted test(s)
3. `npm run verify` for final pass

## 5) Import Conventions
- Use ESM imports only.
- Keep external imports before local imports.
- Let Biome organize exact order.
- Prefer explicit local module paths when clarity matters (e.g. `../entities/Issue`).
- Use barrel exports (`../entities`, `../services`) for broader API-level imports.

## 6) Types and Validation Conventions
The repo is schema-first with Zod.

- Define data contracts in `src/entities/**` using `zod`.
- Export domain types from schemas (`z.output<typeof Schema>`).
- Compose schemas via `.extend(...)` when reusing node/comment/reactable fields.
- Use coercion for API values (`z.coerce.date()`, `z.coerce.number()`).
- Use `.optional()` and `.nullable()` intentionally.
- Prefer schema inference over duplicate hand-written interfaces.

When changing fields, keep these synchronized:
1. Entity schema
2. GraphQL fragment fields
3. Fragment parse mapping
4. Lookup/output behavior

## 7) Naming Conventions
- Types/classes/interfaces: `PascalCase`.
- Functions/variables/methods: `camelCase`.
- Service resource discriminators: snake_case strings (`pull_requests`, `stargazers`, etc.).
- Paging metadata keys are snake_case (`per_page`, `has_more`).
- File naming patterns:
  - entities/fragments/lookups/classes: mostly `PascalCase.ts`
  - resource modules: often `snake_case.ts`
  - tests: `*.spec.ts`

Data mapping convention:
- GraphQL payload keys are usually camelCase.
- Internal/domain object keys are often snake_case.

## 8) Error Handling Guidelines
Follow existing patterns in `src/services/github/graphql/QueryRunner.ts` and `src/services/github/resources/users.ts`.

- Throw `Error` for invalid local input/state.
- For GitHub GraphQL failures, branch on status + `GraphqlResponseError` where needed.
- Preserve context on thrown errors when practical (lookup/query info).
- Keep retries bounded; avoid unbounded recursion/loops.
- Do not silently swallow unexpected failures.
- Return `null` only when the public contract already allows nullable results.

## 9) Architecture Workflow for Changes
For new/changed data fields:
1. Update entity schema (`src/entities/**`)
2. Update fragment query + parsing (`src/services/github/graphql/fragments/**`)
3. Update lookup query/pagination behavior (`src/services/github/graphql/lookups/**`)
4. Update resource/service plumbing (`src/services/github/resources/**`, `GithubService.ts`)
5. Add/update tests

Important: batched lookup aliases must be unique (`QueryRunner` enforces this).

## 10) Generated Files
- Generated: `src/services/github/graphql-schema.d.ts`
- Build artifacts: `dist/**`
- Prefer regenerating over hand-editing generated files.
- After generation updates, run `npm run verify`.

## 11) OpenCode Preferences
This repository uses OpenCode under `.opencode/`.

- Preferences/config: `.opencode/opencode.json`
- Architecture instructions: `.opencode/instructions/architecture.md`
- Schema migration instructions: `.opencode/instructions/schema-migration.md`
- Commit instructions: `.opencode/instructions/committing.md`

## 12) Recommended Agent Checklist
1. Read impacted entity/fragment/lookup/resource files before editing.
2. Make minimal, style-consistent changes.
3. Run single test(s) for touched area.
4. Run `npm run verify` before finalizing.
5. Ensure no `console.*` remains.
6. Use conventional commit types.
