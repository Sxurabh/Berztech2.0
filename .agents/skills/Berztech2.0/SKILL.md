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

Follow these commit message conventions based on 153 analyzed commits.

### Commit Style: Mixed Style

### Prefixes Used

- `feat`

### Message Guidelines

- Average message length: ~46 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: add Berztech2.0 ECC bundle (.claude/commands/test-driven-development.md)
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

### Database Migration

Database schema changes with migration files

**Frequency**: ~2 times per month

**Steps**:
1. Create migration file
2. Update schema definitions
3. Generate/update types

**Files typically involved**:
- `migrations/*`

**Example commit sequence**:
```
chore: clean up root directory and update README
fix: mobile optimize TaskModal grid and footer actions
feat: notifications system, real-time chat optimization, mobile notification access
```

### Feature Development

Standard feature implementation workflow

**Frequency**: ~22 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `src/components/admin/*`
- `src/components/client/*`
- `src/components/features/admin/*`
- `**/*.test.*`
- `**/api/**`

**Example commit sequence**:
```
feat: notifications system, real-time chat optimization, mobile notification access
np
feat: Establish comprehensive testing strategy and foundational infrastructure with Vitest and MSW.
```

### Add Or Update Test Suite

Adds or updates a comprehensive test suite, including unit, integration, E2E, security, and load tests, often with CI configuration and test setup/mocks.

**Frequency**: ~3 times per month

**Steps**:
1. Add or update test configuration files (e.g., vitest.config.js, playwright.config.js, .github/workflows/test.yml)
2. Add or update test setup files and mocks (e.g., tests/setup.ts, tests/mocks/...)
3. Add or update test tracker/guide/strategy docs (e.g., tests/TEST-TRACKER.md, tests/GUIDE.md, tests/TESTING_STRATEGY.md)
4. Add or update various test files (unit, integration, E2E, security, load, property, contract) under tests/
5. Update package.json and package-lock.json for dependencies

**Files typically involved**:
- `vitest.config.js`
- `playwright.config.js`
- `.github/workflows/test.yml`
- `tests/setup.ts`
- `tests/TEST-TRACKER.md`
- `tests/GUIDE.md`
- `tests/TESTING_STRATEGY.md`
- `tests/__mocks__/*`
- `tests/mocks/*`
- `tests/components/**/*`
- `tests/integration/**/*`
- `tests/e2e/**/*`
- `tests/security/**/*`
- `tests/load/**/*`
- `tests/property/**/*`
- `tests/contract/**/*`
- `package.json`
- `package-lock.json`

**Example commit sequence**:
```
Add or update test configuration files (e.g., vitest.config.js, playwright.config.js, .github/workflows/test.yml)
Add or update test setup files and mocks (e.g., tests/setup.ts, tests/mocks/...)
Add or update test tracker/guide/strategy docs (e.g., tests/TEST-TRACKER.md, tests/GUIDE.md, tests/TESTING_STRATEGY.md)
Add or update various test files (unit, integration, E2E, security, load, property, contract) under tests/
Update package.json and package-lock.json for dependencies
```

### Add Or Update Ui Component With Tests

Adds or updates UI components and immediately provides corresponding unit/component tests for them.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update UI component file(s) in src/components/...
2. Create or update corresponding test file(s) in tests/components/...
3. Optionally update test configuration or mocks if needed
4. Optionally update documentation or test tracker

**Files typically involved**:
- `src/components/**/*.jsx`
- `tests/components/**/*.test.jsx`
- `vitest.config.js`
- `tests/TEST-TRACKER.md`

**Example commit sequence**:
```
Create or update UI component file(s) in src/components/...
Create or update corresponding test file(s) in tests/components/...
Optionally update test configuration or mocks if needed
Optionally update documentation or test tracker
```

### Add Or Update Api Endpoint With Integration Tests

Adds or updates API endpoint files and provides integration tests to validate their behavior.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update API route file(s) in src/app/api/...
2. Create or update corresponding integration test file(s) in tests/integration/api/...
3. Optionally update test tracker or documentation

**Files typically involved**:
- `src/app/api/**/*.js`
- `tests/integration/api/**/*.test.ts`
- `tests/integration/api/**/*.test.js`
- `tests/TEST-TRACKER.md`

**Example commit sequence**:
```
Create or update API route file(s) in src/app/api/...
Create or update corresponding integration test file(s) in tests/integration/api/...
Optionally update test tracker or documentation
```

### Add Or Update Security Tests

Adds or updates security-related integration tests to validate protection against vulnerabilities (e.g., XSS, CSRF, rate limiting, SQL injection).

**Frequency**: ~2 times per month

**Steps**:
1. Create or update security test files in tests/security/...
2. Optionally update test tracker or documentation
3. Optionally update .gitignore or secrets audit files

**Files typically involved**:
- `tests/security/**/*.test.ts`
- `tests/security/**/*.test.js`
- `tests/TEST-TRACKER.md`
- `.gitignore`

**Example commit sequence**:
```
Create or update security test files in tests/security/...
Optionally update test tracker or documentation
Optionally update .gitignore or secrets audit files
```

### Add Or Update Project Documentation

Adds or updates project documentation, guides, or strategy files, often in conjunction with new features or test suites.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update documentation files (e.g., README.md, DESIGN_SYSTEM.md, tests/GUIDE.md, tests/TESTING_STRATEGY.md, AGENTS.md, CLAUDE.md)
2. Optionally update test tracker or prompts

**Files typically involved**:
- `README.md`
- `DESIGN_SYSTEM.md`
- `tests/GUIDE.md`
- `tests/TESTING_STRATEGY.md`
- `tests/PROMPTS.md`
- `AGENTS.md`
- `CLAUDE.md`

**Example commit sequence**:
```
Create or update documentation files (e.g., README.md, DESIGN_SYSTEM.md, tests/GUIDE.md, tests/TESTING_STRATEGY.md, AGENTS.md, CLAUDE.md)
Optionally update test tracker or prompts
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
