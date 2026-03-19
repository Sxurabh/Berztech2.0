---
name: add-or-update-claude-command
description: Workflow command scaffold for add-or-update-claude-command in Berztech2.0.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-claude-command

Use this workflow when working on **add-or-update-claude-command** in `Berztech2.0`.

## Goal

Adds or updates a workflow command for Claude agent, typically to automate or document a process such as feature development, test suite management, database migration, or TDD.

## Common Files

- `.claude/commands/add-feature-development-command.md`
- `.claude/commands/add-or-update-test-suite.md`
- `.claude/commands/feature-development.md`
- `.claude/commands/database-migration.md`
- `.claude/commands/test-driven-development.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update a markdown file in .claude/commands/ with the workflow details
- Commit the change with a message referencing the command and workflow

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.