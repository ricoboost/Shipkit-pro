import { admin } from '@/lib/admin';
import { WaitlistTable } from './waitlist-table';

interface WaitlistTableWrapperProps {
  search?: string;
  page: number;
  status?: string;
  source?: string;
  tag?: string;
}

export async function WaitlistTableWrapper({
  search,
  page,
  status,
  source,
  tag,
}: WaitlistTableWrapperProps) {
  const limit = 20;

  const { subscribers, total, hasMore } = await admin.listWaitlistSubscribers({
    search,
    status: status as 'all' | 'confirmed' | 'unconfirmed' | 'unsubscribed' | undefined,
    source,
    tag,
    limit,
    offset: (page - 1) * limit,
  });

  const stats = await admin.getWaitlistStats();

  return (
    <WaitlistTable
      subscribers={subscribers}
      total={total}
      hasMore={hasMore}
      page={page}
      limit={limit}
      filters={{ search, status, source, tag }}
      availableTags={Object.keys(stats.tags)}
      availableSources={Object.keys(stats.bySource)}
    />
  );
}
