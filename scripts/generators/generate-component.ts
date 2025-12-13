#!/usr/bin/env tsx
/**
 * Component Generator Script
 *
 * Creates a new React component with TypeScript types and documentation.
 *
 * Usage: npx tsx scripts/generators/generate-component.ts <ComponentName> [--client]
 * Example: npx tsx scripts/generators/generate-component.ts UserCard --client
 * Example: npx tsx scripts/generators/generate-component.ts ProductList
 */

import * as fs from 'fs';
import * as path from 'path';

const BASE_PATH = process.cwd();

function generateClientComponent(componentName: string): string {
  return `'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface ${componentName}Props {
  /** Component title */
  title: string;
  /** Optional description */
  description?: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ${componentName}
 *
 * A client-side interactive component.
 *
 * @example
 * \`\`\`tsx
 * <${componentName}
 *   title="Hello"
 *   description="World"
 *   onClick={() => console.log('clicked')}
 * />
 * \`\`\`
 */
export function ${componentName}({
  title,
  description,
  onClick,
  className,
}: ${componentName}Props) {
  const t = useTranslations('components.${componentName.toLowerCase()}');
  const [isActive, setIsActive] = useState(false);

  return (
    <div
      className={\`rounded-lg border p-4 \${className || ''}\`}
      onClick={() => {
        setIsActive(!isActive);
        onClick?.();
      }}
    >
      <h3 className="font-semibold">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
`;
}

function generateServerComponent(componentName: string): string {
  return `import { getTranslations } from 'next-intl/server';

interface ${componentName}Props {
  /** Component title */
  title: string;
  /** Optional description */
  description?: string;
  /** Additional CSS classes */
  className?: string;
  /** Child elements */
  children?: React.ReactNode;
}

/**
 * ${componentName}
 *
 * A server component for rendering static content.
 *
 * @example
 * \`\`\`tsx
 * <${componentName} title="Hello" description="World">
 *   <p>Child content here</p>
 * </${componentName}>
 * \`\`\`
 */
export async function ${componentName}({
  title,
  description,
  className,
  children,
}: ${componentName}Props) {
  const t = await getTranslations('components.${componentName.toLowerCase()}');

  return (
    <div className={\`rounded-lg border p-4 \${className || ''}\`}>
      <h3 className="font-semibold">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
`;
}

function generateTestFile(componentName: string, isClient: boolean): string {
  if (isClient) {
    return `import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('should render title', () => {
    render(<${componentName} title="Test Title" />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    render(<${componentName} title="Test" description="Test description" />);

    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<${componentName} title="Test" onClick={onClick} />);

    await user.click(screen.getByText('Test'));

    expect(onClick).toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <${componentName} title="Test" className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
`;
  }

  return `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('should render title', async () => {
    const Component = await ${componentName}({ title: 'Test Title' });
    render(Component);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should render description when provided', async () => {
    const Component = await ${componentName}({
      title: 'Test',
      description: 'Test description',
    });
    render(Component);

    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should render children', async () => {
    const Component = await ${componentName}({
      title: 'Test',
      children: <span>Child content</span>,
    });
    render(Component);

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });
});
`;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: npx tsx scripts/generators/generate-component.ts <ComponentName> [--client]');
    console.error('Example: npx tsx scripts/generators/generate-component.ts UserCard --client');
    process.exit(1);
  }

  const componentName = args[0];
  const isClient = args.includes('--client');
  const withTest = args.includes('--test');

  // Validate component name
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
    console.error('Error: Component name must be PascalCase (e.g., UserCard, ProductList)');
    process.exit(1);
  }

  // Create component file
  const componentDir = path.join(BASE_PATH, 'src/components');
  const componentFile = path.join(componentDir, `${componentName}.tsx`);

  if (fs.existsSync(componentFile)) {
    console.error(`Error: Component already exists at ${componentFile}`);
    process.exit(1);
  }

  // Ensure directory exists
  fs.mkdirSync(componentDir, { recursive: true });

  // Write component file
  const componentContent = isClient
    ? generateClientComponent(componentName)
    : generateServerComponent(componentName);
  fs.writeFileSync(componentFile, componentContent);
  console.log(`Created: ${componentFile}`);

  // Optionally create test file
  if (withTest) {
    const testFile = path.join(componentDir, `${componentName}.test.tsx`);
    const testContent = generateTestFile(componentName, isClient);
    fs.writeFileSync(testFile, testContent);
    console.log(`Created: ${testFile}`);
  }

  console.log('\nComponent generated successfully!');
  console.log(`\nType: ${isClient ? 'Client Component' : 'Server Component'}`);
  console.log(`\nNext steps:`);
  console.log(`1. Customize the component props and content`);
  console.log(`2. Add translations to src/i18n/messages/*/json if using i18n`);
  console.log(`3. Import and use in your pages`);
  if (!withTest) {
    console.log(`4. Add tests with: npx tsx scripts/generators/generate-component.ts ${componentName} --test`);
  }
}

main().catch(console.error);
