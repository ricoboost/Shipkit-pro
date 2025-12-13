'use client';

import { useState, useCallback, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: string; // HSL format: "H S% L%"
  onChange: (value: string) => void;
  label?: string;
}

function parseHSL(hsl: string): { h: number; s: number; l: number } {
  const parts = hsl.split(' ');
  return {
    h: parseFloat(parts[0]) || 0,
    s: parseFloat(parts[1]) || 0,
    l: parseFloat(parts[2]) || 0,
  };
}

function formatHSL(h: number, s: number, l: number): string {
  return `${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}%`;
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const { h, s, l } = parseHSL(value);
  const hexColor = hslToHex(h, s, l);

  const handleHueChange = useCallback((values: number[]) => {
    onChange(formatHSL(values[0], s, l));
  }, [s, l, onChange]);

  const handleSaturationChange = useCallback((values: number[]) => {
    onChange(formatHSL(h, values[0], l));
  }, [h, l, onChange]);

  const handleLightnessChange = useCallback((values: number[]) => {
    onChange(formatHSL(h, s, values[0]));
  }, [h, s, onChange]);

  const handleHexChange = useCallback((hex: string) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      const { h, s, l } = hexToHSL(hex);
      onChange(formatHSL(h, s, l));
    }
  }, [onChange]);

  // Common color swatches
  const swatches = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#000000', '#6b7280', '#ffffff',
  ];

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-10"
          >
            <div
              className="h-5 w-5 rounded border shrink-0"
              style={{ backgroundColor: `hsl(${value})` }}
            />
            <span className="font-mono text-xs truncate">{value}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            {/* Color Preview */}
            <div
              className="h-24 rounded-lg border"
              style={{ backgroundColor: `hsl(${value})` }}
            />

            {/* Swatches */}
            <div className="grid grid-cols-10 gap-1">
              {swatches.map((swatch) => (
                <button
                  key={swatch}
                  className={cn(
                    'h-6 w-6 rounded border transition-transform hover:scale-110',
                    hexColor.toLowerCase() === swatch.toLowerCase() && 'ring-2 ring-primary ring-offset-2'
                  )}
                  style={{ backgroundColor: swatch }}
                  onClick={() => handleHexChange(swatch)}
                />
              ))}
            </div>

            {/* Hue Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Hue</Label>
                <span className="text-xs text-muted-foreground">{h.toFixed(0)}°</span>
              </div>
              <div
                className="h-3 rounded-full"
                style={{
                  background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                }}
              >
                <Slider
                  value={[h]}
                  min={0}
                  max={360}
                  step={1}
                  onValueChange={handleHueChange}
                  className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                />
              </div>
            </div>

            {/* Saturation Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Saturation</Label>
                <span className="text-xs text-muted-foreground">{s.toFixed(0)}%</span>
              </div>
              <div
                className="h-3 rounded-full"
                style={{
                  background: `linear-gradient(to right, hsl(${h}, 0%, ${l}%), hsl(${h}, 100%, ${l}%))`,
                }}
              >
                <Slider
                  value={[s]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleSaturationChange}
                  className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                />
              </div>
            </div>

            {/* Lightness Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Lightness</Label>
                <span className="text-xs text-muted-foreground">{l.toFixed(0)}%</span>
              </div>
              <div
                className="h-3 rounded-full"
                style={{
                  background: `linear-gradient(to right, hsl(${h}, ${s}%, 0%), hsl(${h}, ${s}%, 50%), hsl(${h}, ${s}%, 100%))`,
                }}
              >
                <Slider
                  value={[l]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleLightnessChange}
                  className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                />
              </div>
            </div>

            {/* Hex Input */}
            <div className="flex gap-2">
              <Input
                value={hexColor}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder="#000000"
                className="font-mono text-sm"
              />
              <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="H S% L%"
                className="font-mono text-sm"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
