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

Follow these commit message conventions based on 142 analyzed commits.

### Commit Style: Mixed Style

### Prefixes Used

- `feat`

### Message Guidelines

- Average message length: ~44 characters
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
MInor update
sql updated
minor
```

### Feature Development

Standard feature implementation workflow

**Frequency**: ~17 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `src/components/admin/*`
- `src/components/client/*`
- `src/components/ui/*`
- `**/*.test.*`
- `**/api/**`

**Example commit sequence**:
```
feat: Implement comprehensive admin and client task/project management with new pages, components, and API routes, alongside a design system.
feat: Implement client-side task tracking with Kanban board, task cards, and a detailed task modal featuring real-time comments.
Mobile Optimization
```

### Test Driven Development

Test-first development workflow (TDD)

**Frequency**: ~3 times per month

**Steps**:
1. Write failing test
2. Implement code to pass test
3. Refactor if needed

**Files typically involved**:
- `**/*.test.*`
- `**/*.spec.*`
- `src/**/*`

**Example commit sequence**:
```
test: add tests for user validation
feat: implement user validation
```

### Add Or Update Comprehensive Test Suite

Adds or updates a comprehensive suite of tests (unit, integration, E2E, security, accessibility, visual) and related configuration, often alongside new components or features.

**Frequency**: ~3 times per month

**Steps**:
1. Add or update multiple test files under tests/ (unit, integration, e2e, security, visual, etc.)
2. Update or add test configuration files (e.g., vitest.config.js, playwright.config.js)
3. Update or add test setup/mocks (e.g., tests/setup.ts, tests/__mocks__/*)
4. Update test documentation/tracker (e.g., tests/TEST-TRACKER.md, tests/GUIDE.md)
5. Optionally add or update related source files/components

**Files typically involved**:
- `tests/**/*.test.*`
- `tests/e2e/**/*.spec.*`
- `tests/TEST-TRACKER.md`
- `tests/GUIDE.md`
- `tests/setup.ts`
- `tests/__mocks__/*`
- `vitest.config.js`
- `playwright.config.js`
- `playwright-report/index.html`
- `.github/workflows/test.yml`

**Example commit sequence**:
```
Add or update multiple test files under tests/ (unit, integration, e2e, security, visual, etc.)
Update or add test configuration files (e.g., vitest.config.js, playwright.config.js)
Update or add test setup/mocks (e.g., tests/setup.ts, tests/__mocks__/*)
Update test documentation/tracker (e.g., tests/TEST-TRACKER.md, tests/GUIDE.md)
Optionally add or update related source files/components
```

### Add Or Update Ui Component With Tests

Adds new UI components (or updates existing ones) together with corresponding unit/component tests.

**Frequency**: ~2 times per month

**Steps**:
1. Add or update component file(s) in src/components/**/
2. Add or update corresponding test file(s) in tests/components/**/
3. Update test configuration if needed (e.g., vitest.config.js)
4. Optionally update mocks or factories

**Files typically involved**:
- `src/components/**/*.jsx`
- `tests/components/**/*.test.jsx`
- `vitest.config.js`

**Example commit sequence**:
```
Add or update component file(s) in src/components/**/
Add or update corresponding test file(s) in tests/components/**/
Update test configuration if needed (e.g., vitest.config.js)
Optionally update mocks or factories
```

### Add Or Update Api Endpoint With Tests

Adds or updates API route files and their corresponding integration or security tests.

**Frequency**: ~2 times per month

**Steps**:
1. Add or update API route file(s) in src/app/api/**/
2. Add or update integration/security test file(s) in tests/integration/api/**/*.test.* or tests/security/**/*.test.*
3. Update test tracker or documentation if needed

**Files typically involved**:
- `src/app/api/**/*.js`
- `src/app/api/**/*.ts`
- `tests/integration/api/**/*.test.*`
- `tests/security/**/*.test.*`
- `tests/TEST-TRACKER.md`

**Example commit sequence**:
```
Add or update API route file(s) in src/app/api/**/
Add or update integration/security test file(s) in tests/integration/api/**/*.test.* or tests/security/**/*.test.*
Update test tracker or documentation if needed
```

### Add Or Update Supabase Or Database Logic With Tests

Adds or updates Supabase/database logic files and their associated unit or integration tests.

**Frequency**: ~2 times per month

**Steps**:
1. Add or update Supabase/database logic file(s) in src/lib/supabase/**/
2. Add or update corresponding test file(s) in tests/unit/lib/supabase/**/*.test.*
3. Update test configuration if needed

**Files typically involved**:
- `src/lib/supabase/**/*.js`
- `src/lib/supabase/**/*.ts`
- `tests/unit/lib/supabase/**/*.test.*`
- `vitest.config.js`

**Example commit sequence**:
```
Add or update Supabase/database logic file(s) in src/lib/supabase/**/
Add or update corresponding test file(s) in tests/unit/lib/supabase/**/*.test.*
Update test configuration if needed
```

### Add Or Update Test Documentation And Tracker

Updates or adds test documentation and tracking files to reflect new or changed test coverage.

**Frequency**: ~2 times per month

**Steps**:
1. Update or add tests/TEST-TRACKER.md
2. Update or add tests/GUIDE.md, tests/PROMPTS.md, or similar documentation files
3. Optionally update .gitignore or related config

**Files typically involved**:
- `tests/TEST-TRACKER.md`
- `tests/GUIDE.md`
- `tests/PROMPTS.md`

**Example commit sequence**:
```
Update or add tests/TEST-TRACKER.md
Update or add tests/GUIDE.md, tests/PROMPTS.md, or similar documentation files
Optionally update .gitignore or related config
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
