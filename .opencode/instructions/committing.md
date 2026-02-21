# GitTrends Commit Instructions

## Purpose

Define commit message and commit workflow conventions for `@gittrends-app/core`.

## Scope and Precedence

- This file defines commit preparation and commit message rules.
- `AGENTS.md` remains the source for daily commands and repo workflow.
- If guidance overlaps, this file is the source for commit formatting and commit gate behavior.

## Required Commit Format

Use Conventional Commits:

- `type: subject`
- `type(scope): subject`

Subject style:

- SHOULD be concise and imperative.
- SHOULD start with lowercase.
- SHOULD NOT end with punctuation.
- SHOULD be a single line (commit bodies are typically not used in this repository).

## Allowed Commit Types (enforced by commitlint)

MUST use one of:

- `ci`
- `chore`
- `docs`
- `ticket`
- `feat`
- `fix`
- `perf`
- `refactor`
- `revert`
- `style`

Notes:

- Do NOT use custom types outside this list (for example, `samples:` as a type is invalid).
- Scope is optional and SHOULD be used only when it adds clarity (example: `samples`, `release`).

## Repository Commit Patterns

Observed project patterns:

- Release commits use: `chore(release): vX.Y.Z`
- Most common non-release types: `chore`, `fix`, `refactor`, `feat`, `docs`
- Scoped commits are occasional and targeted (example: `fix(samples): ...`)

## Hooks and Required Checks

- Pre-commit hook runs:
  - `npm run verify`
- Commit message hook runs:
  - `npx --no-install commitlint --edit`

This means commits may fail if lint/build/tests fail or if message format is invalid.

## Recommended Commit Workflow

1. Stage intended files only.
2. Run:
   - `npm run verify`
3. Commit with a valid Conventional Commit subject.
4. If the hook fails, fix issues and create a new commit (avoid amend unless explicitly required).

## Message Templates

- Feature:
  - `feat: add buffered iterator decorator`
- Fix:
  - `fix: handle null linkedBranches responses`
- Refactor:
  - `refactor: simplify QueryRunner retry handling`
- Docs:
  - `docs: update schema migration instructions`
- Scoped:
  - `fix(samples): use confirm default option`
- Release:
  - `chore(release): v4.3.4`

## Common Failure Modes

- Using a non-allowed commit type.
- Overly long or unclear subject text.
- Adding punctuation-heavy or sentence-style subjects.
- Attempting to commit without passing `npm run verify`.
