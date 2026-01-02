'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  newTag: string;
  onTagChange: (tag: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  availableTags: string[];
}

export function TagDialog({
  open,
  onOpenChange,
  selectedCount,
  newTag,
  onTagChange,
  onSubmit,
  isLoading,
  availableTags,
}: TagDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tag</DialogTitle>
          <DialogDescription>
            Add a tag to {selectedCount} selected subscriber(s).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Enter tag name..."
            value={newTag}
            onChange={(e) => onTagChange(e.target.value)}
          />
          {availableTags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {availableTags.slice(0, 10).map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => onTagChange(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isLoading || !newTag.trim()}>
            {isLoading ? 'Adding...' : 'Add Tag'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
