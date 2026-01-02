'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Tag, Trash2 } from 'lucide-react';
import { StatusBadge } from './status-badge';

export interface Subscriber {
  id: string;
  email: string;
  confirmed: boolean;
  source: string | null;
  tags: string[];
  createdAt: Date;
  unsubscribedAt: Date | null;
}

interface SubscriberRowProps {
  subscriber: Subscriber;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onAddTag: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SubscriberRow({
  subscriber,
  isSelected,
  onToggle,
  onAddTag,
  onDelete,
}: SubscriberRowProps) {
  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggle(subscriber.id)}
        />
      </TableCell>
      <TableCell className="font-medium">{subscriber.email}</TableCell>
      <TableCell>
        <StatusBadge
          confirmed={subscriber.confirmed}
          unsubscribedAt={subscriber.unsubscribedAt}
        />
      </TableCell>
      <TableCell>
        {subscriber.source ? (
          <Badge variant="outline">{subscriber.source}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex gap-1 flex-wrap">
          {subscriber.tags.length > 0 ? (
            subscriber.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        {new Date(subscriber.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAddTag(subscriber.id)}>
              <Tag className="h-4 w-4 mr-2" />
              Add Tag
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(subscriber.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
