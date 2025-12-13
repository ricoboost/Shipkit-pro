/**
 * Server Theme Loader
 * Loads theme from database and injects CSS variables before hydration
 * This prevents flash of default theme on page load
 *
 * SECURITY: Validates theme schema before injecting into DOM
 */

import { db } from '@/lib/db';
import { themePresets, ThemeConfig } from '@/lib/theme';

// Convert camelCase to kebab-case
function kebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * SECURITY: Validate CSS value to prevent injection
 * Only allows safe CSS color values and numbers
 */
function isValidCSSValue(value: unknown): boolean {
  if (typeof value !== 'string') return false;

  // Block anything with potential XSS patterns first
  if (/<|>|javascript:|expression\(|url\(/i.test(value)) return false;

  // Allow HSL values like "210 40% 98%" or "221.2 83.2% 53.3%" (with decimals)
  if (/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/.test(value)) return true;

  // Allow hex colors
  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) return true;

  // Allow numbers with units for radius (including 0 without units)
  if (/^\d+(\.\d+)?(rem|px|em|%)?$/.test(value)) return true;

  // Allow rgb/rgba/hsl/hsla function syntax
  if (/^(rgb|rgba|hsl|hsla)\([^)]+\)$/.test(value)) return true;

  return false;
}

/**
 * SECURITY: Validate entire theme object
 */
function validateTheme(theme: unknown): theme is ThemeConfig {
  if (!theme || typeof theme !== 'object') return false;

  const t = theme as Record<string, unknown>;

  // Check required properties
  if (!t.light || typeof t.light !== 'object') return false;
  if (!t.dark || typeof t.dark !== 'object') return false;
  if (typeof t.radius !== 'string' || !isValidCSSValue(t.radius)) return false;

  // Validate all color values
  for (const mode of ['light', 'dark'] as const) {
    const colors = t[mode] as Record<string, unknown>;
    for (const [key, value] of Object.entries(colors)) {
      if (!isValidCSSValue(value)) {
        console.warn(`Invalid theme value for ${mode}.${key}: ${value}`);
        return false;
      }
    }
  }

  return true;
}

// Generate CSS variables from theme config
function generateThemeCSSVars(theme: ThemeConfig): string {
  const lightVars = Object.entries(theme.light)
    .map(([key, value]) => `--${kebabCase(key)}: ${value};`)
    .join(' ');

  const darkVars = Object.entries(theme.dark)
    .map(([key, value]) => `--${kebabCase(key)}: ${value};`)
    .join(' ');

  return `:root { ${lightVars} --radius: ${theme.radius}; } .dark { ${darkVars} }`;
}

async function getThemeFromDB(): Promise<ThemeConfig> {
  try {
    const config = await db.appConfig.findUnique({
      where: { id: 'default' },
      select: { theme: true },
    });

    // SECURITY: Validate theme before using
    if (config?.theme && validateTheme(config.theme)) {
      return config.theme;
    }
  } catch (error) {
    console.error('Failed to load theme from database:', error);
  }

  return themePresets.default;
}

export async function ServerThemeLoader() {
  const theme = await getThemeFromDB();
  const css = generateThemeCSSVars(theme);

  return (
    <>
      {/* Inject theme CSS before any content renders */}
      <style
        id="server-theme"
        dangerouslySetInnerHTML={{ __html: css }}
      />
      {/* Also pass theme data to client for hydration */}
      <script
        id="theme-data"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(theme) }}
      />
    </>
  );
}

// Helper to get theme on client from server-injected data
export function getServerTheme(): ThemeConfig | null {
  if (typeof document === 'undefined') return null;

  const themeDataEl = document.getElementById('theme-data');
  if (!themeDataEl) return null;

  try {
    return JSON.parse(themeDataEl.textContent || '');
  } catch {
    return null;
  }
}
