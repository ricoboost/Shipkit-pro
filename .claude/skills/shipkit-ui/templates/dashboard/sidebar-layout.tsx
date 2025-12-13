/**
 * SidebarLayout
 * A dashboard layout with collapsible sidebar navigation.
 * Best for: Admin panels, app dashboards, internal tools
 */

'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LucideIcon,
  Home,
  Users,
  CreditCard,
  Settings,
  BarChart,
  Menu,
  X,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface NavItem {
  /** Nav item label */
  label: string;
  /** Nav item href */
  href: string;
  /** Nav item icon */
  icon: LucideIcon;
  /** Is this item active? */
  active?: boolean;
  /** Badge count (optional) */
  badge?: number;
}

interface User {
  name: string;
  email: string;
  avatarSrc?: string;
}

interface SidebarLayoutProps {
  /** Navigation items */
  navItems: NavItem[];
  /** Current user */
  user: User;
  /** App logo/name */
  appName: string;
  /** App logo image (optional) */
  logoSrc?: string;
  /** Children content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function SidebarLayout({
  navItems,
  user,
  appName,
  logoSrc,
  children,
  className,
}: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={cn('flex min-h-screen', className)}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            {logoSrc ? (
              <img src={logoSrc} alt={appName} className="h-8 w-8" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                {appName[0]}
              </div>
            )}
            <span className="font-semibold">{appName}</span>
          </Link>
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    item.active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/20 px-1.5 text-xs font-medium">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-muted">
                <Avatar className="h-8 w-8">
                  {user.avatarSrc && (
                    <AvatarImage src={user.avatarSrc} alt={user.name} />
                  )}
                  <AvatarFallback>
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {user.email}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:hidden">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold">{appName}</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

// Default nav items for demonstration
export const defaultNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home, active: true },
  { label: 'Users', href: '/dashboard/users', icon: Users, badge: 3 },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

// Example usage:
// <SidebarLayout
//   appName="ShipKit Pro"
//   navItems={defaultNavItems}
//   user={{ name: 'John Doe', email: 'john@example.com' }}
// >
//   <div className="p-6">Dashboard content here</div>
// </SidebarLayout>
