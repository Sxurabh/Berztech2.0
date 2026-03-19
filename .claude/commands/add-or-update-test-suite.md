---
name: add-or-update-test-suite
description: Workflow command scaffold for add-or-update-test-suite in Berztech2.0.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-test-suite

Use this workflow when working on **add-or-update-test-suite** in `Berztech2.0`.

## Goal

Adds or updates a comprehensive test suite, including unit, integration, E2E, security, and load tests, often with CI configuration and test setup/mocks.

## Common Files

- `vitest.config.js`
- `playwright.config.js`
- `.github/workflows/test.yml`
- `tests/setup.ts`
- `tests/TEST-TRACKER.md`
- `tests/GUIDE.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Add or update test configuration files (e.g., vitest.config.js, playwright.config.js, .github/workflows/test.yml)
- Add or update test setup files and mocks (e.g., tests/setup.ts, tests/mocks/...)
- Add or update test tracker/guide/strategy docs (e.g., tests/TEST-TRACKER.md, tests/GUIDE.md, tests/TESTING_STRATEGY.md)
- Add or update various test files (unit, integration, E2E, security, load, property, contract) under tests/
- Update package.json and package-lock.json for dependencies

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.