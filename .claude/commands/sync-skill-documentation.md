---
name: sync-skill-documentation
description: Workflow command scaffold for sync-skill-documentation in Berztech2.0.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /sync-skill-documentation

Use this workflow when working on **sync-skill-documentation** in `Berztech2.0`.

## Goal

Adds or updates SKILL.md documentation for a Berztech2.0 skill in both .agents and .claude directories.

## Common Files

- `.agents/skills/Berztech2.0/SKILL.md`
- `.claude/skills/Berztech2.0/SKILL.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update .agents/skills/Berztech2.0/SKILL.md
- Create or update .claude/skills/Berztech2.0/SKILL.md
- Commit both files together

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.