'use client';

/**
 * User Actions Component
 * Ban, suspend, reactivate, delete user actions
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, Ban, UserCheck, Trash2, AlertTriangle, LogIn } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string;
  status: string;
  role: string;
}

interface UserActionsProps {
  user: User;
}

export function UserActions({ user }: UserActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reason, setReason] = useState('');

  const handleBan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to ban user');

      router.refresh();
      setShowBanDialog(false);
      setReason('');
    } catch (error) {
      console.error('Error banning user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspend = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to suspend user');

      router.refresh();
      setShowSuspendDialog(false);
      setReason('');
    } catch (error) {
      console.error('Error suspending user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/reactivate`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to reactivate user');

      router.refresh();
    } catch (error) {
      console.error('Error reactivating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      router.push('/admin/users');
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImpersonate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/impersonate/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to impersonate user');
      }

      // Redirect to dashboard as the impersonated user
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Error impersonating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = user.status === 'ACTIVE';
  const _isBanned = user.status === 'BANNED';
  const isSuspended = user.status === 'SUSPENDED';
  const canImpersonate = user.role !== 'ADMIN';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <MoreHorizontal className="h-4 w-4 mr-2" />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canImpersonate && (
            <>
              <DropdownMenuItem onClick={handleImpersonate} disabled={isLoading}>
                <LogIn className="h-4 w-4 mr-2 text-blue-600" />
                Sign in as User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {!isActive && (
            <DropdownMenuItem onClick={handleReactivate} disabled={isLoading}>
              <UserCheck className="h-4 w-4 mr-2 text-green-600" />
              Reactivate User
            </DropdownMenuItem>
          )}
          {isActive && (
            <>
              <DropdownMenuItem onClick={() => setShowSuspendDialog(true)}>
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                Suspend User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowBanDialog(true)}>
                <Ban className="h-4 w-4 mr-2 text-red-600" />
                Ban User
              </DropdownMenuItem>
            </>
          )}
          {isSuspended && (
            <DropdownMenuItem onClick={() => setShowBanDialog(true)}>
              <Ban className="h-4 w-4 mr-2 text-red-600" />
              Ban User
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Ban Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              This will permanently ban {user.name || user.email} from accessing the platform.
              They will not be able to log in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ban-reason">Reason (optional)</Label>
              <Textarea
                id="ban-reason"
                placeholder="Enter reason for ban..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBan} disabled={isLoading}>
              {isLoading ? 'Banning...' : 'Ban User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              This will temporarily suspend {user.name || user.email}&apos;s account.
              They can be reactivated later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="suspend-reason">Reason (optional)</Label>
              <Textarea
                id="suspend-reason"
                placeholder="Enter reason for suspension..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
              Cancel
            </Button>
            <Button variant="default" className="bg-yellow-600 hover:bg-yellow-700" onClick={handleSuspend} disabled={isLoading}>
              {isLoading ? 'Suspending...' : 'Suspend User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {user.name || user.email}&apos;s
              account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
