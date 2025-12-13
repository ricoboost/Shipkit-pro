#!/usr/bin/env npx tsx
/**
 * Generate Component Script
 * Creates a new component from ShipKit UI templates
 *
 * Usage:
 *   npx tsx .claude/skills/shipkit-ui/scripts/generate-component.ts <template-name> [output-path]
 *
 * Examples:
 *   npx tsx .claude/skills/shipkit-ui/scripts/generate-component.ts hero-centered
 *   npx tsx .claude/skills/shipkit-ui/scripts/generate-component.ts pricing-cards src/components/marketing
 */

import * as fs from 'fs';
import * as path from 'path';

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const DEFAULT_OUTPUT_DIR = 'src/components/generated';

function findTemplate(name: string): string | null {
  const categories = ['landing', 'dashboard', 'forms', 'common'];

  for (const category of categories) {
    const templatePath = path.join(TEMPLATES_DIR, category, `${name}.tsx`);
    if (fs.existsSync(templatePath)) {
      return templatePath;
    }
  }

  return null;
}

function listTemplates(): void {
  console.log('\n📦 Available templates:\n');

  const categories = ['landing', 'dashboard', 'forms', 'common'];

  for (const category of categories) {
    const categoryPath = path.join(TEMPLATES_DIR, category);
    if (fs.existsSync(categoryPath)) {
      const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith('.tsx'));
      if (files.length > 0) {
        console.log(`  ${category}/`);
        files.forEach((file) => {
          console.log(`    - ${file.replace('.tsx', '')}`);
        });
        console.log();
      }
    }
  }
}

function generateComponent(templateName: string, outputDir: string): void {
  const templatePath = findTemplate(templateName);

  if (!templatePath) {
    console.error(`❌ Template "${templateName}" not found.\n`);
    listTemplates();
    process.exit(1);
  }

  // Read template
  const templateContent = fs.readFileSync(templatePath, 'utf-8');

  // Create output directory
  const fullOutputDir = path.resolve(process.cwd(), outputDir);
  if (!fs.existsSync(fullOutputDir)) {
    fs.mkdirSync(fullOutputDir, { recursive: true });
  }

  // Write component
  const outputPath = path.join(fullOutputDir, `${templateName}.tsx`);
  fs.writeFileSync(outputPath, templateContent);

  console.log(`✅ Generated: ${outputPath}`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Import the component in your page`);
  console.log(`   2. Customize the props and content`);
  console.log(`   3. Update the example data as needed\n`);
}

// CLI
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
🎨 ShipKit UI Component Generator

Usage:
  npx tsx generate-component.ts <template-name> [output-dir]

Options:
  --list, -l    List all available templates
  --help, -h    Show this help message

Examples:
  npx tsx generate-component.ts hero-centered
  npx tsx generate-component.ts pricing-cards src/components/pricing
  `);
  listTemplates();
  process.exit(0);
}

if (args[0] === '--list' || args[0] === '-l') {
  listTemplates();
  process.exit(0);
}

const templateName = args[0];
const outputDir = args[1] || DEFAULT_OUTPUT_DIR;

generateComponent(templateName, outputDir);
