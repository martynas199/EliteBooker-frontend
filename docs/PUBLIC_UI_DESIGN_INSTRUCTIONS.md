# Public UI Design Instructions (Mobile-First)

Use this guide for all public-facing pages (`Landing`, `Pricing`, `Signup`, `Search`, `/menu`, shared `Header` and `Footer`) so the experience stays visually consistent.

## 1) Core Principles

- Design for mobile first, then scale up.
- Keep one strong primary action per section.
- Use clear hierarchy: eyebrow -> heading -> supporting text -> action.
- Prefer calm premium styling over loud decorative effects.
- Keep tap targets touch-friendly (`min-h-10` / `40px+`).

## 2) Visual Language

- **Primary palette:** warm neutral surfaces + slate text.
  - Page backgrounds: subtle warm gradients (`#f8f5ef` -> `#f6f2ea`).
  - Primary text: `text-slate-900`.
  - Secondary text: `text-slate-500/600`.
- **Primary CTA style:** slate gradient (`from-slate-900 to-slate-700`) with white text.
- **Secondary CTA style:** white/neutral surface with slate border.
- **Success/accent:** emerald indicators for availability and confirmation states.

## 3) Spacing and Layout

- Section spacing baseline:
  - Mobile: `py-14` to `py-16`
  - Tablet/Desktop: `sm:py-20`, `lg:py-24`
- Containers:
  - Use `max-w-7xl` (or narrower where needed) with `px-4 sm:px-6 lg:px-8`.
- Cards:
  - Rounded corners (`rounded-2xl` / `rounded-3xl`)
  - Soft borders (`border-slate-200`)
  - Light shadows (avoid heavy default shadows unless focused/active)

## 4) Component Patterns

- **Header**
  - Sticky with subtle blur and safe-area support.
  - Rounded controls with consistent 40-44px touch targets.
  - Desktop nav uses lightweight dropdowns with clear hover states.
- **Footer**
  - Dark gradient surface with high-contrast text.
  - Simple grouped link columns.
  - Legal links and copyright in a clean bottom row.
- **Cards (venue/pricing/testimonials/etc.)**
  - Image or summary content first, metadata second.
  - Keep metadata compact (rating, distance, status).
  - Use pill chips for badges and state labels.
- **Filters and chips**
  - Inactive: white/neutral chip.
  - Active: primary gradient chip with white text.

## 5) Interaction and States

- Empty states include:
  - Direct message
  - One recovery action (for example `Reset filters`)
- Loading states:
  - Skeleton cards for content regions
  - Spinner only for full-screen blocking states
- Error states:
  - Neutral card container with clear title and supportive action

## 6) Accessibility and UX Baseline

- Preserve visible focus states on interactive controls.
- Keep body text readable on mobile (`text-sm` minimum for dense UI).
- Avoid purely color-based state communication; pair with icon/label.
- Ensure overlays, modals, and drawers have clear close affordances.

## 7) Implementation Checklist

- [ ] Mobile layout feels complete before desktop refinements.
- [ ] CTA hierarchy is clear and consistent with the design system.
- [ ] Spacing and border radius match existing public pages.
- [ ] Empty/loading/error states are styled and actionable.
- [ ] Build passes (`npm run build`) after UI updates.
