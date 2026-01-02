'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeConfig, ThemeMode, themePresets, applyTheme } from '@/lib/theme';
import { useTheme } from 'next-themes';
import { getServerTheme } from '@/components/theme/server-theme-loader';

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  saveTheme: () => Promise<void>;
  resetTheme: () => Promise<void>;
  setDefaultMode: (mode: ThemeMode) => void;
  isLoading: boolean;
  isSaving: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  // Always start with default theme to avoid hydration mismatch
  // The useEffect below will update to server-injected theme after mount
  // CSS variables are already correct from ServerThemeLoader
  const [theme, setThemeState] = useState<ThemeConfig>(themePresets.default);
  const [isLoading, _setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { resolvedTheme, setTheme: setNextTheme } = useTheme();
  const themeRef = useRef<ThemeConfig>(themePresets.default);
  const pathname = usePathname();

  // Initialize theme from server-injected data on mount
  useEffect(() => {
    const serverTheme = getServerTheme();
    if (serverTheme) {
      setThemeState(serverTheme);
      themeRef.current = serverTheme;
      // Re-apply to ensure CSS variables are set correctly after hydration
      applyTheme(serverTheme);
      // Apply default mode if set
      if (serverTheme.defaultMode) {
        setNextTheme(serverTheme.defaultMode);
      }
    }
  }, [setNextTheme]);

  // Re-apply theme when dark/light mode changes
  useEffect(() => {
    if (!isLoading && themeRef.current) {
      applyTheme(themeRef.current);
    }
  }, [resolvedTheme, isLoading]);

  // Re-apply theme when pathname changes (e.g., language switch)
  // This ensures theme stays consistent during client-side navigation
  useEffect(() => {
    // Small delay to let the DOM update, then re-apply our saved theme
    const timer = setTimeout(() => {
      if (themeRef.current) {
        applyTheme(themeRef.current);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const setTheme = useCallback((newTheme: ThemeConfig) => {
    setThemeState(newTheme);
    themeRef.current = newTheme;
    applyTheme(newTheme);
  }, []);

  const saveTheme = useCallback(async () => {
    setIsSaving(true);
    try {
      // Use themeRef.current to ensure we save the latest theme state
      const currentTheme = themeRef.current;
      const res = await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: currentTheme }),
      });
      if (!res.ok) {
        throw new Error('Failed to save theme');
      }
      // Confirm saved theme by updating state with API response
      const data = await res.json();
      if (data.theme) {
        setThemeState(data.theme);
        themeRef.current = data.theme;
      }
    } finally {
      setIsSaving(false);
    }
  }, []);

  const resetTheme = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/theme', {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        setThemeState(data.theme);
        themeRef.current = data.theme;
        applyTheme(data.theme);
        // Reset to system theme mode
        setNextTheme('system');
      }
    } finally {
      setIsSaving(false);
    }
  }, [setNextTheme]);

  const setDefaultMode = useCallback((mode: ThemeMode) => {
    // Update the theme config with the new default mode
    const newTheme = { ...themeRef.current, defaultMode: mode };
    setThemeState(newTheme);
    themeRef.current = newTheme;
    // Apply the mode immediately
    setNextTheme(mode);
  }, [setNextTheme]);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, saveTheme, resetTheme, setDefaultMode, isLoading, isSaving }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useCustomTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider');
  }
  return context;
}
