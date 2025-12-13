/**
 * ActivityFeed
 * A timeline of recent activities or events.
 * Best for: Audit logs, user activity, notifications, changelogs
 */

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface ActivityItem {
  /** Activity ID */
  id: string;
  /** Activity type for icon/styling */
  type: 'create' | 'update' | 'delete' | 'login' | 'payment' | 'custom';
  /** Activity title/description */
  title: string;
  /** Additional details */
  description?: string;
  /** User who performed the action */
  user?: {
    name: string;
    avatarSrc?: string;
  };
  /** Timestamp */
  timestamp: string;
  /** Custom icon (overrides type icon) */
  icon?: LucideIcon;
  /** Badge text */
  badge?: string;
  /** Badge variant */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface ActivityFeedProps {
  /** Card title */
  title?: string;
  /** Array of activity items */
  activities: ActivityItem[];
  /** Show avatars */
  showAvatars?: boolean;
  /** Max items to show (0 for all) */
  maxItems?: number;
  /** Additional CSS classes */
  className?: string;
}

export function ActivityFeed({
  title = 'Recent Activity',
  activities,
  showAvatars = true,
  maxItems = 0,
  className,
}: ActivityFeedProps) {
  const displayedActivities =
    maxItems > 0 ? activities.slice(0, maxItems) : activities;

  const typeColors = {
    create: 'bg-green-500',
    update: 'bg-blue-500',
    delete: 'bg-red-500',
    login: 'bg-purple-500',
    payment: 'bg-yellow-500',
    custom: 'bg-gray-500',
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {/* Timeline line */}
          <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border" />

          {displayedActivities.map((activity, index) => (
            <div
              key={activity.id}
              className={cn(
                'relative flex gap-4 pb-6',
                index === displayedActivities.length - 1 && 'pb-0'
              )}
            >
              {/* Timeline dot */}
              <div
                className={cn(
                  'relative z-10 mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full',
                  typeColors[activity.type]
                )}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Avatar */}
                    {showAvatars && activity.user && (
                      <Avatar className="h-6 w-6">
                        {activity.user.avatarSrc && (
                          <AvatarImage
                            src={activity.user.avatarSrc}
                            alt={activity.user.name}
                          />
                        )}
                        <AvatarFallback className="text-xs">
                          {activity.user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Title */}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.title}
                      </p>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {activity.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Badge */}
                  {activity.badge && (
                    <Badge
                      variant={activity.badgeVariant || 'secondary'}
                      className="flex-shrink-0"
                    >
                      {activity.badge}
                    </Badge>
                  )}
                </div>

                {/* Timestamp */}
                <p className="mt-1 text-xs text-muted-foreground">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Default activities for demonstration
export const defaultActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'create',
    title: 'New user registered',
    description: 'john@example.com signed up',
    user: { name: 'John Doe' },
    timestamp: '2 minutes ago',
    badge: 'New',
    badgeVariant: 'default',
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment received',
    description: '$349 for Pro plan',
    user: { name: 'Sarah Chen' },
    timestamp: '15 minutes ago',
  },
  {
    id: '3',
    type: 'update',
    title: 'Settings updated',
    description: 'Changed notification preferences',
    user: { name: 'Mike Wilson' },
    timestamp: '1 hour ago',
  },
  {
    id: '4',
    type: 'login',
    title: 'New login detected',
    description: 'From San Francisco, CA',
    user: { name: 'Emily Rodriguez' },
    timestamp: '2 hours ago',
  },
  {
    id: '5',
    type: 'delete',
    title: 'Project deleted',
    description: 'Removed "Old Project"',
    user: { name: 'Admin' },
    timestamp: '3 hours ago',
    badge: 'Warning',
    badgeVariant: 'destructive',
  },
];

// Example usage:
// <ActivityFeed activities={defaultActivities} maxItems={5} />
