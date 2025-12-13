'use client';

import { StatsSimple } from '@/components/marketing/stats/stats-simple';
import { StatsCards } from '@/components/marketing/stats/stats-cards';
import { StatsAnimated } from '@/components/marketing/stats/stats-animated';
import { Users, TrendingUp, Clock, Star } from 'lucide-react';

export function StatsSimplePreview() {
  return (
    <StatsSimple
      subtitle="By The Numbers"
      title="Trusted by Thousands"
      description="Our community continues to grow every day."
      stats={[
        { value: "10K", label: "Active Users", suffix: "+" },
        { value: "500", label: "Companies", suffix: "+" },
        { value: "99.9", label: "Uptime", suffix: "%" },
        { value: "24/7", label: "Support" }
      ]}
      columns={4}
    />
  );
}

export function StatsCardsPreview() {
  return (
    <StatsCards
      subtitle="Performance Metrics"
      title="This Month's Highlights"
      stats={[
        {
          value: "12,847",
          label: "Total Users",
          description: "Compared to 10,234 last month",
          icon: <Users className="h-5 w-5" />,
          trend: { value: "25%", positive: true }
        },
        {
          value: "$84,230",
          label: "Revenue",
          description: "Monthly recurring revenue",
          icon: <TrendingUp className="h-5 w-5" />,
          trend: { value: "12%", positive: true }
        },
        {
          value: "2.4ms",
          label: "Response Time",
          description: "Average API latency",
          icon: <Clock className="h-5 w-5" />,
          trend: { value: "15%", positive: true }
        },
        {
          value: "4.9",
          label: "User Rating",
          description: "Based on 2,847 reviews",
          icon: <Star className="h-5 w-5" />
        }
      ]}
      columns={4}
      variant="bordered"
    />
  );
}

export function StatsAnimatedPreview() {
  return (
    <StatsAnimated
      subtitle="Our Impact"
      title="Growing Every Day"
      stats={[
        { endValue: 50000, label: "Users", suffix: "+" },
        { endValue: 1200, label: "Projects", suffix: "+" },
        { endValue: 99.9, label: "Uptime", suffix: "%", decimals: 1 },
        { endValue: 4.8, label: "Rating", decimals: 1 }
      ]}
      columns={4}
    />
  );
}
