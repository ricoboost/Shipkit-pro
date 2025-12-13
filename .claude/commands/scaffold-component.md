# Scaffold Component

Create a new React component with proper TypeScript types and documentation.

## Arguments
- `$ARGUMENTS` - Component name (e.g., "UserCard" or "ProductList")

## Instructions

Create the component based on whether it needs to be client or server:

### Client Component (interactive)
Create at `src/components/COMPONENT_NAME.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface COMPONENT_NAMEProps {
  // Add your props here
  title: string;
  onAction?: () => void;
}

/**
 * COMPONENT_NAME
 *
 * Brief description of what this component does.
 *
 * @example
 * ```tsx
 * <COMPONENT_NAME title="Hello" onAction={() => console.log('clicked')} />
 * ```
 */
export function COMPONENT_NAME({ title, onAction }: COMPONENT_NAMEProps) {
  const t = useTranslations('namespace');
  const [state, setState] = useState(false);

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{title}</h3>
      {/* Component content */}
    </div>
  );
}
```

### Server Component (data fetching)
Create at `src/components/COMPONENT_NAME.tsx`:

```tsx
import { getTranslations } from 'next-intl/server';

interface COMPONENT_NAMEProps {
  // Add your props here
  userId: string;
}

/**
 * COMPONENT_NAME
 *
 * Brief description of what this component does.
 */
export async function COMPONENT_NAME({ userId }: COMPONENT_NAMEProps) {
  const t = await getTranslations('namespace');

  // Fetch data if needed
  // const data = await db.model.findUnique({ where: { id: userId } });

  return (
    <div className="rounded-lg border p-4">
      {/* Component content */}
    </div>
  );
}
```

## Component Locations

Based on component type, place in the appropriate folder:

- `src/components/ui/` - Base UI components (buttons, inputs)
- `src/components/layout/` - Layout components (sidebar, header)
- `src/components/forms/` - Form components
- `src/components/` - Feature-specific components

## Using shadcn/ui

Import UI primitives from shadcn/ui:

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
```

## Props Pattern

Always define an interface for props:

```tsx
interface Props {
  // Required props (no ?)
  id: string;
  title: string;

  // Optional props (with ?)
  description?: string;
  className?: string;

  // Event handlers
  onClick?: () => void;
  onSubmit?: (data: FormData) => Promise<void>;

  // Children
  children?: React.ReactNode;
}
```

## Checklist
- [ ] Create component file
- [ ] Define TypeScript interface for props
- [ ] Add JSDoc documentation
- [ ] Use appropriate i18n hook (useTranslations or getTranslations)
- [ ] Add to index.ts barrel export if in a folder
- [ ] Consider adding unit tests
