#!/usr/bin/env tsx
/**
 * Page Generator Script
 *
 * Creates a new page with i18n support and all required translations.
 *
 * Usage: npx tsx scripts/generators/generate-page.ts <page-path>
 * Example: npx tsx scripts/generators/generate-page.ts settings/notifications
 */

import * as fs from 'fs';
import * as path from 'path';

const LOCALES = ['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh'];
const BASE_PATH = process.cwd();

function kebabToPascal(str: string): string {
  return str
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function generatePageContent(pageName: string, namespace: string): string {
  const componentName = kebabToPascal(pageName);

  return `import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('${namespace}');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ${componentName}Page() {
  const t = await getTranslations('${namespace}');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <div className="rounded-lg border p-6">
        {/* Add your page content here */}
        <p className="text-muted-foreground">
          This page was generated using the page generator script.
        </p>
      </div>
    </div>
  );
}
`;
}

function generateTranslations(title: string, locale: string): Record<string, string> {
  const translations: Record<string, Record<string, string>> = {
    en: {
      title: title,
      description: `Manage your ${title.toLowerCase()} settings`,
    },
    es: {
      title: title,
      description: `Administra tu configuraci�n de ${title.toLowerCase()}`,
    },
    fr: {
      title: title,
      description: `G�rez vos param�tres de ${title.toLowerCase()}`,
    },
    de: {
      title: title,
      description: `Verwalten Sie Ihre ${title.toLowerCase()}-Einstellungen`,
    },
    pt: {
      title: title,
      description: `Gerencie suas configura��es de ${title.toLowerCase()}`,
    },
    ja: {
      title: title,
      description: `${title}n-���W~Y`,
    },
    zh: {
      title: title,
      description: `���${title}�n`,
    },
  };

  return translations[locale] || translations.en;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: npx tsx scripts/generators/generate-page.ts <page-path>');
    console.error('Example: npx tsx scripts/generators/generate-page.ts settings/notifications');
    process.exit(1);
  }

  const pagePath = args[0];
  const pathParts = pagePath.split('/');
  const pageName = pathParts[pathParts.length - 1];
  const namespace = pathParts.join('.');
  const title = kebabToPascal(pageName).replace(/([A-Z])/g, ' $1').trim();

  // Create page directory
  const pageDir = path.join(BASE_PATH, 'src/app/[locale]/(dashboard)', pagePath);
  const pageFile = path.join(pageDir, 'page.tsx');

  if (fs.existsSync(pageFile)) {
    console.error(`Error: Page already exists at ${pageFile}`);
    process.exit(1);
  }

  // Create directory
  fs.mkdirSync(pageDir, { recursive: true });

  // Write page file
  const pageContent = generatePageContent(pageName, namespace);
  fs.writeFileSync(pageFile, pageContent);
  console.log(`Created: ${pageFile}`);

  // Update translation files
  for (const locale of LOCALES) {
    const messagesPath = path.join(BASE_PATH, `src/i18n/messages/${locale}.json`);

    if (!fs.existsSync(messagesPath)) {
      console.warn(`Warning: Translation file not found: ${messagesPath}`);
      continue;
    }

    const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf-8'));
    const translations = generateTranslations(title, locale);

    // Navigate to nested path and set translations
    let current = messages;
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    current[pathParts[pathParts.length - 1]] = translations;

    fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2) + '\n');
    console.log(`Updated: ${messagesPath}`);
  }

  console.log('\nPage generated successfully!');
  console.log(`\nNext steps:`);
  console.log(`1. Customize the page content in ${pageFile}`);
  console.log(`2. Update translations in src/i18n/messages/*.json`);
  console.log(`3. Add to sidebar navigation if needed`);
  console.log(`4. Run 'npm run build' to verify`);
}

main().catch(console.error);
