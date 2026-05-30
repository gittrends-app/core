# Conventional Committing Skill

- version: 1
- last-reviewed: 2026-05-29

## Purpose

Prepare compliant commits for `@gittrends-app/core` using repository commit hooks and commitlint rules.

## Use This Skill When

- The user asks to create a commit.
- The user asks to draft or validate commit messages.

## Do Not Use This Skill When

- No commit is requested.
- The task is limited to local edits or analysis.

## Commit Message Contract

Use Conventional Commits:

- `type: subject`
- `type(scope): subject`

Allowed types:

- `ci`, `chore`, `docs`, `ticket`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`

Subject rules:

- Imperative and concise.
- Starts lowercase.
- No trailing punctuation.
- Single line.

## Workflow

1. Stage only intended files.
2. Run `npm run verify`.
3. Commit with a valid Conventional Commit message.
4. If hook fails, fix issues and create a new commit.

## Hook Awareness

- Pre-commit runs `npm run verify`.
- Commit-msg runs commitlint.

## Failure Modes To Prevent

- Invalid commit type.
- Subject too long or sentence-like.
- Attempting to commit without passing verify.

## Exit Criteria

- Commit message passes commitlint.
- Pre-commit checks pass.
- Commit reflects only intended changes.
