/**
 * Demo Mode
 * Allows local development without a database
 * User data is stored in localStorage
 */

export const DEMO_MODE_KEY = 'shipkit-demo-mode';
export const DEMO_USER_KEY = 'shipkit-demo-user';
export const DEMO_SETTINGS_KEY = 'shipkit-demo-settings';

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface DemoSettings {
  theme: {
    primaryColor: string;
    borderRadius: string;
    mode: 'light' | 'dark' | 'system';
  };
  onboardingComplete: boolean;
  credits: number;
}

export const defaultDemoUser: DemoUser = {
  id: 'demo-user-local',
  email: 'demo@shipkit.local',
  name: 'Demo User',
  image: null,
  role: 'ADMIN',
  createdAt: new Date().toISOString(),
};

export const defaultDemoSettings: DemoSettings = {
  theme: {
    primaryColor: '#3b82f6',
    borderRadius: '0.5rem',
    mode: 'system',
  },
  onboardingComplete: false,
  credits: 1000,
};

/**
 * Check if demo mode is enabled
 */
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DEMO_MODE_KEY) === 'true';
}

/**
 * Enable demo mode
 */
export function enableDemoMode(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEMO_MODE_KEY, 'true');
  // Initialize demo user if not exists
  if (!localStorage.getItem(DEMO_USER_KEY)) {
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(defaultDemoUser));
  }
  if (!localStorage.getItem(DEMO_SETTINGS_KEY)) {
    localStorage.setItem(DEMO_SETTINGS_KEY, JSON.stringify(defaultDemoSettings));
  }
}

/**
 * Disable demo mode
 */
export function disableDemoMode(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DEMO_MODE_KEY);
}

/**
 * Get demo user
 */
export function getDemoUser(): DemoUser | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(DEMO_USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Update demo user
 */
export function updateDemoUser(updates: Partial<DemoUser>): DemoUser | null {
  if (typeof window === 'undefined') return null;
  const current = getDemoUser() || defaultDemoUser;
  const updated = { ...current, ...updates };
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Get demo settings
 */
export function getDemoSettings(): DemoSettings | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(DEMO_SETTINGS_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Update demo settings
 */
export function updateDemoSettings(updates: Partial<DemoSettings>): DemoSettings | null {
  if (typeof window === 'undefined') return null;
  const current = getDemoSettings() || defaultDemoSettings;
  const updated = { ...current, ...updates };
  localStorage.setItem(DEMO_SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Clear all demo data
 */
export function clearDemoData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DEMO_MODE_KEY);
  localStorage.removeItem(DEMO_USER_KEY);
  localStorage.removeItem(DEMO_SETTINGS_KEY);
}
