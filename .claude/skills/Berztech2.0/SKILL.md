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

Follow these commit message conventions based on 175 analyzed commits.

### Commit Style: Mixed Style

### Prefixes Used

- `feat`

### Message Guidelines

- Average message length: ~49 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: add Berztech2.0 ECC bundle (.claude/commands/add-feature-development-command.md)
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
feat: add Berztech2.0 ECC bundle (.claude/commands/add-or-update-test-suite.md)
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

**Frequency**: ~29 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `tests/security/*`
- `tests/e2e/a11y/*`
- `tests/e2e/*`
- `**/*.test.*`
- `**/api/**`

**Example commit sequence**:
```
test: Add a comprehensive suite of security integration tests and a secrets audit, alongside a test tracker and .gitignore update.
nm
feat: Add comprehensive E2E, accessibility, visual, and unit tests across various application areas.
```

### Add Or Update Claude Command

Adds or updates a workflow command for Claude agent, typically to automate or document a process such as feature development, test suite management, database migration, or TDD.

**Frequency**: ~4 times per month

**Steps**:
1. Create or update a markdown file in .claude/commands/ with the workflow details
2. Commit the change with a message referencing the command and workflow

**Files typically involved**:
- `.claude/commands/add-feature-development-command.md`
- `.claude/commands/add-or-update-test-suite.md`
- `.claude/commands/feature-development.md`
- `.claude/commands/database-migration.md`
- `.claude/commands/test-driven-development.md`

**Example commit sequence**:
```
Create or update a markdown file in .claude/commands/ with the workflow details
Commit the change with a message referencing the command and workflow
```

### Sync Skill Documentation

Adds or updates SKILL.md documentation for a Berztech2.0 skill in both .agents and .claude directories.

**Frequency**: ~4 times per month

**Steps**:
1. Create or update .agents/skills/Berztech2.0/SKILL.md
2. Create or update .claude/skills/Berztech2.0/SKILL.md
3. Commit both files together

**Files typically involved**:
- `.agents/skills/Berztech2.0/SKILL.md`
- `.claude/skills/Berztech2.0/SKILL.md`

**Example commit sequence**:
```
Create or update .agents/skills/Berztech2.0/SKILL.md
Create or update .claude/skills/Berztech2.0/SKILL.md
Commit both files together
```

### Update Codex Agents

Adds or updates agent configuration files for docs-researcher, reviewer, and explorer in the .codex/agents directory.

**Frequency**: ~4 times per month

**Steps**:
1. Create or update .codex/agents/docs-researcher.toml
2. Create or update .codex/agents/reviewer.toml
3. Create or update .codex/agents/explorer.toml
4. Commit the changes

**Files typically involved**:
- `.codex/agents/docs-researcher.toml`
- `.codex/agents/reviewer.toml`
- `.codex/agents/explorer.toml`

**Example commit sequence**:
```
Create or update .codex/agents/docs-researcher.toml
Create or update .codex/agents/reviewer.toml
Create or update .codex/agents/explorer.toml
Commit the changes
```

### Comprehensive Test Suite Addition

Adds a large set of new or updated tests, often spanning E2E, accessibility, security, and unit tests, and may include supporting files like test trackers or configuration.

**Frequency**: ~2 times per month

**Steps**:
1. Add or update multiple test files across tests/e2e/, tests/security/integration/, tests/unit/, etc.
2. Add or update supporting files such as test trackers or configuration
3. Commit all related files together

**Files typically involved**:
- `tests/e2e/*.spec.ts`
- `tests/security/integration/*.test.js`
- `tests/security/integration/*.test.ts`
- `tests/unit/**/*.test.tsx`
- `tests/TEST-TRACKER.md`
- `.gitignore`
- `vitest.config.js`
- `playwright-report/index.html`
- `test-results/.last-run.json`

**Example commit sequence**:
```
Add or update multiple test files across tests/e2e/, tests/security/integration/, tests/unit/, etc.
Add or update supporting files such as test trackers or configuration
Commit all related files together
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
