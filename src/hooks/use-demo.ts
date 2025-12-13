'use client';

/**
 * Demo Mode Hook
 * Manages local demo mode state and user data
 */

import { useState, useEffect, useCallback } from 'react';
import {
  isDemoMode,
  enableDemoMode,
  disableDemoMode,
  getDemoUser,
  updateDemoUser,
  getDemoSettings,
  updateDemoSettings,
  clearDemoData,
  type DemoUser,
  type DemoSettings,
  defaultDemoUser,
  defaultDemoSettings,
} from '@/lib/demo';

export function useDemo() {
  const [isDemo, setIsDemo] = useState(false);
  const [user, setUser] = useState<DemoUser | null>(null);
  const [settings, setSettings] = useState<DemoSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize state from localStorage
  useEffect(() => {
    setIsDemo(isDemoMode());
    setUser(getDemoUser());
    setSettings(getDemoSettings());
    setIsLoading(false);
  }, []);

  // Enable demo mode
  const enable = useCallback(() => {
    enableDemoMode();
    setIsDemo(true);
    setUser(getDemoUser() || defaultDemoUser);
    setSettings(getDemoSettings() || defaultDemoSettings);
  }, []);

  // Disable demo mode
  const disable = useCallback(() => {
    disableDemoMode();
    setIsDemo(false);
  }, []);

  // Update user
  const setDemoUser = useCallback((updates: Partial<DemoUser>) => {
    const updated = updateDemoUser(updates);
    setUser(updated);
    return updated;
  }, []);

  // Update settings
  const setDemoSettings = useCallback((updates: Partial<DemoSettings>) => {
    const updated = updateDemoSettings(updates);
    setSettings(updated);
    return updated;
  }, []);

  // Clear all demo data
  const clear = useCallback(() => {
    clearDemoData();
    setIsDemo(false);
    setUser(null);
    setSettings(null);
  }, []);

  return {
    isDemo,
    isLoading,
    user,
    settings,
    enable,
    disable,
    setDemoUser,
    setDemoSettings,
    clear,
  };
}
