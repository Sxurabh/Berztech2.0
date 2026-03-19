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

Follow these commit message conventions based on 164 analyzed commits.

### Commit Style: Mixed Style

### Prefixes Used

- `feat`

### Message Guidelines

- Average message length: ~48 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: add Berztech2.0 ECC bundle (.claude/commands/add-or-update-test-suite.md)
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
feat: add Berztech2.0 ECC bundle (.claude/commands/feature-development.md)
```

*Commit message example*

```text
feat: add Berztech2.0 ECC bundle (.claude/commands/database-migration.md)
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

**Frequency**: ~26 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `tests/__mocks__/components/ui/*`
- `tests/components/client/*`
- `tests/components/features/admin/*`
- `**/*.test.*`
- `**/api/**`

**Example commit sequence**:
```
test: Add comprehensive unit and integration tests for client components, hooks, data utilities, and API endpoints, along with test setup and mocks.
feat: Add comprehensive unit and integration tests for various components and a hook, update testing dependencies, and include new build assets.
nm
```

### Add Or Update Test Suite

Adds or updates a comprehensive suite of tests (unit, integration, E2E, security, accessibility, visual, etc.) for new or existing features/components.

**Frequency**: ~4 times per month

**Steps**:
1. Add or update test files under tests/components/, tests/unit/, tests/integration/, tests/e2e/, tests/security/, tests/property/, tests/contract/, tests/load/
2. Update or create test configuration files (e.g., vitest.config.js, playwright.config.js, stryker.conf.js)
3. Update or create test documentation/tracker files (e.g., tests/TEST-TRACKER.md, tests/GUIDE.md)
4. Optionally update .gitignore or test setup files

**Files typically involved**:
- `tests/components/**/*.test.*`
- `tests/unit/**/*.test.*`
- `tests/integration/**/*.test.*`
- `tests/e2e/**/*.spec.*`
- `tests/security/**/*.test.*`
- `tests/property/**/*.test.*`
- `tests/contract/**/*.test.*`
- `tests/load/**/*.test.*`
- `tests/TEST-TRACKER.md`
- `tests/GUIDE.md`
- `vitest.config.js`
- `playwright.config.js`
- `stryker.conf.js`
- `.gitignore`

**Example commit sequence**:
```
Add or update test files under tests/components/, tests/unit/, tests/integration/, tests/e2e/, tests/security/, tests/property/, tests/contract/, tests/load/
Update or create test configuration files (e.g., vitest.config.js, playwright.config.js, stryker.conf.js)
Update or create test documentation/tracker files (e.g., tests/TEST-TRACKER.md, tests/GUIDE.md)
Optionally update .gitignore or test setup files
```

### Add Feature Development Command

Adds or updates workflow documentation for feature development commands, typically in markdown files under .claude/commands/.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update a markdown file describing the feature development workflow under .claude/commands/
2. Commit the file with a message referencing the feature development command

**Files typically involved**:
- `.claude/commands/feature-development.md`

**Example commit sequence**:
```
Create or update a markdown file describing the feature development workflow under .claude/commands/
Commit the file with a message referencing the feature development command
```

### Add Database Migration Command

Adds or updates workflow documentation for database migration commands, typically in markdown files under .claude/commands/.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update a markdown file describing the database migration workflow under .claude/commands/
2. Commit the file with a message referencing the database migration command

**Files typically involved**:
- `.claude/commands/database-migration.md`

**Example commit sequence**:
```
Create or update a markdown file describing the database migration workflow under .claude/commands/
Commit the file with a message referencing the database migration command
```

### Add Or Update Agent Skill Bundle

Adds or updates agent skill definitions and documentation for Berztech2.0, including SKILL.md and agent configuration files.

**Frequency**: ~3 times per month

**Steps**:
1. Add or update SKILL.md in .agents/skills/Berztech2.0/ and/or .claude/skills/Berztech2.0/
2. Add or update agent configuration files (e.g., openai.yaml, identity.json)
3. Commit the files with a message referencing the ECC bundle

**Files typically involved**:
- `.agents/skills/Berztech2.0/SKILL.md`
- `.claude/skills/Berztech2.0/SKILL.md`
- `.agents/skills/Berztech2.0/agents/openai.yaml`
- `.claude/identity.json`

**Example commit sequence**:
```
Add or update SKILL.md in .agents/skills/Berztech2.0/ and/or .claude/skills/Berztech2.0/
Add or update agent configuration files (e.g., openai.yaml, identity.json)
Commit the files with a message referencing the ECC bundle
```

### Add Or Update Codex Agent

Adds or updates Codex agent configuration files and documentation for Berztech2.0.

**Frequency**: ~3 times per month

**Steps**:
1. Add or update agent configuration files under .codex/agents/ (e.g., docs-researcher.toml, reviewer.toml, explorer.toml)
2. Optionally update .codex/AGENTS.md or .codex/config.toml
3. Commit the files with a message referencing the ECC bundle

**Files typically involved**:
- `.codex/agents/docs-researcher.toml`
- `.codex/agents/reviewer.toml`
- `.codex/agents/explorer.toml`
- `.codex/AGENTS.md`
- `.codex/config.toml`

**Example commit sequence**:
```
Add or update agent configuration files under .codex/agents/ (e.g., docs-researcher.toml, reviewer.toml, explorer.toml)
Optionally update .codex/AGENTS.md or .codex/config.toml
Commit the files with a message referencing the ECC bundle
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
