/**
 * StatsCards
 * A row of metric/stats cards for dashboards.
 * Best for: KPI displays, dashboard overviews, metrics tracking
 */

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCard {
  /** Card title */
  title: string;
  /** Main value */
  value: string | number;
  /** Change description (e.g., "+12% from last month") */
  change?: string;
  /** Change type for styling */
  changeType?: 'positive' | 'negative' | 'neutral';
  /** Card icon */
  icon?: LucideIcon;
  /** Additional description */
  description?: string;
}

interface StatsCardsProps {
  /** Array of stat cards */
  stats: StatCard[];
  /** Number of columns (2, 3, or 4) */
  columns?: 2 | 3 | 4;
  /** Additional CSS classes */
  className?: string;
}

export function StatsCards({
  stats,
  columns = 4,
  className,
}: StatsCardsProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  const changeIcons = {
    positive: TrendingUp,
    negative: TrendingDown,
    neutral: Minus,
  };

  const changeColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {stats.map((stat, index) => {
        const ChangeIcon = stat.changeType
          ? changeIcons[stat.changeType]
          : null;

        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              {stat.icon && (
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {(stat.change || stat.description) && (
                <div className="mt-1 flex items-center gap-1">
                  {stat.change && stat.changeType && ChangeIcon && (
                    <>
                      <ChangeIcon
                        className={cn(
                          'h-3 w-3',
                          changeColors[stat.changeType]
                        )}
                      />
                      <span
                        className={cn(
                          'text-xs',
                          changeColors[stat.changeType]
                        )}
                      >
                        {stat.change}
                      </span>
                    </>
                  )}
                  {stat.description && !stat.change && (
                    <span className="text-xs text-muted-foreground">
                      {stat.description}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Default stats for demonstration
import { Users, DollarSign, CreditCard, Activity } from 'lucide-react';

export const defaultStats: StatCard[] = [
  {
    title: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1% from last month',
    changeType: 'positive',
    icon: DollarSign,
  },
  {
    title: 'Subscriptions',
    value: '+2,350',
    change: '+180.1% from last month',
    changeType: 'positive',
    icon: Users,
  },
  {
    title: 'Sales',
    value: '+12,234',
    change: '+19% from last month',
    changeType: 'positive',
    icon: CreditCard,
  },
  {
    title: 'Active Now',
    value: '+573',
    change: '-2% from last hour',
    changeType: 'negative',
    icon: Activity,
  },
];

// Example usage:
// <StatsCards stats={defaultStats} columns={4} />
