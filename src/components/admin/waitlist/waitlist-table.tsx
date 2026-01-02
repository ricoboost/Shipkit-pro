'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Mail } from 'lucide-react';
import { SubscriberRow, type Subscriber } from './subscriber-row';
import { BulkActionsToolbar } from './bulk-actions-toolbar';
import { TagDialog } from './tag-dialog';
import { TablePagination } from './table-pagination';

interface WaitlistTableProps {
  subscribers: Subscriber[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
  filters: {
    search?: string;
    status?: string;
    source?: string;
    tag?: string;
  };
  availableTags: string[];
  availableSources: string[];
}

export function WaitlistTable({
  subscribers,
  total,
  hasMore,
  page,
  limit,
  filters,
  availableTags,
}: WaitlistTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const buildUrl = useCallback((newPage: number) => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    if (filters.tag) params.set('tag', filters.tag);
    params.set('page', newPage.toString());
    return `/admin/waitlist?${params.toString()}`;
  }, [filters]);

  const toggleAll = useCallback(() => {
    if (selectedIds.length === subscribers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(subscribers.map((s) => s.id));
    }
  }, [selectedIds.length, subscribers]);

  const toggleOne = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleBulkAddTag = useCallback(async () => {
    if (!newTag.trim() || selectedIds.length === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/waitlist/bulk-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriberIds: selectedIds, tags: [newTag.trim()] }),
      });

      if (response.ok) {
        setSelectedIds([]);
        setNewTag('');
        setIsTagDialogOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Bulk tag error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [newTag, selectedIds, router]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;

    if (!confirm(`Delete ${selectedIds.length} subscriber(s)? This cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/waitlist/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriberIds: selectedIds }),
      });

      if (response.ok) {
        setSelectedIds([]);
        router.refresh();
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedIds, router]);

  const handleAddTagForOne = useCallback((id: string) => {
    setSelectedIds([id]);
    setIsTagDialogOpen(true);
  }, []);

  const handleDeleteOne = useCallback((id: string) => {
    setSelectedIds([id]);
    handleBulkDelete();
  }, [handleBulkDelete]);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Subscribers ({total})
          </CardTitle>
          <BulkActionsToolbar
            selectedCount={selectedIds.length}
            onAddTag={() => setIsTagDialogOpen(true)}
            onDelete={handleBulkDelete}
            isLoading={isLoading}
          />
        </CardHeader>
        <CardContent>
          {subscribers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No subscribers found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.length === subscribers.length}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Signed Up</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <SubscriberRow
                      key={subscriber.id}
                      subscriber={subscriber}
                      isSelected={selectedIds.includes(subscriber.id)}
                      onToggle={toggleOne}
                      onAddTag={handleAddTagForOne}
                      onDelete={handleDeleteOne}
                    />
                  ))}
                </TableBody>
              </Table>

              <TablePagination
                page={page}
                limit={limit}
                total={total}
                hasMore={hasMore}
                buildUrl={buildUrl}
              />
            </>
          )}
        </CardContent>
      </Card>

      <TagDialog
        open={isTagDialogOpen}
        onOpenChange={setIsTagDialogOpen}
        selectedCount={selectedIds.length}
        newTag={newTag}
        onTagChange={setNewTag}
        onSubmit={handleBulkAddTag}
        isLoading={isLoading}
        availableTags={availableTags}
      />
    </>
  );
}
