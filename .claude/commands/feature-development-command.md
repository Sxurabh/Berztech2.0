---
name: feature-development-command
description: Workflow command scaffold for feature-development-command in Berztech2.0.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /feature-development-command

Use this workflow when working on **feature-development-command** in `Berztech2.0`.

## Goal

Documents or implements a feature development workflow by creating or updating a markdown file describing the process.

## Common Files

- `.claude/commands/feature-development.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update a markdown file in .claude/commands/ named feature-development.md

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.