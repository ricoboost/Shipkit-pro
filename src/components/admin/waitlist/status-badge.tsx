'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, UserMinus } from 'lucide-react';

interface StatusBadgeProps {
  confirmed: boolean;
  unsubscribedAt: Date | null;
}

export function StatusBadge({ confirmed, unsubscribedAt }: StatusBadgeProps) {
  if (unsubscribedAt) {
    return (
      <Badge variant="destructive" className="gap-1">
        <UserMinus className="h-3 w-3" />
        Unsubscribed
      </Badge>
    );
  }

  if (confirmed) {
    return (
      <Badge variant="default" className="gap-1 bg-green-600">
        <CheckCircle className="h-3 w-3" />
        Confirmed
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1">
      <Clock className="h-3 w-3" />
      Pending
    </Badge>
  );
}
