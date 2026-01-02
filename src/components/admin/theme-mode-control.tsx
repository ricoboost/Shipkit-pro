'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ThemeMode } from '@/lib/theme';

interface ThemeModeControlProps {
  value: ThemeMode;
  onChange: (mode: ThemeMode) => void;
  labels?: {
    light: string;
    dark: string;
    system: string;
  };
}

const modes: { value: ThemeMode; icon: typeof Sun }[] = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
];

export function ThemeModeControl({
  value,
  onChange,
  labels = { light: 'Light', dark: 'Dark', system: 'System' },
}: ThemeModeControlProps) {
  return (
    <div className="inline-flex items-center rounded-lg bg-muted p-1 gap-1">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = value === mode.value;

        return (
          <button
            key={mode.value}
            type="button"
            onClick={() => onChange(mode.value)}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{labels[mode.value]}</span>
          </button>
        );
      })}
    </div>
  );
}
