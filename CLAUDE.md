# ShipKit - AI Agent Development Guide

This document provides instructions for AI agents (Claude, GPT, etc.) working on the ShipKit codebase.

## Project Overview

ShipKit is a Next.js 16 SaaS boilerplate with:
- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Prisma ORM
- **Auth**: NextAuth.js
- **Payments**: Stripe/LemonSqueezy/Polar
- **AI**: OpenRouter + Vercel AI SDK
- **i18n**: next-intl (7 languages)

## Internationalization (i18n)

### Supported Locales

| Code | Language | Flag |
|------|----------|------|
| `en` | English | 🇺🇸 |
| `es` | Español | 🇪🇸 |
| `fr` | Français | 🇫🇷 |
| `de` | Deutsch | 🇩🇪 |
| `pt` | Português | 🇧🇷 |
| `ja` | 日本語 | 🇯🇵 |
| `zh` | 中文 | 🇨🇳 |

### File Locations

```
src/i18n/
├── config.ts          # Locale definitions
├── routing.ts         # Routing configuration
├── request.ts         # Server-side request config
├── navigation.ts      # Navigation utilities
└── messages/          # Translation files
    ├── en.json
    ├── es.json
    ├── fr.json
    ├── de.json
    ├── pt.json
    ├── ja.json
    └── zh.json
```

### Translation Key Structure

Translation files follow a nested structure organized by feature/page:

```json
{
  "common": { /* Shared UI elements */ },
  "auth": { /* Authentication pages */ },
  "nav": { /* Navigation */ },
  "landing": { /* Landing page */ },
  "dashboard": { /* Dashboard page */ },
  "settings": { /* Settings pages */ },
  "sidebar": { /* App sidebar */ },
  "admin": { /* Admin section */ },
  "errors": { /* Error messages */ },
  "footer": { /* Footer */ }
}
```

---

## CRITICAL: i18n Rules for Development

### Rule 1: NEVER Use Hardcoded Strings

❌ **WRONG:**
```tsx
<h1>Welcome to Dashboard</h1>
<Button>Save Changes</Button>
```

✅ **CORRECT:**
```tsx
<h1>{t('title')}</h1>
<Button>{t('saveChanges')}</Button>
```

### Rule 2: Client Components - Use `useTranslations`

For `'use client'` components:

```tsx
'use client';

import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('dashboard');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### Rule 3: Server Components - Use `getTranslations`

For async server components:

```tsx
import { getTranslations } from 'next-intl/server';

export default async function MyPage() {
  const t = await getTranslations('dashboard');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### Rule 4: Dynamic Values with Interpolation

Use curly braces `{variable}` for dynamic content:

```tsx
// Translation file
{
  "welcome": "Hello, {name}!",
  "itemCount": "{count} items selected"
}

// Component
t('welcome', { name: user.name })
t('itemCount', { count: 5 })
```

### Rule 5: Nested Keys for Organization

```tsx
// Translation file
{
  "settings": {
    "profile": {
      "title": "Profile",
      "description": "Manage your profile"
    }
  }
}

// Component - use dot notation or nested namespace
const t = useTranslations('settings.profile');
t('title') // "Profile"

// Or access parent namespace
const t = useTranslations('settings');
t('profile.title') // "Profile"
```

---

## Creating New Pages/Features

### Step-by-Step Workflow

#### 1. Create the Component with Translation Keys

```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function NewFeaturePage() {
  const t = useTranslations('newFeature');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <button>{t('actions.submit')}</button>
    </div>
  );
}
```

#### 2. Add English Translations First

Edit `src/i18n/messages/en.json`:

```json
{
  "newFeature": {
    "title": "New Feature",
    "description": "This is a new feature",
    "actions": {
      "submit": "Submit",
      "cancel": "Cancel"
    }
  }
}
```

#### 3. Add Translations to ALL Other Locales

You MUST add translations to all 6 other locale files:
- `es.json` (Spanish)
- `fr.json` (French)
- `de.json` (German)
- `pt.json` (Portuguese)
- `ja.json` (Japanese)
- `zh.json` (Chinese)

Example for Spanish (`es.json`):
```json
{
  "newFeature": {
    "title": "Nueva Función",
    "description": "Esta es una nueva función",
    "actions": {
      "submit": "Enviar",
      "cancel": "Cancelar"
    }
  }
}
```

#### 4. Verify Build

Always run `npm run build` after adding translations to catch any JSON syntax errors.

---

## Common Patterns

### Pattern 1: Page with Title and Description

```tsx
export default async function SettingsPage() {
  const t = await getTranslations('settings');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>
    </div>
  );
}
```

### Pattern 2: Data Tables with Translated Headers

```tsx
const t = useTranslations('users');

const columns = [
  { header: t('columns.name'), accessorKey: 'name' },
  { header: t('columns.email'), accessorKey: 'email' },
  { header: t('columns.status'), accessorKey: 'status' },
];
```

### Pattern 3: Form Labels and Placeholders

```tsx
const t = useTranslations('profile');

<div>
  <Label>{t('fullName')}</Label>
  <Input placeholder={t('namePlaceholder')} />
</div>
```

### Pattern 4: Toast Messages

```tsx
const t = useTranslations('settings.profile');

try {
  await saveProfile();
  toast.success(t('updateSuccess'));
} catch {
  toast.error(t('updateError'));
}
```

### Pattern 5: Sidebar/Navigation Items

Use translation keys in data structures:

```tsx
const navItems = [
  { labelKey: 'dashboard', href: '/dashboard' },
  { labelKey: 'settings', href: '/settings' },
];

// Render
{navItems.map(item => (
  <Link href={item.href}>{t(`items.${item.labelKey}`)}</Link>
))}
```

### Pattern 6: Status Badges

```tsx
const t = useTranslations('subscriptions');

<Badge>{t(`status.${subscription.status}`)}</Badge>

// Translation file
{
  "status": {
    "active": "Active",
    "canceled": "Canceled",
    "past_due": "Past Due"
  }
}
```

---

## JSON Syntax Rules

### Escaping Quotes

Use backslash to escape quotes inside strings:

```json
{
  "message": "Click \"Save\" to continue"
}
```

### Chinese Locale Special Case

For Chinese (`zh.json`), use corner brackets `「」` instead of regular quotes to avoid JSON parsing issues:

```json
{
  "deleteConfirm": "您确定要删除「{name}」吗？"
}
```

### Trailing Commas

JSON does NOT allow trailing commas:

❌ **WRONG:**
```json
{
  "key1": "value1",
  "key2": "value2",  // <-- trailing comma causes error
}
```

✅ **CORRECT:**
```json
{
  "key1": "value1",
  "key2": "value2"
}
```

---

## Checklist for New Features

When creating any new page or component with UI text:

- [ ] Use `useTranslations` (client) or `getTranslations` (server)
- [ ] Define a clear namespace (e.g., `newFeature`, `settings.profile`)
- [ ] Add all translation keys to `en.json`
- [ ] Add translations to `es.json`
- [ ] Add translations to `fr.json`
- [ ] Add translations to `de.json`
- [ ] Add translations to `pt.json`
- [ ] Add translations to `ja.json`
- [ ] Add translations to `zh.json`
- [ ] Run `npm run build` to verify no JSON errors
- [ ] Test language switching in browser

---

## Project Structure Reference

```
src/
├── app/
│   └── [locale]/           # All pages under locale prefix
│       ├── (dashboard)/    # Dashboard layout group
│       │   ├── dashboard/
│       │   └── settings/
│       ├── (admin)/        # Admin layout group
│       │   └── admin/
│       └── layout.tsx
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Layout components (sidebar, header)
│   └── admin/              # Admin-specific components
├── i18n/
│   ├── config.ts           # Locales configuration
│   ├── messages/           # Translation JSON files
│   └── routing.ts          # next-intl routing
└── lib/                    # Utilities and helpers
```

---

## Quick Reference

| Task | Import | Usage |
|------|--------|-------|
| Client component | `import { useTranslations } from 'next-intl'` | `const t = useTranslations('namespace')` |
| Server component | `import { getTranslations } from 'next-intl/server'` | `const t = await getTranslations('namespace')` |
| With variables | - | `t('key', { name: value })` |
| Nested key | - | `t('parent.child.key')` |

---

## Important Files

- **i18n Config**: `src/i18n/config.ts`
- **English Translations**: `src/i18n/messages/en.json`
- **App Sidebar**: `src/components/layout/sidebar.tsx`
- **Admin Sidebar**: `src/components/admin/admin-sidebar.tsx`
- **Dashboard Layout**: `src/app/[locale]/(dashboard)/layout.tsx`
- **Admin Layout**: `src/app/[locale]/(admin)/layout.tsx`
