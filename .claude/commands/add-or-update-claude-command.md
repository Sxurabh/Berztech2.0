---
name: add-or-update-claude-command
description: Workflow command scaffold for add-or-update-claude-command in Berztech2.0.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-claude-command

Use this workflow when working on **add-or-update-claude-command** in `Berztech2.0`.

## Goal

Adds or updates a Claude command by creating or modifying a markdown file describing the command.

## Common Files

- `.claude/commands/add-or-update-claude-command.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update a markdown file in .claude/commands/ named add-or-update-claude-command.md

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.