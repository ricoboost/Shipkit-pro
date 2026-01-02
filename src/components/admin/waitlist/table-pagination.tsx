'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TablePaginationProps {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  buildUrl: (page: number) => string;
}

export function TablePagination({
  page,
  limit,
  total,
  hasMore,
  buildUrl,
}: TablePaginationProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-muted-foreground">
        Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => router.push(buildUrl(page - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasMore}
          onClick={() => router.push(buildUrl(page + 1))}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
