# Contributing to Berztech 2.0

Thank you for your interest in contributing! Here are some guidelines to help you get started.

## Code Style

- **Design Tokens**: Always use `src/lib/design-tokens.js` for typography, spacing, and standard colors instead of hardcoded Tailwind classes.
- **Components**: Prefer small, functional components. Split large sections (like Hero) into sub-components.
- **Icons**: Use `react-icons/fi` (Feather Icons) for consistency.

## Git Workflow

1.  Create a new branch for your feature or fix.
2.  Commit your changes with clear, descriptive messages.
3.  Ensure the project builds (`npm run build`) before pushing.

## Directory Structure

When adding new components:
- **Global UI**: Add to `src/components/ui`.
- **Page Sections**: Add to `src/components/sections`.
- **Complex Features**: Add to `src/components/features` (e.g., `work`, `blog`).
