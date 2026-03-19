---
name: berztech2-0-conventions
description: Development conventions and patterns for Berztech2.0. JavaScript Next.js project with freeform commits.
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

Follow these commit message conventions based on 128 analyzed commits.

### Commit Style: Free-form Messages

### Prefixes Used

- `feat`
- `test`

### Message Guidelines

- Average message length: ~42 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: Add comprehensive E2E, accessibility, visual, and unit tests across various application areas.
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
Remove opencode.json from tracking
```

*Commit message example*

```text
Added cases
```

*Commit message example*

```text
Added Phase 1 tests
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

**Frequency**: ~3 times per month

**Steps**:
1. Create migration file
2. Update schema definitions
3. Generate/update types

**Example commit sequence**:
```
Major
Security bugs
feat: Implement comprehensive admin panel, public blog and work pages, API routes, and core UI components.
```

### Feature Development

Standard feature implementation workflow

**Frequency**: ~10 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `src/components/features/blog/*`
- `src/components/features/contact/*`
- `src/components/features/work/*`
- `**/*.test.*`
- `**/api/**`

**Example commit sequence**:
```
feat: add initial website structure and content, including layout components, sections, features, and assets.
Major
Security bugs
```

### Test Driven Development

Test-first development workflow (TDD)

**Frequency**: ~4 times per month

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

### Add Or Update Component With Tests

Adds or updates one or more React components (often in src/components), and simultaneously creates or updates corresponding unit/component test files (in tests/components or tests/unit).

**Frequency**: ~4 times per month

**Steps**:
1. Create or update a component file in src/components/...
2. Create or update a corresponding test file in tests/components/... or tests/unit/...
3. Optionally update shared hooks or utilities if needed
4. Commit both the implementation and test(s) together

**Files typically involved**:
- `src/components/**/*.jsx`
- `tests/components/**/*.test.jsx`
- `tests/unit/**/*.test.{js,ts,tsx}`

**Example commit sequence**:
```
Create or update a component file in src/components/...
Create or update a corresponding test file in tests/components/... or tests/unit/...
Optionally update shared hooks or utilities if needed
Commit both the implementation and test(s) together
```

### Add Or Expand Api Route With Tests

Adds or updates API route files (usually in src/app/api/...), and creates or updates integration tests for those endpoints.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update an API route file in src/app/api/...
2. Create or update a corresponding integration test in tests/integration/api/...
3. Optionally update related data files or factories
4. Commit both the route and test(s) together

**Files typically involved**:
- `src/app/api/**/*.js`
- `tests/integration/api/**/*.test.{js,ts}`

**Example commit sequence**:
```
Create or update an API route file in src/app/api/...
Create or update a corresponding integration test in tests/integration/api/...
Optionally update related data files or factories
Commit both the route and test(s) together
```

### Comprehensive Test Suite Expansion

Adds or updates a large set of tests across multiple categories (unit, integration, E2E, security, accessibility, visual), sometimes with supporting config or documentation updates.

**Frequency**: ~2 times per month

**Steps**:
1. Add or update multiple test files in tests/unit, tests/components, tests/integration, tests/e2e, tests/security, etc.
2. Update or add test configuration files (e.g., vitest.config.js, playwright.config.js)
3. Optionally update test documentation or trackers (e.g., tests/TEST-TRACKER.md)
4. Commit all related files together

**Files typically involved**:
- `tests/**/*.{test,spec}.{js,ts,tsx,jsx}`
- `tests/TEST-TRACKER.md`
- `tests/GUIDE.md`
- `vitest.config.js`
- `playwright.config.js`

**Example commit sequence**:
```
Add or update multiple test files in tests/unit, tests/components, tests/integration, tests/e2e, tests/security, etc.
Update or add test configuration files (e.g., vitest.config.js, playwright.config.js)
Optionally update test documentation or trackers (e.g., tests/TEST-TRACKER.md)
Commit all related files together
```

### Security Test Addition

Adds new security-focused tests (e.g., XSS, SQL injection, auth, rate limiting) in tests/security, often grouped together in a commit.

**Frequency**: ~2 times per month

**Steps**:
1. Create new test files in tests/security/...
2. Optionally update tests/TEST-TRACKER.md or related documentation
3. Commit security tests together

**Files typically involved**:
- `tests/security/**/*.test.{js,ts}`
- `tests/TEST-TRACKER.md`

**Example commit sequence**:
```
Create new test files in tests/security/...
Optionally update tests/TEST-TRACKER.md or related documentation
Commit security tests together
```

### Add Feature Hook With Tests

Implements a new React hook (in src/lib/hooks) for a feature (e.g., notifications, project stats, comments), and adds corresponding unit tests.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update a hook in src/lib/hooks/...
2. Create or update a corresponding test file in tests/unit/lib/hooks/...
3. Optionally update related components to use the new hook
4. Commit hook and test(s) together

**Files typically involved**:
- `src/lib/hooks/**/*.js`
- `tests/unit/lib/hooks/**/*.test.{js,ts,tsx}`

**Example commit sequence**:
```
Create or update a hook in src/lib/hooks/...
Create or update a corresponding test file in tests/unit/lib/hooks/...
Optionally update related components to use the new hook
Commit hook and test(s) together
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
