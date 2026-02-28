# Berztech 2.0 — Design System Reference
> **For AI Agents**: Read this document **in full** before making any UI/component change. Every decision must align with these guidelines. Do not deviate from the core aesthetic, spacing, or token system described here.

---

## 1. Project Identity

| Property | Value |
|---|---|
| **Project** | Berztech 2.0 |
| **Framework** | Next.js 16 (App Router) |
| **Styling** | Tailwind CSS 3.3 |
| **Animation** | Framer Motion 12 |
| **Icons** | React Icons — Feather set (`react-icons/fi`) only |
| **Design Language** | Technical · Minimal · Precision-first |
| **Brand Tone** | Engineering excellence, boutique quality, no fluff |

---

## 2. Typography

### Fonts (NEVER change or substitute these)
```
Headings / UI labels : Space Grotesk  → CSS var: --font-sans → Tailwind: font-space-grotesk / font-sans
Body / Code / Mono   : JetBrains Mono → CSS var: --font-mono → Tailwind: font-jetbrains-mono / font-mono
```
Loaded via `next/font/google` in `src/app/layout.jsx`. Both use `display: "swap"` and `subsets: ["latin"]`.

### Usage Rules
- **Headings** (h1–h3): `font-space-grotesk font-semibold` or `font-bold`
- **Body copy**: `font-space-grotesk font-normal` or `font-medium`
- **Labels, tags, metadata, code snippets**: `font-jetbrains-mono` — always uppercase with `tracking-widest` for badges/labels
- **Micro-labels / eyebrow text**: `text-[9px]` to `text-xs` in `font-jetbrains-mono uppercase tracking-widest`

### Font Size Scale (from design-tokens.js)
```
tiny  → text-[9px]    (badges, micro-labels)
xs    → text-xs       (metadata, timestamps)
sm    → text-sm       (secondary text)
base  → text-base     (body)
lg    → text-lg
xl    → text-xl
2xl   → text-2xl
3xl   → text-3xl
4xl   → text-4xl      (section headings mobile)
5xl   → text-5xl
6xl   → text-6xl      (hero headings tablet)
7xl   → text-7xl      (hero headings desktop)
```

---

## 3. Color System

### Base Palette
The site uses Tailwind's neutral scale as its foundation. The background is **white** (`bg-white`), not dark. Text is primarily `text-neutral-900` with secondary shades of `text-neutral-600` and `text-neutral-500`.

```
Background      : bg-white
Primary text    : text-neutral-900
Secondary text  : text-neutral-600
Tertiary/meta   : text-neutral-500
Borders         : border-neutral-200  (default), border-neutral-300 (stronger)
Subtle bg       : bg-neutral-50, bg-neutral-100
Grid/Code bg    : bg-neutral-950 (dark code blocks only)
```

### Service Color Identities (from `src/lib/design-tokens.js`)
Each service has a fixed color identity. **Do not mix or reassign these.**

| Service | Color Token | Classes |
|---|---|---|
| Web Development | `blue` | `text-blue-600`, `bg-blue-50`, `border-blue-200` |
| Growth & Marketing | `emerald` | `text-emerald-600`, `bg-emerald-50`, `border-emerald-200` |
| Mobile Apps | `purple` | `text-purple-600`, `bg-purple-50`, `border-purple-200` |
| Branding & Design | `rose` | `text-rose-600`, `bg-rose-50`, `border-rose-200` |

Additional available colors (for projects/blog): `indigo`, `amber`, `cyan`

### Color Token Structure (per color)
```js
// Example for "blue"
{
  bg:          "bg-blue-500",
  bgHover:     "group-hover:bg-blue-50",
  bgLight:     "bg-blue-50",
  text:        "text-blue-600",
  textHover:   "group-hover:text-blue-700",
  border:      "border-blue-200",
  borderHover: "group-hover:border-blue-500/20",
  glow:        "shadow-blue-500/20",
  bracket:     "!border-blue-400",
}
```
Always import from `@/lib/design-tokens` — **never hardcode raw color classes** when a token exists.

---

## 4. Spacing & Layout

### Container System
```
Max width  : max-w-5xl mx-auto
Padding    : px-4 sm:px-6 lg:px-8
Full token : "w-full mx-auto max-w-5xl px-4 sm:px-6 lg:px-8"
```
Use the `<Container>` component (`src/components/ui/Container.jsx`) whenever possible.

### Section Padding
```
Standard  : py-12 sm:py-16 lg:py-20
Compact   : py-6 sm:py-8 lg:py-12
```

### Grid Gaps
```
Default : gap-4 sm:gap-6 lg:gap-8
Small   : gap-2 sm:gap-4
```

### Grid System
- Use CSS Grid via Tailwind: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12`
- Hero: `grid-cols-1 lg:grid-cols-12` — content spans 7 cols, visual spans 5 cols
- Never use fixed pixel widths; always use relative/responsive classes

---

## 5. The CornerFrame Component

This is the **signature UI primitive** of the entire site. It wraps content cards with subtle corner brackets that give the technical, precision aesthetic. It must be used consistently across all card-like elements.

```jsx
import { CornerFrame } from "@/components/ui/CornerFrame";

<CornerFrame
  className="bg-white border border-neutral-200 p-4 lg:p-5"
  bracketClassName="w-3 h-3 border-neutral-300"
>
  {/* card content */}
</CornerFrame>
```

### Bracket Size Guide
```
sm : "w-3 h-3 border-neutral-300"  ← for tight/dense cards
md : "w-4 h-4 border-neutral-300"  ← default
lg : "w-5 h-5 border-neutral-300"  ← for large hero-level frames
```

**Rule**: Every card, panel, or callout that has a bordered container should use `CornerFrame`. Do not create plain `div` boxes as replacements.

---

## 6. Component Architecture

```
src/components/
├── ui/           ← Primitive reusables (Button, CornerFrame, Container, Modal, etc.)
├── layout/       ← Global shell (Header, Footer, PageTransition, RootLayout)
├── sections/     ← Home page sections (Hero, Services, BentoGrid, etc.)
└── features/     ← Page-scoped features (blog/, work/, contact/)
```

### Placement Rules
- New **global UI primitives** → `src/components/ui/`
- New **page sections** → `src/components/sections/`
- New **complex page features** → `src/components/features/{page}/`
- **Never** create components directly inside `src/app/` page files beyond trivial layouts

### Existing Key Components (do not duplicate)
| Component | Path | Purpose |
|---|---|---|
| `CornerFrame` | `ui/CornerFrame.jsx` | Card wrapper with bracket corners |
| `Button` | `ui/Button.jsx` | Styled CTA button |
| `Container` | `ui/Container.jsx` | Max-width layout wrapper |
| `PageHeader` | `ui/PageHeader.jsx` | Consistent page hero headers |
| `GridBackground` | `ui/GridBackground.jsx` | Subtle grid overlay |
| `Modal` | `ui/Modal.jsx` | Dialog/overlay |
| `AnimatedCounter` | `ui/AnimatedCounter.jsx` | Number count-up |
| `Header` | `layout/Header.jsx` | Global nav |
| `Footer` | `layout/Footer.jsx` | Global footer |
| `PageTransition` | `layout/PageTransition.jsx` | Route animation wrapper |

---

## 7. Animation System

**Library**: Framer Motion — always import from `"framer-motion"`.

### Standard Animation Patterns
```jsx
// Fade + slide up (most common)
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}

// Staggered children
transition={{ duration: 0.5, delay: index * 0.1 }}

// Fast interaction feedback (hover/click)
transition={{ duration: 0.15 }}
```

### Mandatory Rules
1. **Always** respect `prefers-reduced-motion`. Use the pattern:
   ```js
   const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
   useEffect(() => {
     const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
     const update = () => setShouldReduceMotion(mq.matches);
     update();
     mq.addEventListener("change", update);
     return () => mq.removeEventListener("change", update);
   }, []);
   // Then: transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
   ```
2. **Never** animate on coarse-pointer (mobile) devices for performance. Detect via `window.matchMedia("(pointer: coarse)")`.
3. Use `useInView` from Framer Motion for scroll-triggered animations.
4. Parallax scrolling (Hero): use `useScroll` + `useTransform` + `useSpring`.

### Tailwind Transitions (for non-motion elements)
```
Default  : transition-all duration-300 ease-in-out
Fast     : transition-all duration-150 ease-in-out  (hover states)
Slow     : transition-all duration-500 ease-in-out
```

---

## 8. Responsive Design Rules

### Breakpoints
Tailwind defaults apply:
```
sm  : 640px   (large phones / small tablets)
md  : 768px   (tablets)
lg  : 1024px  (desktops)
xl  : 1280px  (large desktops)
```

### Mobile-First Mandatory Rules
1. **Always** design mobile-first — base classes are for mobile, responsive variants layer up
2. Touch targets: minimum `44x44px` on all interactive elements (buttons, links, toggles)
3. HeroVisuals (3D/complex): `hidden lg:flex` — completely hidden on mobile to prevent lag
4. MobileServiceCards: `md:hidden` — shown only on mobile as simpler alternative to complex desktop visuals
5. Blog grid: must progress `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` — never jump 1→3
6. Navigation: hamburger menu on mobile (`md:hidden`), full nav on desktop (`hidden md:flex`)
7. `font-size` on mobile: never less than `text-xs` (12px) for readable content
8. Images: always use `next/image` with explicit `width`, `height` or `fill` + `sizes` — never `<img>` tags

### Key Responsive Patterns Used in Project
```jsx
// Section padding
className="py-12 sm:py-16 lg:py-20"

// Heading sizes
className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl"

// Content containers
className="w-full mx-auto max-w-5xl px-4 sm:px-6 lg:px-8"

// Grid columns
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
```

---

## 9. Icons

**Library**: `react-icons/fi` (Feather Icons) — **this is the only icon set used on this project**. Do not introduce Heroicons, Lucide, Material Icons, or any other library.

```jsx
import { FiCode, FiTrendingUp, FiSmartphone, FiPenTool } from "react-icons/fi";
// Standard size in cards: w-5 h-5
// Standard size in text: w-4 h-4
```

---

## 10. Design Tokens Usage Rules

**Source of truth**: `src/lib/design-tokens.js`

```js
import { serviceColors, typography, spacing, animation } from "@/lib/design-tokens";

// Usage
<h1 className={`${typography.fontFamily.sans} ${typography.fontSize["5xl"]}`}>
<div className={spacing.container.wrapper}>
<div className={animation.transition.default}>
<span className={serviceColors.blue.text}>
```

**Never hardcode** a color, font, or spacing value when a token exists. This ensures consistency across all components.

---

## 11. Data & Config Sources

| What | File |
|---|---|
| Company stats | `src/config/stats.js` → `companyStats`, `homeStats`, `aboutStats` |
| Service categories | `src/data/marketing.js` → `serviceCategories` |
| Color schemes | `src/config/colors.js` → `colorSchemes` |
| Navigation links | `src/data/navigation.js` |
| Footer links & social | `src/data/navigation.js` |
| Layout config | `src/config/layout.js` |

**Rule**: Stats must always come from `src/config/stats.js`. Do not hardcode stat numbers inline in components — this caused inconsistency between pages (e.g., the "29+ projects" vs "50+ projects" bug).

---

## 12. Accessibility Requirements

All changes must maintain or improve WCAG AA compliance:

- All interactive elements must have visible `:focus-visible` ring styles (minimum `outline-2 outline-offset-2`)
- Navigation links require `aria-label` attributes
- Mobile menu toggle requires `aria-expanded` and `aria-controls`
- Icon-only buttons require descriptive `aria-label`
- Form inputs must have associated `<label>` elements or `aria-labelledby`
- Animated counters need `aria-live="polite"` regions
- Images need descriptive `alt` text (empty `alt=""` for purely decorative images)
- Keyboard navigation must work for all interactive elements (Enter/Space on buttons)
- Touch targets: `min-h-[44px] min-w-[44px]` on mobile interactive elements
- Color contrast: ensure `text-neutral-500` on white meets 4.5:1 for body text (use `text-neutral-600` minimum for critical info)

---

## 13. File & Code Conventions

```
Path aliases : @/ maps to src/
Components   : PascalCase filenames (e.g., HeroContent.jsx)
Pages        : lowercase with route name (e.g., page.jsx)
Imports      : Always use @/ aliases, never relative paths across directories
Icons        : Always from react-icons/fi
```

### When splitting large components
Hero pattern — split into sub-components:
```
Hero/
├── index.jsx            ← orchestrator
├── HeroBackground.jsx   ← decorative background
├── HeroContent.jsx      ← text + CTA
├── HeroVisuals.jsx      ← desktop-only complex visual
└── MobileServiceCards.jsx ← mobile alternative
```

---

## 14. Pages & Routes

| Route | Page | Key Sections |
|---|---|---|
| `/` | Home | Hero, TrustBar, Services, BentoGrid, FeaturedCaseStudy, StatsBar, Testimonial, ProcessStrip, AITransparency, ContactCTA |
| `/about` | About | PageHeader, Stats, Team |
| `/work` | Work | WorkHeader, WorkList, ProjectGallery |
| `/work/[slug]` | Project Detail | Dynamic project page |
| `/blog` | Blog | BlogHeader, FeaturedPost, BlogFeed, Newsletter |
| `/blog/[id]` | Blog Post | Dynamic post page |
| `/process` | Process | ProcessClient (interactive phases) |
| `/contact` | Contact | ContactHeader, ContactForm |
| `/admin/*` | Admin | Protected, separate design system (white/neutral) |

---

## 15. What MUST NOT Change

These are the locked design decisions that define the site's identity:

1. **Font pair**: Space Grotesk + JetBrains Mono — no substitutes
2. **CornerFrame** corner bracket aesthetic — the signature visual
3. **White background** base (`bg-white`) — this is not a dark-mode site
4. **Neutral color foundation** — primary palette is neutral-50 through neutral-900
5. **Service color assignments** — blue/emerald/purple/rose are fixed
6. **max-w-5xl container** width — do not widen to 6xl or 7xl
7. **Feather Icons only** — no other icon library
8. **Framer Motion** for all animations — no CSS keyframe alternatives for interactive animations
9. **next/image** for all images — no raw `<img>` tags
10. **Grid-based subtle background** (`GridBackground` component) on hero and key sections

---

## 16. Known Issues to Fix (Priority Order)

When making changes, also resolve these if encountered:

| Priority | Issue | Location |
|---|---|---|
| 🔴 Critical | Blog grid jumps 1→3 cols (add `sm:grid-cols-2`) | `src/app/blog/page.jsx` |
| 🔴 Critical | Duplicate React keys in BentoGrid PlatformIcons | `src/components/sections/BentoGrid.jsx:54` |
| 🟠 High | Missing ARIA labels on nav links | `src/components/layout/Header.jsx` |
| 🟠 High | Mobile menu missing keyboard navigation (Enter/Space) | `src/components/layout/Header.jsx` |
| 🟠 High | Social links in Footer missing `aria-label` | `src/components/layout/Footer.jsx` |
| 🟠 High | Newsletter form input lacks `<label>` | `src/app/blog/page.jsx` |
| 🟠 High | Scroll-to-top button not keyboard accessible | `src/components/layout/Footer.jsx` |
| 🟡 Medium | Team member images causing layout shift (add aspect ratio) | `src/app/about/page.jsx` |
| 🟡 Medium | Stats data must come from `src/config/stats.js` centrally | Multiple pages |
| 🟡 Medium | Animation durations inconsistent (standardize to 0.3/0.5) | Multiple components |

---

*Last updated: February 2026 | Berztech 2.0*
