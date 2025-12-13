# Scaffold Page

Create a new page in the ShipKit application with proper i18n support.

## Arguments
- `$ARGUMENTS` - The page name and optional path (e.g., "settings/notifications" or "products")

## Instructions

Create a new page at `src/app/[locale]/(dashboard)/$ARGUMENTS/page.tsx` with:

1. **Server Component** structure with `getTranslations`
2. **i18n Support** - Add translations to ALL locale files
3. **Page Header** with title and description
4. **Proper TypeScript** types

## Template

```tsx
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('PAGE_NAMESPACE');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function PAGE_NAMEPage() {
  const t = await getTranslations('PAGE_NAMESPACE');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      {/* Page content */}
      <div>
        {/* Add your content here */}
      </div>
    </div>
  );
}
```

## Translation Keys

Add to `src/i18n/messages/en.json`:
```json
{
  "PAGE_NAMESPACE": {
    "title": "Page Title",
    "description": "Page description goes here"
  }
}
```

**IMPORTANT**: Add the same keys to ALL locale files:
- es.json (Spanish)
- fr.json (French)
- de.json (German)
- pt.json (Portuguese)
- ja.json (Japanese)
- zh.json (Chinese)

## Checklist
- [ ] Create page file
- [ ] Add English translations
- [ ] Add translations to all 6 other locales
- [ ] Add to sidebar navigation if needed
- [ ] Run `npm run build` to verify
