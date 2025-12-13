/**
 * Theme Settings Page
 * Visual theme customization interface
 */

import { ThemeBuilder } from '@/components/theme/theme-builder';

export const metadata = {
  title: 'Theme Settings',
  description: 'Customize your application theme',
};

export default function ThemeSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Theme Settings</h1>
        <p className="text-muted-foreground">
          Customize the look and feel of your application
        </p>
      </div>

      <ThemeBuilder />
    </div>
  );
}
