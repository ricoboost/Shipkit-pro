/**
 * SettingsForm
 * A comprehensive settings form with sections and validation.
 * Best for: User settings, profile pages, app configuration
 */

'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Camera, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface SettingsFormProps {
  /** Initial values */
  initialValues?: {
    name?: string;
    email?: string;
    bio?: string;
    avatarUrl?: string;
    timezone?: string;
    language?: string;
    emailNotifications?: boolean;
    marketingEmails?: boolean;
  };
  /** Form submission handler */
  onSubmit?: (values: Record<string, unknown>) => Promise<void>;
  /** Additional CSS classes */
  className?: string;
}

export function SettingsForm({
  initialValues = {},
  onSubmit,
  className,
}: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [values, setValues] = useState({
    name: initialValues.name || '',
    email: initialValues.email || '',
    bio: initialValues.bio || '',
    avatarUrl: initialValues.avatarUrl || '',
    timezone: initialValues.timezone || 'UTC',
    language: initialValues.language || 'en',
    emailNotifications: initialValues.emailNotifications ?? true,
    marketingEmails: initialValues.marketingEmails ?? false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;

    setIsLoading(true);
    try {
      await onSubmit(values);
    } finally {
      setIsLoading(false);
    }
  };

  const updateValue = (key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-8', className)}>
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your personal information and profile picture.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              {values.avatarUrl && (
                <AvatarImage src={values.avatarUrl} alt={values.name} />
              )}
              <AvatarFallback className="text-2xl">
                {values.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button type="button" variant="outline" size="sm">
                <Camera className="mr-2 h-4 w-4" />
                Change avatar
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                JPG, PNG or GIF. Max 2MB.
              </p>
            </div>
          </div>

          <Separator />

          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={values.name}
              onChange={(e) => updateValue('name', e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => updateValue('email', e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {/* Bio */}
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={values.bio}
              onChange={(e) => updateValue('bio', e.target.value)}
              placeholder="Tell us about yourself"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Brief description for your profile. Max 160 characters.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Customize your app experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timezone */}
          <div className="grid gap-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={values.timezone}
              onValueChange={(value) => updateValue('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Europe/Paris">Paris</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="grid gap-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={values.language}
              onValueChange={(value) => updateValue('language', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage your notification preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your account activity.
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={values.emailNotifications}
              onCheckedChange={(checked) =>
                updateValue('emailNotifications', checked)
              }
            />
          </div>

          <Separator />

          {/* Marketing Emails */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-emails">Marketing emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about new features and special offers.
              </p>
            </div>
            <Switch
              id="marketing-emails"
              checked={values.marketingEmails}
              onCheckedChange={(checked) =>
                updateValue('marketingEmails', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  );
}

// Example usage:
// <SettingsForm
//   initialValues={{
//     name: 'John Doe',
//     email: 'john@example.com',
//     timezone: 'America/New_York',
//   }}
//   onSubmit={async (values) => {
//     console.log('Saving:', values);
//   }}
// />
