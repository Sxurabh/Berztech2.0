---
name: add-or-update-test-suite
description: Workflow command scaffold for add-or-update-test-suite in Berztech2.0.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-test-suite

Use this workflow when working on **add-or-update-test-suite** in `Berztech2.0`.

## Goal

Adds or updates a comprehensive suite of tests (unit, integration, E2E, security, accessibility, visual, etc.) for new or existing features/components.

## Common Files

- `tests/components/**/*.test.*`
- `tests/unit/**/*.test.*`
- `tests/integration/**/*.test.*`
- `tests/e2e/**/*.spec.*`
- `tests/security/**/*.test.*`
- `tests/property/**/*.test.*`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Add or update test files under tests/components/, tests/unit/, tests/integration/, tests/e2e/, tests/security/, tests/property/, tests/contract/, tests/load/
- Update or create test configuration files (e.g., vitest.config.js, playwright.config.js, stryker.conf.js)
- Update or create test documentation/tracker files (e.g., tests/TEST-TRACKER.md, tests/GUIDE.md)
- Optionally update .gitignore or test setup files

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.