'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Settings,
  User,
  CreditCard,
  Users,
  Key,
  Bot,
  FileText,
  BarChart3,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useSiteSettings } from '@/contexts/site-settings-context';
import { DynamicIcon } from '@/components/ui/icon-picker';
import { LanguageSwitcher } from '@/components/language-switcher';

interface SidebarItem {
  href: string;
  icon: LucideIcon;
  labelKey: string;
}

interface SidebarSection {
  titleKey: string;
  items: SidebarItem[];
}

const sidebarItems: SidebarSection[] = [
  {
    titleKey: 'overview',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
      { href: '/dashboard/analytics', icon: BarChart3, labelKey: 'analytics' },
    ],
  },
  {
    titleKey: 'ai',
    items: [
      { href: '/ai-playground', icon: Bot, labelKey: 'aiPlayground' },
      { href: '/dashboard/usage', icon: FileText, labelKey: 'usage' },
    ],
  },
  {
    titleKey: 'team',
    items: [
      { href: '/dashboard/team', icon: Users, labelKey: 'team' },
    ],
  },
  {
    titleKey: 'settings',
    items: [
      { href: '/settings/profile', icon: User, labelKey: 'profile' },
      { href: '/settings/billing', icon: CreditCard, labelKey: 'billing' },
      { href: '/settings/api-keys', icon: Key, labelKey: 'apiKeys' },
      { href: '/settings', icon: Settings, labelKey: 'settings' },
    ],
  },
];

const adminItems: SidebarSection[] = [
  {
    titleKey: 'admin',
    items: [
      { href: '/admin', icon: Shield, labelKey: 'adminPanel' },
      { href: '/admin/users', icon: Users, labelKey: 'users' },
    ],
  },
];

export function Sidebar(): React.JSX.Element {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const t = useTranslations('sidebar');
  const { siteName, siteIcon } = useSiteSettings();
  const { data: session } = useSession();

  // Check if user is admin from session
  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';

  const allItems = isAdmin ? [...sidebarItems, ...adminItems] : sidebarItems;

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <DynamicIcon name={siteIcon} className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">{siteName}</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8', collapsed && 'mx-auto')}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-6 px-2">
          {allItems.map((section) => (
            <div key={section.titleKey}>
              {!collapsed && (
                <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t(`sections.${section.titleKey}`)}
                </h4>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const label = t(`items.${item.labelKey}`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        collapsed && 'justify-center px-2'
                      )}
                      title={collapsed ? label : undefined}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
      <div className={cn('border-t p-4', collapsed && 'flex justify-center')}>
        <LanguageSwitcher compact={collapsed} savePreference />
      </div>
    </aside>
  );
}
