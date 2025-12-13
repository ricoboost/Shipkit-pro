'use client';

/**
 * Users Table Component with Bulk Actions
 * Client component for user selection and bulk operations
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ChevronDown,
  Ban,
  UserCheck,
  AlertTriangle,
  Download,
  Loader2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  SUSPENDED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  BANNED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  status: string;
  createdAt: Date;
  subscription: { plan: string; status: string } | null;
  creditBalance: { balance: number } | null;
  _count: { aiUsage: number };
}

interface UsersTableProps {
  users: User[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
  filters: {
    search?: string;
    role?: string;
    status?: string;
    plan?: string;
  };
}

export function UsersTable({
  users,
  total,
  hasMore,
  page,
  limit,
  filters,
}: UsersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<'ban' | 'suspend' | 'activate' | null>(null);
  const t = useTranslations('admin.users');

  const offset = (page - 1) * limit;
  const allSelected = users.length > 0 && selectedIds.size === users.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < users.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  };

  const toggleUser = (userId: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedIds(newSet);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;

    const endpoint = bulkAction === 'activate' ? 'reactivate' : bulkAction;
    const promises = Array.from(selectedIds).map((userId) =>
      fetch(`/api/admin/users/${userId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: `Bulk ${bulkAction} action` }),
      })
    );

    await Promise.all(promises);

    setSelectedIds(new Set());
    setShowBulkDialog(false);
    setBulkAction(null);
    startTransition(() => {
      router.refresh();
    });
  };

  const exportUsers = () => {
    const selectedUsers = users.filter((u) => selectedIds.has(u.id));
    const csv = [
      ['ID', 'Email', 'Name', 'Role', 'Status', 'Plan', 'Credits', 'Created'].join(','),
      ...selectedUsers.map((u) =>
        [
          u.id,
          u.email,
          u.name || '',
          u.role,
          u.status,
          u.subscription?.plan || 'FREE',
          u.creditBalance?.balance || 0,
          new Date(u.createdAt).toISOString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openBulkDialog = (action: 'ban' | 'suspend' | 'activate') => {
    setBulkAction(action);
    setShowBulkDialog(true);
  };

  const buildQueryString = (params: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        query.set(key, String(value));
      }
    });
    return query.toString();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('usersCount', { count: total })}</CardTitle>
              <CardDescription>{t('manageAccounts')}</CardDescription>
            </div>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {t('selected', { count: selectedIds.size })}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {t('bulkActions')}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openBulkDialog('activate')}>
                      <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                      {t('activateSelected')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openBulkDialog('suspend')}>
                      <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                      {t('suspendSelected')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openBulkDialog('ban')}>
                      <Ban className="h-4 w-4 mr-2 text-red-600" />
                      {t('banSelected')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={exportUsers}>
                      <Download className="h-4 w-4 mr-2" />
                      {t('exportSelected')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={allSelected}
                    ref={(el) => {
                      if (el) {
                        (el as HTMLButtonElement & { indeterminate?: boolean }).indeterminate = someSelected;
                      }
                    }}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>{t('user')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('plan')}</TableHead>
                <TableHead>{t('credits')}</TableHead>
                <TableHead>{t('aiUsage')}</TableHead>
                <TableHead>{t('role')}</TableHead>
                <TableHead>{t('joined')}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {t('noUsersFound')}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className={selectedIds.has(user.id) ? 'bg-muted/50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(user.id)}
                        onCheckedChange={() => toggleUser(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback>
                            {(user.name || user.email || 'U')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name || t('anonymous')}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[user.status] || ''}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.subscription?.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {user.subscription?.plan || 'FREE'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.creditBalance?.balance || 0}</TableCell>
                    <TableCell>{user._count.aiUsage}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'outline'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/users/${user.id}`}>
                        <Button variant="ghost" size="sm">
                          {t('view')}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {t('showing', { start: offset + 1, end: Math.min(offset + limit, total), total })}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/users?${buildQueryString({ ...filters, page: page - 1 })}`}
                >
                  <Button variant="outline" size="sm">
                    {t('previous')}
                  </Button>
                </Link>
              )}
              {hasMore && (
                <Link
                  href={`/admin/users?${buildQueryString({ ...filters, page: page + 1 })}`}
                >
                  <Button variant="outline" size="sm">
                    {t('next')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === 'ban' && t('banSelectedUsers')}
              {bulkAction === 'suspend' && t('suspendSelectedUsers')}
              {bulkAction === 'activate' && t('activateSelectedUsers')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === 'ban' && t('banDescription', { count: selectedIds.size })}
              {bulkAction === 'suspend' && t('suspendDescription', { count: selectedIds.size })}
              {bulkAction === 'activate' && t('activateDescription', { count: selectedIds.size })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkAction}
              className={
                bulkAction === 'ban'
                  ? 'bg-red-600 hover:bg-red-700'
                  : bulkAction === 'suspend'
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : ''
              }
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                bulkAction === 'activate' ? t('confirmActivate') : bulkAction === 'suspend' ? t('confirmSuspend') : t('confirmBan')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
