/**
 * Footer
 * A site footer with links, social icons, and newsletter signup.
 * Best for: Site footers, landing pages, marketing sites
 */

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Github, Twitter, Linkedin, Youtube } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  icon: 'twitter' | 'github' | 'linkedin' | 'youtube';
  href: string;
  label: string;
}

interface FooterProps {
  /** Brand name */
  brandName: string;
  /** Brand description */
  brandDescription?: string;
  /** Logo URL (optional) */
  logoSrc?: string;
  /** Footer columns */
  columns: FooterColumn[];
  /** Social links */
  socialLinks?: SocialLink[];
  /** Show newsletter signup */
  showNewsletter?: boolean;
  /** Newsletter heading */
  newsletterHeading?: string;
  /** Newsletter description */
  newsletterDescription?: string;
  /** Copyright text */
  copyright?: string;
  /** Additional CSS classes */
  className?: string;
}

const socialIcons = {
  twitter: Twitter,
  github: Github,
  linkedin: Linkedin,
  youtube: Youtube,
};

export function Footer({
  brandName,
  brandDescription,
  logoSrc,
  columns,
  socialLinks,
  showNewsletter = false,
  newsletterHeading = 'Subscribe to our newsletter',
  newsletterDescription = 'Get the latest updates and news delivered to your inbox.',
  copyright,
  className,
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const copyrightText = copyright || `© ${currentYear} ${brandName}. All rights reserved.`;

  return (
    <footer className={cn('border-t bg-muted/30', className)}>
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Brand & Newsletter */}
          <div className="space-y-8">
            {/* Brand */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2">
                {logoSrc ? (
                  <Image src={logoSrc} alt={brandName} width={32} height={32} className="h-8 w-auto" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                    {brandName[0]}
                  </div>
                )}
                <span className="font-semibold">{brandName}</span>
              </Link>
              {brandDescription && (
                <p className="max-w-xs text-sm text-muted-foreground">
                  {brandDescription}
                </p>
              )}
            </div>

            {/* Newsletter */}
            {showNewsletter && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">{newsletterHeading}</h3>
                  <p className="text-sm text-muted-foreground">
                    {newsletterDescription}
                  </p>
                </div>
                <form className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="max-w-[240px]"
                  />
                  <Button type="submit">Subscribe</Button>
                </form>
              </div>
            )}

            {/* Social Links */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="flex gap-4">
                {socialLinks.map((social, index) => {
                  const Icon = socialIcons[social.icon];
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={social.label}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Link Columns */}
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {columns.map((column, index) => (
              <div key={index}>
                <h3 className="mb-4 font-semibold">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>{copyrightText}</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Default columns for demonstration
export const defaultFooterColumns: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Roadmap', href: '/roadmap' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Blog', href: '/blog' },
      { label: 'Support', href: '/support' },
      { label: 'API Reference', href: '/docs/api' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
    ],
  },
];

export const defaultSocialLinks: SocialLink[] = [
  { icon: 'twitter', href: 'https://twitter.com', label: 'Twitter' },
  { icon: 'github', href: 'https://github.com', label: 'GitHub' },
  { icon: 'linkedin', href: 'https://linkedin.com', label: 'LinkedIn' },
];

// Example usage:
// <Footer
//   brandName="ShipKit Pro"
//   brandDescription="The enterprise-grade Next.js boilerplate for modern SaaS applications."
//   columns={defaultFooterColumns}
//   socialLinks={defaultSocialLinks}
//   showNewsletter
// />
