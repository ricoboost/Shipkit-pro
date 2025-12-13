/**
 * MDX Components
 * Custom components for rendering MDX content
 */

import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import Image from 'next/image';

// Custom heading with anchor link
function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const HeadingComponent = ({
    children,
    id,
    className,
  }: {
    children?: React.ReactNode;
    id?: string;
    className?: string;
  }) => {
    const headingId = id || (typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-') : '');

    const content = (
      <>
        {children}
        {headingId && (
          <a
            href={`#${headingId}`}
            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Link to this section"
          >
            #
          </a>
        )}
      </>
    );

    const baseClassName = `group relative scroll-mt-20 ${className || ''}`;

    switch (level) {
      case 1:
        return <h1 id={headingId} className={baseClassName}>{content}</h1>;
      case 2:
        return <h2 id={headingId} className={baseClassName}>{content}</h2>;
      case 3:
        return <h3 id={headingId} className={baseClassName}>{content}</h3>;
      case 4:
        return <h4 id={headingId} className={baseClassName}>{content}</h4>;
      case 5:
        return <h5 id={headingId} className={baseClassName}>{content}</h5>;
      case 6:
        return <h6 id={headingId} className={baseClassName}>{content}</h6>;
      default:
        return <h2 id={headingId} className={baseClassName}>{content}</h2>;
    }
  };

  HeadingComponent.displayName = `Heading${level}`;
  return HeadingComponent;
}

// Code block with syntax highlighting
function CodeBlock({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const isInline = !className?.includes('language-');

  if (isInline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
}

// Pre block wrapper
function Pre({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  return (
    <pre
      className="overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono"
      {...props}
    >
      {children}
    </pre>
  );
}

// Custom link component
function CustomLink({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (!href) {
    return <span {...props}>{children}</span>;
  }

  if (href.startsWith('/')) {
    return (
      <Link href={href} className="text-primary hover:underline" {...props}>
        {children}
      </Link>
    );
  }

  if (href.startsWith('#')) {
    return (
      <a href={href} className="text-primary hover:underline" {...props}>
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline"
      {...props}
    >
      {children}
    </a>
  );
}

// Custom image component
function CustomImage({
  src,
  alt,
  width,
  height,
}: {
  src?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
}) {
  if (!src || typeof src !== 'string') return null;

  return (
    <Image
      src={src}
      alt={alt || ''}
      width={Number(width) || 800}
      height={Number(height) || 400}
      className="rounded-lg my-6"
    />
  );
}

// Blockquote styling
function Blockquote({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      className="border-l-4 border-primary pl-4 italic my-6 text-muted-foreground"
      {...props}
    >
      {children}
    </blockquote>
  );
}

// Table styling
function Table({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full divide-y divide-border" {...props}>
        {children}
      </table>
    </div>
  );
}

// Callout component for notes, warnings, etc.
interface CalloutProps {
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children: React.ReactNode;
}

function Callout({ type = 'info', title, children }: CalloutProps) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200',
  };

  return (
    <div className={`rounded-lg border p-4 my-6 ${styles[type]}`}>
      {title && <p className="font-semibold mb-2">{title}</p>}
      <div className="prose-sm">{children}</div>
    </div>
  );
}

// Video embed component
interface VideoProps {
  src: string;
  title?: string;
}

function Video({ src, title = 'Video' }: VideoProps) {
  // YouTube embed
  if (src.includes('youtube.com') || src.includes('youtu.be')) {
    const videoId = src.includes('youtu.be')
      ? src.split('/').pop()
      : new URL(src).searchParams.get('v');

    return (
      <div className="relative aspect-video my-6 rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }

  // Direct video
  return (
    <video
      src={src}
      controls
      className="w-full rounded-lg my-6"
      title={title}
    />
  );
}

export const mdxComponents: MDXComponents = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  code: CodeBlock,
  pre: Pre,
  a: CustomLink,
  img: CustomImage,
  blockquote: Blockquote,
  table: Table,
  // Custom components
  Callout,
  Video,
};

export { Callout, Video };
