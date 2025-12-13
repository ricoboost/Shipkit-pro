'use client';

/**
 * Site Settings Editor Component
 * Edit site name, icon, URL, and description
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IconPicker, DynamicIcon } from '@/components/ui/icon-picker';
import { Save, Loader2 } from 'lucide-react';

interface AppConfig {
  id: string;
  siteName: string;
  siteIcon: string;
  siteUrl: string | null;
  siteDescription: string | null;
}

interface SiteSettingsEditorProps {
  config: AppConfig;
}

export function SiteSettingsEditor({ config }: SiteSettingsEditorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [siteName, setSiteName] = useState(config.siteName);
  const [siteIcon, setSiteIcon] = useState(config.siteIcon || 'Rocket');
  const [siteUrl, setSiteUrl] = useState(config.siteUrl || '');
  const [siteDescription, setSiteDescription] = useState(config.siteDescription || '');

  const hasChanges =
    siteName !== config.siteName ||
    siteIcon !== (config.siteIcon || 'Rocket') ||
    siteUrl !== (config.siteUrl || '') ||
    siteDescription !== (config.siteDescription || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName,
          siteIcon,
          siteUrl: siteUrl || null,
          siteDescription: siteDescription || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to save settings');
      }

      router.refresh();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Preview */}
      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
        <DynamicIcon name={siteIcon} className="h-8 w-8 text-primary" />
        <span className="text-lg font-semibold">{siteName || 'Your App'}</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="siteName">Site Name</Label>
        <Input
          id="siteName"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          placeholder="My SaaS App"
        />
      </div>

      <IconPicker
        label="Site Icon"
        value={siteIcon}
        onChange={setSiteIcon}
      />

      <div className="space-y-2">
        <Label htmlFor="siteUrl">Site URL</Label>
        <Input
          id="siteUrl"
          type="url"
          value={siteUrl}
          onChange={(e) => setSiteUrl(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="siteDescription">Description</Label>
        <Textarea
          id="siteDescription"
          value={siteDescription}
          onChange={(e) => setSiteDescription(e.target.value)}
          placeholder="A brief description of your site..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={!hasChanges || isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </>
        )}
      </Button>
    </form>
  );
}
