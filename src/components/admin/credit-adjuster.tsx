'use client';

/**
 * Credit Adjuster Component
 * Manually adjust user credit balance
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Minus, Loader2 } from 'lucide-react';

interface CreditAdjusterProps {
  userId: string;
  currentBalance: number;
}

export function CreditAdjuster({ userId, currentBalance }: CreditAdjusterProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setIsLoading(true);

    try {
      const adjustedAmount = operation === 'add' ? numAmount : -numAmount;

      const response = await fetch(`/api/admin/users/${userId}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: adjustedAmount,
          reason: reason || `Admin ${operation === 'add' ? 'grant' : 'deduction'}`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to adjust credits');
      }

      router.refresh();
      setIsOpen(false);
      setAmount('');
      setReason('');
    } catch (error) {
      console.error('Error adjusting credits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const previewBalance = () => {
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount)) return currentBalance;
    return operation === 'add'
      ? currentBalance + numAmount
      : currentBalance - numAmount;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Adjust Credits
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Credits</DialogTitle>
          <DialogDescription>
            Add or remove credits from this user&apos;s balance.
            Current balance: {currentBalance} credits
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="operation">Operation</Label>
            <Select
              value={operation}
              onValueChange={(value: 'add' | 'subtract') => setOperation(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">
                  <div className="flex items-center">
                    <Plus className="h-4 w-4 mr-2 text-green-600" />
                    Add Credits
                  </div>
                </SelectItem>
                <SelectItem value="subtract">
                  <div className="flex items-center">
                    <Minus className="h-4 w-4 mr-2 text-red-600" />
                    Remove Credits
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for adjustment..."
              rows={2}
            />
          </div>

          {amount && (
            <div className="p-3 rounded-lg bg-muted">
              <div className="flex justify-between text-sm">
                <span>Current Balance</span>
                <span>{currentBalance}</span>
              </div>
              <div className={`flex justify-between text-sm ${operation === 'add' ? 'text-green-600' : 'text-red-600'}`}>
                <span>{operation === 'add' ? 'Add' : 'Remove'}</span>
                <span>{operation === 'add' ? '+' : '-'}{amount}</span>
              </div>
              <div className="flex justify-between font-medium border-t mt-2 pt-2">
                <span>New Balance</span>
                <span>{previewBalance()}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !amount || parseInt(amount, 10) <= 0}
              variant={operation === 'add' ? 'default' : 'destructive'}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {operation === 'add' ? (
                    <Plus className="h-4 w-4 mr-2" />
                  ) : (
                    <Minus className="h-4 w-4 mr-2" />
                  )}
                  {operation === 'add' ? 'Add' : 'Remove'} Credits
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
