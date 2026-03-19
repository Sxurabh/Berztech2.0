---
name: berztech2-0-conventions
description: Development conventions and patterns for Berztech2.0. JavaScript Next.js project with mixed commits.
---

# Berztech2 0 Conventions

> Generated from [Sxurabh/Berztech2.0](https://github.com/Sxurabh/Berztech2.0) on 2026-03-19

## Overview

This skill teaches Claude the development patterns and conventions used in Berztech2.0.

## Tech Stack

- **Primary Language**: JavaScript
- **Framework**: Next.js
- **Architecture**: type-based module organization
- **Test Location**: separate
- **Test Framework**: vitest

## When to Use This Skill

Activate this skill when:
- Making changes to this repository
- Adding new features following established patterns
- Writing tests that match project conventions
- Creating commits with proper message format

## Commit Conventions

Follow these commit message conventions based on 197 analyzed commits.

### Commit Style: Mixed Style

### Prefixes Used

- `feat`

### Message Guidelines

- Average message length: ~51 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: add Berztech2.0 ECC bundle (.claude/commands/add-or-update-skill-documentation.md)
```

*Commit message example*

```text
test: Add a comprehensive suite of security integration tests and a secrets audit, alongside a test tracker and .gitignore update.
```

*Commit message example*

```text
fix: mobile optimize TaskModal grid and footer actions
```

*Commit message example*

```text
chore: clean up root directory and update README
```

*Commit message example*

```text
refactor: enhance Header and RootLayout components; improve menu animation and layout
```

*Commit message example*

```text
feat: add Berztech2.0 ECC bundle (.claude/commands/add-or-update-claude-command.md)
```

*Commit message example*

```text
feat: add Berztech2.0 ECC bundle (.claude/commands/feature-development.md)
```

*Commit message example*

```text
feat: add Berztech2.0 ECC bundle (.codex/agents/docs-researcher.toml)
```

## Architecture

### Project Structure: Single Package

This project uses **type-based** module organization.

### Source Layout

```
src/
├── app/
├── assets/
├── components/
├── config/
├── data/
├── fonts/
├── lib/
```

### Configuration Files

- `.github/workflows/test.yml`
- `next.config.js`
- `package.json`
- `tailwind.config.js`

### Guidelines

- Group code by type (components, services, utils)
- Keep related functionality in the same type folder
- Avoid circular dependencies between type folders

## Code Style

### Language: JavaScript

### Naming Conventions

| Element | Convention |
|---------|------------|
| Files | camelCase |
| Functions | camelCase |
| Classes | PascalCase |
| Constants | SCREAMING_SNAKE_CASE |

### Import Style: Path Aliases (@/, ~/)

### Export Style: Default Exports


*Preferred import style*

```typescript
// Use path aliases for imports
import { Button } from '@/components/Button'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
```

*Preferred export style*

```typescript
// Use default exports for main component/function
export default function UserProfile() { ... }
```

## Testing

### Test Framework: vitest

### File Pattern: `*.test.ts`

### Test Types

- **Unit tests**: Test individual functions and components in isolation
- **Integration tests**: Test interactions between multiple components/services
- **E2e tests**: Test complete user flows through the application

### Mocking: msw

### Coverage

This project has coverage reporting configured. Aim for 80%+ coverage.


*Test file structure*

```typescript
import { describe, it, expect } from 'vitest'

describe('MyFunction', () => {
  it('should return expected result', () => {
    const result = myFunction(input)
    expect(result).toBe(expected)
  })
})
```

## Error Handling

### Error Handling Style: Try-Catch Blocks


*Standard error handling pattern*

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('User-friendly message')
}
```

## Common Workflows

These workflows were detected from analyzing commit patterns.

### Feature Development

Standard feature implementation workflow

**Frequency**: ~30 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `**/*.test.*`

**Example commit sequence**:
```
feat: add Berztech2.0 ECC bundle (.codex/agents/explorer.toml)
feat: add Berztech2.0 ECC bundle (.codex/agents/reviewer.toml)
feat: add Berztech2.0 ECC bundle (.codex/agents/docs-researcher.toml)
```

### Add Or Update Claude Command

Adds or updates a Claude command by creating or modifying a markdown file describing the command.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update a markdown file in .claude/commands/ named add-or-update-claude-command.md

**Files typically involved**:
- `.claude/commands/add-or-update-claude-command.md`

**Example commit sequence**:
```
Create or update a markdown file in .claude/commands/ named add-or-update-claude-command.md
```

### Feature Development Command

Documents or implements a feature development workflow by creating or updating a markdown file describing the process.

**Frequency**: ~6 times per month

**Steps**:
1. Create or update a markdown file in .claude/commands/ named feature-development.md

**Files typically involved**:
- `.claude/commands/feature-development.md`

**Example commit sequence**:
```
Create or update a markdown file in .claude/commands/ named feature-development.md
```

### Add Or Update Test Suite Command

Adds or updates documentation for test suite commands.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update a markdown file in .claude/commands/ named add-or-update-test-suite.md

**Files typically involved**:
- `.claude/commands/add-or-update-test-suite.md`

**Example commit sequence**:
```
Create or update a markdown file in .claude/commands/ named add-or-update-test-suite.md
```

### Sync Skill Documentation

Synchronizes or updates skill documentation files for Berztech2.0.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update a markdown file in .claude/commands/ named add-or-update-skill-documentation.md
2. Create or update a markdown file in .agents/skills/Berztech2.0/SKILL.md
3. Create or update a markdown file in .claude/skills/Berztech2.0/SKILL.md

**Files typically involved**:
- `.claude/commands/add-or-update-skill-documentation.md`
- `.agents/skills/Berztech2.0/SKILL.md`
- `.claude/skills/Berztech2.0/SKILL.md`

**Example commit sequence**:
```
Create or update a markdown file in .claude/commands/ named add-or-update-skill-documentation.md
Create or update a markdown file in .agents/skills/Berztech2.0/SKILL.md
Create or update a markdown file in .claude/skills/Berztech2.0/SKILL.md
```

### Add Codex Agent Bundle

Adds or updates the set of Codex agent configuration files.

**Frequency**: ~6 times per month

**Steps**:
1. Create or update .codex/agents/docs-researcher.toml
2. Create or update .codex/agents/reviewer.toml
3. Create or update .codex/agents/explorer.toml

**Files typically involved**:
- `.codex/agents/docs-researcher.toml`
- `.codex/agents/reviewer.toml`
- `.codex/agents/explorer.toml`

**Example commit sequence**:
```
Create or update .codex/agents/docs-researcher.toml
Create or update .codex/agents/reviewer.toml
Create or update .codex/agents/explorer.toml
```

### Add Or Update Identity And Tools

Adds or updates identity and ECC tools configuration for Claude.

**Frequency**: ~4 times per month

**Steps**:
1. Create or update .claude/identity.json
2. Create or update .claude/ecc-tools.json

**Files typically involved**:
- `.claude/identity.json`
- `.claude/ecc-tools.json`

**Example commit sequence**:
```
Create or update .claude/identity.json
Create or update .claude/ecc-tools.json
```

### Add Or Update Berztech2 0 Skill Agent

Adds or updates the Berztech2.0 skill agent YAML configuration.

**Frequency**: ~4 times per month

**Steps**:
1. Create or update .agents/skills/Berztech2.0/agents/openai.yaml

**Files typically involved**:
- `.agents/skills/Berztech2.0/agents/openai.yaml`

**Example commit sequence**:
```
Create or update .agents/skills/Berztech2.0/agents/openai.yaml
```


## Best Practices

Based on analysis of the codebase, follow these practices:

### Do

- Write tests using vitest
- Follow *.test.ts naming pattern
- Use camelCase for file names
- Prefer default exports

### Don't

- Don't use long relative imports (use aliases)
- Don't skip tests for new features
- Don't deviate from established patterns without discussion

---

*This skill was auto-generated by [ECC Tools](https://ecc.tools). Review and customize as needed for your team.*
