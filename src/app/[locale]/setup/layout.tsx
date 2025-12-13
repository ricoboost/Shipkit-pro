/**
 * Setup Layout
 * Minimal layout for the setup wizard - no header, sidebar, or footer
 */

import { ThemeProvider } from '@/components/theme-provider';

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
