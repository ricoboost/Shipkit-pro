/**
 * Navbar
 * A responsive navigation bar with mobile menu.
 * Best for: Site headers, app navigation, marketing pages
 */

'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface NavLink {
  /** Link label */
  label: string;
  /** Link href */
  href: string;
  /** Is this link active? */
  active?: boolean;
}

interface NavbarProps {
  /** App/brand name */
  brandName: string;
  /** Logo image URL (optional) */
  logoSrc?: string;
  /** Navigation links */
  links: NavLink[];
  /** Show CTA button */
  showCta?: boolean;
  /** CTA button text */
  ctaText?: string;
  /** CTA button href */
  ctaHref?: string;
  /** Show login button */
  showLogin?: boolean;
  /** Login button href */
  loginHref?: string;
  /** Is user logged in? */
  isLoggedIn?: boolean;
  /** Dashboard href (when logged in) */
  dashboardHref?: string;
  /** Sticky navbar */
  sticky?: boolean;
  /** Transparent background (for hero overlays) */
  transparent?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function Navbar({
  brandName,
  logoSrc,
  links,
  showCta = true,
  ctaText = 'Get Started',
  ctaHref = '/signup',
  showLogin = true,
  loginHref = '/login',
  isLoggedIn = false,
  dashboardHref = '/dashboard',
  sticky = true,
  transparent = false,
  className,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        'z-50 w-full',
        sticky && 'sticky top-0',
        transparent
          ? 'bg-transparent'
          : 'border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center justify-between">
          {/* Logo */}
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

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className={cn(
                  'text-sm transition-colors hover:text-primary',
                  link.active
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-4 md:flex">
            {isLoggedIn ? (
              <Button asChild>
                <Link href={dashboardHref}>Dashboard</Link>
              </Button>
            ) : (
              <>
                {showLogin && (
                  <Button variant="ghost" asChild>
                    <Link href={loginHref}>Log in</Link>
                  </Button>
                )}
                {showCta && (
                  <Button asChild>
                    <Link href={ctaHref}>{ctaText}</Link>
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4">
                {/* Mobile Links */}
                <div className="flex flex-col gap-2">
                  {links.map((link, index) => (
                    <Link
                      key={index}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'rounded-lg px-3 py-2 text-sm transition-colors',
                        link.active
                          ? 'bg-muted font-medium'
                          : 'hover:bg-muted'
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Mobile CTA */}
                <div className="flex flex-col gap-2 pt-4 border-t">
                  {isLoggedIn ? (
                    <Button asChild>
                      <Link
                        href={dashboardHref}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </Button>
                  ) : (
                    <>
                      {showLogin && (
                        <Button variant="outline" asChild>
                          <Link
                            href={loginHref}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Log in
                          </Link>
                        </Button>
                      )}
                      {showCta && (
                        <Button asChild>
                          <Link
                            href={ctaHref}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {ctaText}
                          </Link>
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}

// Default links for demonstration
export const defaultNavLinks: NavLink[] = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Docs', href: '/docs' },
  { label: 'Blog', href: '/blog' },
];

// Example usage:
// <Navbar
//   brandName="ShipKit Pro"
//   links={defaultNavLinks}
//   ctaText="Get Started"
//   ctaHref="/signup"
// />
