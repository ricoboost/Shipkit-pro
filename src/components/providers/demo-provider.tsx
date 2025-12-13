'use client';

/**
 * Demo Mode Provider
 * Provides demo mode context to the app
 */

import { createContext, useContext, type ReactNode } from 'react';
import { useDemo } from '@/hooks/use-demo';
import type { DemoUser, DemoSettings } from '@/lib/demo';

interface DemoContextType {
  isDemo: boolean;
  isLoading: boolean;
  user: DemoUser | null;
  settings: DemoSettings | null;
  enable: () => void;
  disable: () => void;
  setDemoUser: (updates: Partial<DemoUser>) => DemoUser | null;
  setDemoSettings: (updates: Partial<DemoSettings>) => DemoSettings | null;
  clear: () => void;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const demo = useDemo();

  return (
    <DemoContext.Provider value={demo}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoContext() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoContext must be used within a DemoProvider');
  }
  return context;
}
