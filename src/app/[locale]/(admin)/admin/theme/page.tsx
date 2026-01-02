'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Check, Copy, Download, Palette, Sun, Moon, RotateCcw, Save,
  Loader2, AlertCircle, Sparkles
} from 'lucide-react';
import { themePresets, ThemeConfig, ThemeMode, applyTheme, exportThemeCSS } from '@/lib/theme';
import { useCustomTheme } from '@/components/theme-provider';
import { ColorPicker } from '@/components/admin/color-picker';
import { ThemeModeControl } from '@/components/admin/theme-mode-control';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function ThemeBuilderPage() {
  const t = useTranslations('admin.theme');
  const { theme: savedTheme, setTheme: setGlobalTheme, saveTheme, resetTheme, setDefaultMode, isSaving } = useCustomTheme();
  const [activePreset, setActivePreset] = useState('custom');
  const [customTheme, setCustomTheme] = useState<ThemeConfig>(savedTheme);
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [copied, setCopied] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const radiusOptionsTranslated = [
    { value: '0', label: t('radiusSharp'), preview: 'rounded-none' },
    { value: '0.3rem', label: t('radiusSubtle'), preview: 'rounded-sm' },
    { value: '0.5rem', label: t('radiusMedium'), preview: 'rounded-md' },
    { value: '0.75rem', label: t('radiusRounded'), preview: 'rounded-lg' },
    { value: '1rem', label: t('radiusFull'), preview: 'rounded-xl' },
  ];

  const colorGroupsTranslated = [
    {
      title: t('brandColors'),
      colors: [
        { key: 'primary', label: t('primary'), description: t('primaryDesc') },
        { key: 'secondary', label: t('secondary'), description: t('secondaryDesc') },
        { key: 'accent', label: t('accent'), description: t('accentDesc') },
      ],
    },
    {
      title: t('semanticColors'),
      colors: [
        { key: 'destructive', label: t('destructive'), description: t('destructiveDesc') },
        { key: 'muted', label: t('muted'), description: t('mutedDesc') },
      ],
    },
    {
      title: t('surfaceColors'),
      colors: [
        { key: 'background', label: t('background'), description: t('backgroundDesc') },
        { key: 'foreground', label: t('foreground'), description: t('foregroundDesc') },
        { key: 'card', label: t('card'), description: t('cardDesc') },
        { key: 'popover', label: t('popover'), description: t('popoverDesc') },
      ],
    },
    {
      title: t('uiColors'),
      colors: [
        { key: 'border', label: t('border'), description: t('borderDesc') },
        { key: 'input', label: t('input'), description: t('inputDesc') },
        { key: 'ring', label: t('ring'), description: t('ringDesc') },
      ],
    },
  ];

  useEffect(() => {
    // Load saved theme
    setCustomTheme(savedTheme);

    // Check system preference
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setMode(isDark ? 'dark' : 'light');
    }
  }, [savedTheme]);

  const handlePresetChange = (preset: string) => {
    setActivePreset(preset);
    const newTheme = themePresets[preset];
    setCustomTheme(newTheme);
    setGlobalTheme(newTheme);
    setHasChanges(true);
  };

  const handleRadiusChange = (value: string) => {
    const newTheme = { ...customTheme, radius: value };
    setCustomTheme(newTheme);
    setGlobalTheme(newTheme);
    setActivePreset('custom');
    setHasChanges(true);
  };

  const handleColorChange = (colorKey: string, value: string) => {
    const colors = mode === 'light' ? customTheme.light : customTheme.dark;
    const newColors = { ...colors, [colorKey]: value };

    // Also update foreground colors if changing main colors
    const foregroundKey = `${colorKey}Foreground`;
    if (colors[foregroundKey as keyof typeof colors] !== undefined) {
      // Keep existing foreground
    }

    const newTheme = {
      ...customTheme,
      [mode]: newColors,
    };
    setCustomTheme(newTheme);
    setGlobalTheme(newTheme);
    setActivePreset('custom');
    setHasChanges(true);
  };

  const handleNameChange = (name: string) => {
    const newTheme = { ...customTheme, name };
    setCustomTheme(newTheme);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await saveTheme();
      setHasChanges(false);
      toast.success(t('themeSaved'));
    } catch {
      toast.error(t('themeSaveFailed'));
    }
  };

  const handleReset = async () => {
    try {
      await resetTheme();
      setActivePreset('default');
      setHasChanges(false);
      toast.success(t('themeReset'));
    } catch {
      toast.error(t('themeResetFailed'));
    }
  };

  const handleExport = () => {
    const css = exportThemeCSS(customTheme);
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${customTheme.name.toLowerCase().replace(/\s+/g, '-')}.css`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('themeExported'));
  };

  const handleCopyCSS = () => {
    const css = exportThemeCSS(customTheme);
    navigator.clipboard.writeText(css);
    setCopied(true);
    toast.success(t('cssCopied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    document.documentElement.classList.toggle('dark');
    applyTheme(customTheme);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="icon" onClick={toggleMode}>
            {mode === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button variant="outline" onClick={handleCopyCSS}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? t('copied') : t('copy')}
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {t('export')}
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('reset')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? t('saving') : t('saveTheme')}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('unsavedChanges')}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Sidebar - Presets */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5" />
                {t('presets')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(themePresets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handlePresetChange(key)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                    activePreset === key
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-transparent hover:bg-muted'
                  )}
                >
                  <div className="flex -space-x-1">
                    <div
                      className="h-6 w-6 rounded-full border-2 border-background"
                      style={{ backgroundColor: `hsl(${preset.light.primary})` }}
                    />
                    <div
                      className="h-6 w-6 rounded-full border-2 border-background"
                      style={{ backgroundColor: `hsl(${preset.light.secondary})` }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{preset.name}</p>
                  </div>
                  {activePreset === key && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Theme Name */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t('themeInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('themeName')}</Label>
                <Input
                  value={customTheme.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="My Custom Theme"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('defaultThemeMode')}</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  {t('defaultThemeModeDesc')}
                </p>
                <ThemeModeControl
                  value={customTheme.defaultMode || 'system'}
                  onChange={(newMode: ThemeMode) => {
                    const newTheme = { ...customTheme, defaultMode: newMode };
                    setCustomTheme(newTheme);
                    setGlobalTheme(newTheme);
                    setDefaultMode(newMode);
                    setHasChanges(true);
                  }}
                  labels={{
                    light: t('light'),
                    dark: t('dark'),
                    system: t('system'),
                  }}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>{t('editingMode')}</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  {t('editingModeDesc')}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant={mode === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setMode('light');
                      document.documentElement.classList.remove('dark');
                      applyTheme(customTheme);
                    }}
                  >
                    <Sun className="h-4 w-4 mr-1" />
                    {t('light')}
                  </Button>
                  <Button
                    variant={mode === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setMode('dark');
                      document.documentElement.classList.add('dark');
                      applyTheme(customTheme);
                    }}
                  >
                    <Moon className="h-4 w-4 mr-1" />
                    {t('dark')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* Customization Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>{t('customize')}</CardTitle>
              <CardDescription>
                {t('fineTuneColors')} {mode === 'light' ? t('light') : t('dark')} {t('mode')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="colors">
                <TabsList className="mb-4">
                  <TabsTrigger value="colors">{t('colors')}</TabsTrigger>
                  <TabsTrigger value="radius">{t('borderRadius')}</TabsTrigger>
                </TabsList>

                <TabsContent value="colors" className="space-y-6">
                  {colorGroupsTranslated.map((group) => (
                    <div key={group.title} className="space-y-4">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        {group.title}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {group.colors.map(({ key, label, description }) => {
                          const colors = mode === 'light' ? customTheme.light : customTheme.dark;
                          const value = colors[key as keyof typeof colors];
                          return (
                            <div key={key} className="space-y-1">
                              <ColorPicker
                                label={label}
                                value={value}
                                onChange={(v) => handleColorChange(key, v)}
                              />
                              <p className="text-xs text-muted-foreground">{description}</p>
                            </div>
                          );
                        })}
                      </div>
                      <Separator />
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="radius" className="space-y-4">
                  <div className="space-y-4">
                    <Label>{t('borderRadius')}</Label>
                    <div className="grid grid-cols-5 gap-3">
                      {radiusOptionsTranslated.map((option) => {
                        // Normalize both values for comparison (trim whitespace)
                        const currentRadius = (customTheme.radius || '0.5rem').trim();
                        const optionValue = option.value.trim();
                        const isSelected = currentRadius === optionValue;

                        return (
                          <button
                            key={option.value}
                            onClick={() => handleRadiusChange(option.value)}
                            className={cn(
                              'relative flex flex-col items-center gap-2 p-4 rounded-lg border transition-all',
                              isSelected
                                ? 'border-primary bg-primary/5 ring-2 ring-primary'
                                : 'border-muted hover:border-primary/50'
                            )}
                          >
                            <div
                              className={cn(
                                'h-12 w-12 bg-primary',
                                option.preview
                              )}
                            />
                            <span className="text-sm font-medium">{option.label}</span>
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary absolute top-2 right-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                {t('livePreview')}
              </CardTitle>
              <CardDescription>{t('livePreviewDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Buttons */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">{t('buttons')}</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">{t('primary')}</Button>
                    <Button size="sm" variant="secondary">{t('secondary')}</Button>
                    <Button size="sm" variant="outline">Outline</Button>
                    <Button size="sm" variant="ghost">Ghost</Button>
                    <Button size="sm" variant="destructive">{t('destructive')}</Button>
                  </div>
                </div>

                {/* Badges */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">{t('badges')}</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">{t('secondary')}</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">{t('destructive')}</Badge>
                  </div>
                </div>

                {/* Inputs */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">{t('formElements')}</Label>
                  <div className="space-y-2">
                    <Input placeholder={t('textInput')} />
                    <div className="flex items-center gap-2">
                      <Switch id="preview-switch" />
                      <Label htmlFor="preview-switch" className="text-sm">{t('toggleSwitch')}</Label>
                    </div>
                  </div>
                </div>

                {/* Alert */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">{t('alerts')}</Label>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {t('alertMessage')}
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Cards */}
                <div className="space-y-3 md:col-span-2">
                  <Label className="text-sm font-medium">{t('cards')}</Label>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{t('defaultCard')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {t('defaultCardDesc')}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary text-primary-foreground">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{t('primaryCard')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm opacity-90">
                          {t('primaryCardDesc')}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{t('mutedCard')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {t('mutedCardDesc')}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
