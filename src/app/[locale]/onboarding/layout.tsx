/**
 * Onboarding Layout
 * Minimal layout without header/footer for focused setup experience
 */

import { ThemeProvider } from 'next-themes';

export default function OnboardingLayout({
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
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </ThemeProvider>
  );
}
