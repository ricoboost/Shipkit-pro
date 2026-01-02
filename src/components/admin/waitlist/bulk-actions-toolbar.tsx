'use client';

import { Button } from '@/components/ui/button';
import { Tag, Trash2 } from 'lucide-react';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onAddTag: () => void;
  onDelete: () => void;
  isLoading: boolean;
}

export function BulkActionsToolbar({
  selectedCount,
  onAddTag,
  onDelete,
  isLoading,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {selectedCount} selected
      </span>
      <Button variant="outline" size="sm" onClick={onAddTag}>
        <Tag className="h-4 w-4 mr-1" />
        Add Tag
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        disabled={isLoading}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>
    </div>
  );
}
