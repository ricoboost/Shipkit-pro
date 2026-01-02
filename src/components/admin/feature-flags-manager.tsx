'use client';

/**
 * Feature Flags Manager Component
 * Toggle feature flags with instant feedback
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users } from 'lucide-react';

interface AppConfig {
  id: string;
  waitlistMode: boolean;
  maintenanceMode: boolean;
}

interface FeatureFlagsManagerProps {
  config: AppConfig;
}

export function FeatureFlagsManager({ config }: FeatureFlagsManagerProps) {
  const router = useRouter();
  const [waitlistMode, setWaitlistMode] = useState(config.waitlistMode);
  const [maintenanceMode, setMaintenanceMode] = useState(config.maintenanceMode);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleToggle = async (flag: 'waitlistMode' | 'maintenanceMode', enabled: boolean) => {
    setIsLoading(flag);

    // Optimistic update
    if (flag === 'waitlistMode') setWaitlistMode(enabled);
    if (flag === 'maintenanceMode') setMaintenanceMode(enabled);

    try {
      const response = await fetch('/api/admin/settings/flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [flag]: enabled }),
      });

      if (!response.ok) {
        // Revert on error
        if (flag === 'waitlistMode') setWaitlistMode(!enabled);
        if (flag === 'maintenanceMode') setMaintenanceMode(!enabled);
        throw new Error('Failed to update flag');
      }

      router.refresh();
    } catch (error) {
      console.error('Error updating flag:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const flags = [
    {
      id: 'waitlistMode',
      name: 'Waitlist Mode',
      description: 'Redirect new users to a waitlist instead of allowing signup',
      icon: Users,
      enabled: waitlistMode,
      severity: 'warning',
    },
    {
      id: 'maintenanceMode',
      name: 'Maintenance Mode',
      description: 'Show maintenance page to all non-admin users',
      icon: AlertTriangle,
      enabled: maintenanceMode,
      severity: 'danger',
    },
  ];

  return (
    <div className="space-y-6">
      {flags.map((flag) => (
        <div
          key={flag.id}
          className="flex items-start justify-between p-4 rounded-lg border"
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg ${
                flag.enabled
                  ? flag.severity === 'danger'
                    ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                    : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <flag.icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor={flag.id} className="font-medium cursor-pointer">
                  {flag.name}
                </Label>
                {flag.enabled && (
                  <Badge
                    variant={flag.severity === 'danger' ? 'destructive' : 'default'}
                    className={
                      flag.severity === 'warning'
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        : ''
                    }
                  >
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{flag.description}</p>
            </div>
          </div>
          <Switch
            id={flag.id}
            checked={flag.enabled}
            onCheckedChange={(checked) =>
              handleToggle(flag.id as 'waitlistMode' | 'maintenanceMode', checked)
            }
            disabled={isLoading === flag.id}
          />
        </div>
      ))}

      {(waitlistMode || maintenanceMode) && (
        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Feature flags are active
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {maintenanceMode
                  ? 'Non-admin users will see a maintenance page.'
                  : 'New users will be redirected to the waitlist.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
