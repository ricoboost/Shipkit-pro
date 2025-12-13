# ShipKit UI - Frontend Design Skill

Generate production-ready React components following ShipKit Pro design patterns. Uses shadcn/ui, Tailwind CSS, and TypeScript with strict conventions.

## Capabilities

### Landing Page Sections
- **Hero sections**: Centered, split-image, video background, gradient
- **Features**: Grid layout, alternating rows, icon cards, bento grid
- **Pricing**: Card comparison, feature table, single highlight
- **Testimonials**: Grid, carousel, marquee, featured quote
- **FAQ**: Accordion, two-column, categorized
- **CTA**: Simple centered, banner, split, floating

### Dashboard Components
- **Layouts**: Sidebar navigation, top nav, collapsible
- **Widgets**: Stats cards, charts, activity feeds
- **Tables**: Data tables with sorting, filtering, pagination
- **Forms**: Settings, multi-step wizards, file uploads

### Common Components
- Navigation bars, footers, modals, toasts, cards

## Code Standards

All generated code follows these patterns:

```typescript
// 1. TypeScript strict mode - always
// 2. Named exports - never default
// 3. Server components by default - add 'use client' only when needed
// 4. Props interface - always defined above component
// 5. Tailwind CSS - no inline styles
// 6. shadcn/ui primitives - use existing components
// 7. Accessibility - ARIA labels, keyboard navigation
// 8. i18n ready - use translation keys, not hardcoded strings
```

## Usage Examples

### Create a Hero Section
```
"Create a hero section with headline, subheadline, two CTAs, and a product screenshot"
```

### Create a Pricing Page
```
"Generate a pricing section with 3 tiers: Starter ($19), Pro ($49), Enterprise ($99)"
```

### Create a Dashboard Widget
```
"Build a stats card showing total users, revenue, and growth percentage"
```

### Create a Form
```
"Create a settings form with name, email, avatar upload, and timezone selector"
```

## Templates Available

### Landing Page (`templates/landing/`)
| Template | Description |
|----------|-------------|
| `hero-centered.tsx` | Centered headline with CTA buttons |
| `hero-split.tsx` | Text left, image right layout |
| `hero-video.tsx` | Video background with overlay |
| `features-grid.tsx` | 3-column feature grid with icons |
| `features-alternating.tsx` | Alternating image/text rows |
| `pricing-cards.tsx` | Side-by-side pricing cards |
| `pricing-table.tsx` | Feature comparison table |
| `testimonials-grid.tsx` | Grid of testimonial cards |
| `testimonials-carousel.tsx` | Swipeable testimonial carousel |
| `testimonials-marquee.tsx` | Infinite scroll testimonials |
| `faq-accordion.tsx` | Expandable FAQ items |
| `faq-two-column.tsx` | Two-column FAQ layout |
| `cta-simple.tsx` | Centered CTA with headline |
| `cta-banner.tsx` | Full-width banner CTA |

### Dashboard (`templates/dashboard/`)
| Template | Description |
|----------|-------------|
| `sidebar-layout.tsx` | Main dashboard layout with sidebar |
| `stats-cards.tsx` | Row of metric cards |
| `data-table.tsx` | Sortable, filterable data table |
| `chart-widgets.tsx` | Chart components (line, bar, pie) |
| `activity-feed.tsx` | Timeline of recent activities |

### Forms (`templates/forms/`)
| Template | Description |
|----------|-------------|
| `auth-form.tsx` | Login/signup form with validation |
| `settings-form.tsx` | User settings with sections |
| `multi-step-form.tsx` | Wizard-style multi-page form |
| `file-upload.tsx` | Drag-and-drop file uploader |

### Common (`templates/common/`)
| Template | Description |
|----------|-------------|
| `navbar.tsx` | Responsive navigation bar |
| `footer.tsx` | Site footer with links |
| `modal.tsx` | Reusable modal dialog |
| `toast.tsx` | Notification toast component |

## Component Structure

When I generate a component, it follows this structure:

```typescript
/**
 * ComponentName
 * Brief description of what this component does
 */

import { cn } from '@/lib/utils';
// Other imports...

interface ComponentNameProps {
  // Props with JSDoc comments
  /** The main title text */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Additional CSS classes */
  className?: string;
}

export function ComponentName({
  title,
  subtitle,
  className,
}: ComponentNameProps) {
  return (
    <section className={cn('...base styles...', className)}>
      {/* Component content */}
    </section>
  );
}
```

## Design System Tokens

I use these consistent values:

### Spacing
- Section padding: `py-16 md:py-24`
- Container: `container mx-auto px-4`
- Component gaps: `gap-4`, `gap-6`, `gap-8`

### Typography
- Hero headline: `text-4xl md:text-5xl lg:text-6xl font-bold`
- Section title: `text-3xl md:text-4xl font-bold`
- Body large: `text-lg text-muted-foreground`
- Body: `text-base`

### Colors (via CSS variables)
- Primary actions: `bg-primary text-primary-foreground`
- Secondary: `bg-secondary text-secondary-foreground`
- Muted text: `text-muted-foreground`
- Borders: `border-border`
- Cards: `bg-card`

### Animations
- Fade in: `animate-fade-in`
- Slide up: `animate-slide-up`
- Hover scale: `hover:scale-105 transition-transform`

## Integration with ShipKit

Generated components automatically:
1. Use existing shadcn/ui components from `@/components/ui/`
2. Follow the `cn()` utility pattern for className merging
3. Support dark mode via CSS variables
4. Include responsive breakpoints (mobile-first)
5. Add proper TypeScript types

## Scripts

### `generate-component.ts`
Generate a new component from templates:
```bash
npx tsx .claude/skills/shipkit-ui/scripts/generate-component.ts hero-centered
```

### `preview-component.ts`
Generate a live preview of a component:
```bash
npx tsx .claude/skills/shipkit-ui/scripts/preview-component.ts MyComponent.tsx
```

### `validate-component.ts`
Check if a component follows ShipKit patterns:
```bash
npx tsx .claude/skills/shipkit-ui/scripts/validate-component.ts src/components/MyComponent.tsx
```
