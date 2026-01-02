'use client';

/**
 * User Search Filters Component
 * Search and filter controls for admin users list
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface UserSearchFiltersProps {
  defaultSearch?: string;
  defaultRole?: string;
  defaultStatus?: string;
  defaultPlan?: string;
}

export function UserSearchFilters({
  defaultSearch = '',
  defaultRole = '',
  defaultStatus = '',
  defaultPlan = '',
}: UserSearchFiltersProps) {
  const router = useRouter();
  const _searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('admin.users');

  const [search, setSearch] = useState(defaultSearch);
  const [role, setRole] = useState(defaultRole);
  const [status, setStatus] = useState(defaultStatus);
  const [plan, setPlan] = useState(defaultPlan);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    if (status) params.set('status', status);
    if (plan) params.set('plan', plan);

    startTransition(() => {
      router.push(`/admin/users?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setSearch('');
    setRole('');
    setStatus('');
    setPlan('');
    startTransition(() => {
      router.push('/admin/users');
    });
  };

  const hasFilters = search || role || status || plan;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder={t('status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatus')}</SelectItem>
            <SelectItem value="ACTIVE">{t('active')}</SelectItem>
            <SelectItem value="SUSPENDED">{t('suspended')}</SelectItem>
            <SelectItem value="BANNED">{t('banned')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder={t('role')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allRoles')}</SelectItem>
            <SelectItem value="USER">{t('user')}</SelectItem>
            <SelectItem value="ADMIN">{t('admin')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={plan} onValueChange={setPlan}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder={t('plan')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allPlans')}</SelectItem>
            <SelectItem value="FREE">{t('free')}</SelectItem>
            <SelectItem value="STARTER">{t('starter')}</SelectItem>
            <SelectItem value="PRO">{t('pro')}</SelectItem>
            <SelectItem value="ENTERPRISE">{t('enterprise')}</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={applyFilters} disabled={isPending}>
          <Filter className="h-4 w-4 mr-2" />
          {t('apply')}
        </Button>

        {hasFilters && (
          <Button variant="outline" onClick={clearFilters} disabled={isPending}>
            <X className="h-4 w-4 mr-2" />
            {t('clear')}
          </Button>
        )}
      </div>
    </div>
  );
}
