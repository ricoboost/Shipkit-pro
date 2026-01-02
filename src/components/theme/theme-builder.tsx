'use client';

/**
 * Visual Theme Builder
 * Customize theme colors with live preview
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  themePresets,
  applyTheme,
  saveTheme,
  getSavedTheme,
  exportThemeCSS,
  type ThemeConfig,
  type ThemeColors,
} from '@/lib/theme';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  // Parse HSL values
  const parts = value.split(' ');
  const h = parseFloat(parts[0]) || 0;
  const s = parseFloat(parts[1]) || 0;
  const l = parseFloat(parts[2]) || 0;

  const handleChange = (type: 'h' | 's' | 'l', newValue: number) => {
    const newH = type === 'h' ? newValue : h;
    const newS = type === 's' ? newValue : s;
    const newL = type === 'l' ? newValue : l;
    onChange(`${newH} ${newS}% ${newL}%`);
  };

  const previewColor = `hsl(${h}, ${s}%, ${l}%)`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <div
          className="w-8 h-8 rounded border"
          style={{ backgroundColor: previewColor }}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs w-4">H</span>
          <Slider
            value={[h]}
            max={360}
            step={1}
            onValueChange={([v]) => handleChange('h', v)}
            className="flex-1"
          />
          <span className="text-xs w-8 text-right">{Math.round(h)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs w-4">S</span>
          <Slider
            value={[s]}
            max={100}
            step={1}
            onValueChange={([v]) => handleChange('s', v)}
            className="flex-1"
          />
          <span className="text-xs w-8 text-right">{Math.round(s)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs w-4">L</span>
          <Slider
            value={[l]}
            max={100}
            step={1}
            onValueChange={([v]) => handleChange('l', v)}
            className="flex-1"
          />
          <span className="text-xs w-8 text-right">{Math.round(l)}%</span>
        </div>
      </div>
    </div>
  );
}

function ThemePreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription>See how your theme looks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
        <div className="flex gap-2">
          <Badge>Badge</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
        <div className="p-4 rounded-lg bg-muted">
          <p className="text-sm text-muted-foreground">
            This is muted text on a muted background.
          </p>
        </div>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm">Nested card content</p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

export function ThemeBuilder() {
  const [selectedPreset, setSelectedPreset] = useState('default');
  const [customTheme, setCustomTheme] = useState<ThemeConfig>(themePresets.default);
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  // Load saved theme on mount
  useEffect(() => {
    const saved = getSavedTheme();
    if (themePresets[saved]) {
      setSelectedPreset(saved);
      setCustomTheme(themePresets[saved]);
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    applyTheme(customTheme);
  }, [customTheme, mode]);

  const handlePresetSelect = (preset: string) => {
    setSelectedPreset(preset);
    setCustomTheme(themePresets[preset]);
    saveTheme(preset);
  };

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setCustomTheme((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [key]: value,
      },
    }));
  };

  const handleRadiusChange = (value: number) => {
    setCustomTheme((prev) => ({
      ...prev,
      radius: `${value}rem`,
    }));
  };

  const handleExport = () => {
    const css = exportThemeCSS(customTheme);
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme.css';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setCustomTheme(themePresets[selectedPreset]);
  };

  const colorGroups = [
    {
      title: 'Base Colors',
      colors: ['background', 'foreground', 'card', 'cardForeground'] as const,
    },
    {
      title: 'Primary & Secondary',
      colors: ['primary', 'primaryForeground', 'secondary', 'secondaryForeground'] as const,
    },
    {
      title: 'UI Elements',
      colors: ['muted', 'mutedForeground', 'accent', 'accentForeground'] as const,
    },
    {
      title: 'Feedback & Borders',
      colors: ['destructive', 'destructiveForeground', 'border', 'input', 'ring'] as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Preset Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Presets</CardTitle>
          <CardDescription>
            Choose a preset as a starting point
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(themePresets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => handlePresetSelect(key)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedPreset === key
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'hover:border-primary/50'
                }`}
              >
                <div className="flex gap-1 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: `hsl(${preset.light.primary})` }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: `hsl(${preset.dark.primary})` }}
                  />
                </div>
                <p className="text-sm font-medium">{preset.name}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Color Customization */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Customize Colors</CardTitle>
                <CardDescription>
                  Fine-tune colors for light and dark modes
                </CardDescription>
              </div>
              <Tabs value={mode} onValueChange={(v) => setMode(v as 'light' | 'dark')}>
                <TabsList>
                  <TabsTrigger value="light">Light</TabsTrigger>
                  <TabsTrigger value="dark">Dark</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
              {colorGroups.map((group) => (
                <div key={group.title}>
                  <h4 className="text-sm font-semibold mb-3">{group.title}</h4>
                  <div className="grid gap-4">
                    {group.colors.map((colorKey) => (
                      <ColorPicker
                        key={colorKey}
                        label={colorKey.replace(/([A-Z])/g, ' $1').trim()}
                        value={customTheme[mode][colorKey]}
                        onChange={(v) => handleColorChange(colorKey, v)}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Border Radius */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Border Radius</h4>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[parseFloat(customTheme.radius)]}
                    min={0}
                    max={1.5}
                    step={0.125}
                    onValueChange={([v]) => handleRadiusChange(v)}
                    className="flex-1"
                  />
                  <span className="text-sm w-16">{customTheme.radius}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="space-y-4">
          <ThemePreview />

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleExport} className="flex-1">
              Export CSS
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
