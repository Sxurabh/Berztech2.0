# Contributing to Berztech 2.0

Thank you for your interest in contributing! Here are some guidelines to help you get started.

## Code Style

- **Design Tokens**: Always use `src/lib/design-tokens.js` for typography, spacing, and standard colors instead of hardcoded Tailwind classes.
- **Components**: Prefer small, functional components. Split large sections (like Hero) into sub-components.
- **Icons**: Use `react-icons/fi` (Feather Icons) for consistency.

## Git Workflow

### 1. Branch Naming
- Use the format: `type/ticket-short-desc`
- Examples: `feature/PROJ-123-add-login`, `fix/PROJ-124-header-alignment`

### 2. Commit Messages
- Use Conventional Commits: `type(scope): subject`
- Example: `feat(auth): implement google oauth login`

### 3. Submitting a Pull Request
- Create a PR from your branch targeting `main`.
- Link the related issue (e.g., "Closes #123").
- Include a description of changes and attach screenshots for UI updates.

### 4. Code Review Process
- Request at least one reviewer.
- Ensure all tests pass and CI is green.
- Expected SLA: 24 hours for initial review.

### 5. Addressing Feedback
- Push updates to the same branch.
- Reply to comments to confirm resolution.
- Squash commits if requested before merging.

## Directory Structure

When adding new components:
- **Global UI**: Add to `src/components/ui`.
- **Page Sections**: Add to `src/components/sections`.
- **Complex Features**: Add to `src/components/features` (e.g., `work`, `blog`).
