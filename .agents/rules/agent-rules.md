---
trigger: always_on
---

# Antigravity Agent Rules — Berztech 2.0

## Purpose
These rules govern every action this agent takes on the Berztech 2.0 codebase.
The goal is to align all changes with the existing design, keep the site fully responsive, and never introduce visual inconsistency.

---

## RULE 0 — Read First, Code Second

**Before writing any code, creating any file, or editing any component, the agent MUST read `DESIGN_SYSTEM.md` in full.**

Do not rely on memory of past sessions. Treat `DESIGN_SYSTEM.md` as the ground truth for every decision.

```
DESIGN_SYSTEM.md is located at the root of the project repository.
Read it before every task. No exceptions.
```

---

## RULE 1 — Token Compliance

- **Always** import and use design tokens from `src/lib/design-tokens.js`.
- **Never** hardcode raw color values, font names, or spacing numbers when a token exists.
- Service color assignments are fixed: blue=Web Dev, emerald=Growth, purple=Mobile, rose=Branding. Never reassign.

```js
// ✅ Correct
import { serviceColors, typography, spacing } from "@/lib/design-tokens";
className={serviceColors.blue.text}

// ❌ Wrong
className="text-blue-600"  // when used for service color
```

---

## RULE 2 — Responsive Mobile-First

Every change must work perfectly at all breakpoints: `375px → 640px → 768px → 1024px → 1280px+`.

**Checklist before submitting any UI change:**
- [ ] Tested at 375px (iPhone SE) — no horizontal overflow, no clipped text
- [ ] Tested at 768px (tablet) — layout transitions smoothly
- [ ] Tested at 1280px (desktop) — full experience works
- [ ] Touch targets on mobile are at minimum `44x44px`
- [ ] No hardcoded pixel widths on containers
- [ ] Blog/project grids progress `1 → 2 → 3` cols, never `1 → 3`
- [ ] Complex visuals (HeroVisuals, 3D elements) are `hidden lg:flex` on mobile

---

## RULE 3 — Component Placement

When creating new components, place them in the correct folder:

| New component type | Correct location |
|---|---|
| Reusable UI primitive (button, badge, card wrapper) | `src/components/ui/` |
| Global layout element (header, footer variations) | `src/components/layout/` |
| Home page section | `src/components/sections/` |
| Feature tied to a specific page | `src/components/features/{page}/` |

**Never** create components directly inside `src/app/` page files unless it's a trivial one-liner.

---

## RULE 4 — CornerFrame is Required for Cards

Any new card, panel, or bordered container must use the `<CornerFrame>` component.
Do not build card UIs using plain `<div>` with `border` + `rounded` classes — this breaks visual consistency.

```jsx
// ✅ Correct
import { CornerFrame } from "@/components/ui/CornerFrame";
<CornerFrame className="bg-white border border-neutral-200 p-4" bracketClassName="w-3 h-3 border-neutral-300">

// ❌ Wrong
<div className="border border-neutral-200 rounded-lg p-4">
```

---

## RULE 5 — Icon Library Lock

**Only** `react-icons/fi` (Feather Icons) may be used. Do not install or import from any other icon library.

```jsx
// ✅ Correct
import { FiCode, FiArrowRight } from "react-icons/fi";

// ❌ Wrong
import { Code } from "lucide-react";
import ArrowRight from "@heroicons/react/24/solid";
```

---

## RULE 6 — Animation Rules

1. Always implement `prefers-reduced-motion` detection for any Framer Motion animation.
2. Disable or simplify animations on coarse-pointer (touch/mobile) devices for performance.
3. Use `duration: 0.3` for UI interactions, `duration: 0.5` for entrance animations.
4. Do not create CSS `@keyframes` alternatives to Framer Motion for interactive elements.
5. Always use `next/image` — never `<img>` tags.

---

## RULE 7 — Accessibility is Non-Negotiable

Every change must maintain or improve accessibility:

- Interactive elements: must have `:focus-visible` outline styles
- Icon-only buttons: must have `aria-label`
- Form inputs: must have `<label>` or `aria-labelledby`
- Navigation links: must have `aria-label`
- Mobile menu toggle: must have `aria-expanded` + `aria-controls`
- Images: must have descriptive `alt` (empty `alt=""` for decorative-only)
- Keyboard navigation: Enter/Space must activate all interactive elements

**If a fix breaks accessibility, it is not a fix.**

---

## RULE 8 — Data Sources

Never hardcode content that lives in config/data files:

| Data type | Source file |
|---|---|
| Company stats (50+ projects, 98% retention, etc.) | `src/config/stats.js` |
| Service descriptions & prices | `src/data/marketing.js` |
| Navigation links | `src/data/navigation.js` |
| Project list | `src/data/projects.js` |
| Color schemes | `src/config/colors.js` |

---

## RULE 9 — Whitelist of What Can Be Changed

The agent may freely make improvements to:
- Accessibility attributes (ARIA, focus styles, labels)
- Responsive breakpoints and mobile layout fixes
- Animation compliance (`prefers-reduced-motion`, coarse pointer)
- Bug fixes documented in `DESIGN_SYSTEM.md §16`
- Performance optimizations (lazy loading, `next/image` sizes, code splitting)
- SEO metadata (`generateMetadata`, Open Graph tags)
- Form validation and loading/error states
- New page sections that follow the existing design language

---

## RULE 10 — Locked — Do Not Change

The agent must NEVER change these without explicit human approval:

| What | Why |
|---|---|
| Font pair (Space Grotesk + JetBrains Mono) | Core brand identity |
| White base background | Not a dark-mode site |
| Service → color mapping | Brand consistency |
| `max-w-5xl` container width | Layout proportion |
| CornerFrame bracket aesthetic | Signature visual |
| Feather Icons (`fi`) only | Icon consistency |
| Framer Motion as animation library | Already deeply integrated |
| Overall page structure and section order | Information architecture is set |

---

## RULE 11 — Before Submitting Changes

Run through this checklist for every task:

```
Pre-submit Checklist
====================
□ Read DESIGN_SYSTEM.md before starting
□ Used design tokens (not hardcoded classes) for colors/fonts/spacing
□ New cards use <CornerFrame>
□ Icons are from react-icons/fi only
□ Mobile layout tested at 375px — no overflow
□ Tablet layout tested at 768px — transitions smoothly
□ All interactive elements have focus-visible styles
□ Animations respect prefers-reduced-motion
□ Images use next/image with alt text
□ No hardcoded stat numbers — sourced from config/stats.js
□ Component placed in correct folder
□ No new icon libraries or font packages introduced
```

---

## Quick Reference

```
Design tokens   → src/lib/design-tokens.js
Config          → src/config/{colors,layout,stats}.js
Static data     → src/data/{marketing,navigation,projects}.js
UI primitives   → src/components/ui/
Sections        → src/components/sections/
Features        → src/components/features/
```

*These rules are enforced for every task. When in doubt, re-read `DESIGN_SYSTEM.md`.*