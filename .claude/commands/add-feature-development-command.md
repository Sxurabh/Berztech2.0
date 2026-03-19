---
name: add-feature-development-command
description: Workflow command scaffold for add-feature-development-command in Berztech2.0.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-feature-development-command

Use this workflow when working on **add-feature-development-command** in `Berztech2.0`.

## Goal

Adds or updates workflow documentation for feature development commands, typically in markdown files under .claude/commands/.

## Common Files

- `.claude/commands/feature-development.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update a markdown file describing the feature development workflow under .claude/commands/
- Commit the file with a message referencing the feature development command

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.