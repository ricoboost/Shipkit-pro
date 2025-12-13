'use client';

/**
 * Site Settings Context
 * Provides app-wide access to site name, icon, and other settings
 */

import { createContext, useContext, ReactNode } from 'react';

export interface SiteSettings {
  siteName: string;
  siteIcon: string;
  siteUrl: string | null;
  siteDescription: string | null;
}

const defaultSettings: SiteSettings = {
  siteName: 'ShipKit',
  siteIcon: 'Rocket',
  siteUrl: null,
  siteDescription: null,
};

const SiteSettingsContext = createContext<SiteSettings>(defaultSettings);

interface SiteSettingsProviderProps {
  children: ReactNode;
  settings: Partial<SiteSettings>;
}

export function SiteSettingsProvider({
  children,
  settings,
}: SiteSettingsProviderProps) {
  const value: SiteSettings = {
    ...defaultSettings,
    ...settings,
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}
