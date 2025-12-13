'use client';

/**
 * Icon Picker Component
 * Select from a curated list of Lucide React icons
 */

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  // App & Brand
  Rocket,
  Zap,
  Sparkles,
  Star,
  Heart,
  Flame,
  Crown,
  Diamond,
  Gem,
  Award,
  Trophy,
  Medal,
  Target,
  Crosshair,
  // Tech & Code
  Code,
  Code2,
  Terminal,
  Braces,
  FileCode,
  Cpu,
  Server,
  Database,
  Cloud,
  Globe,
  Wifi,
  // Business
  Building,
  Building2,
  Briefcase,
  Wallet,
  CreditCard,
  DollarSign,
  TrendingUp,
  BarChart,
  PieChart,
  LineChart,
  // Communication
  MessageSquare,
  MessageCircle,
  Mail,
  Send,
  Bell,
  Megaphone,
  Radio,
  // Security
  Shield,
  ShieldCheck,
  Lock,
  Key,
  Fingerprint,
  Eye,
  // Tools
  Wrench,
  Settings,
  Cog,
  Hammer,
  Scissors,
  Paintbrush,
  Palette,
  // Nature
  Leaf,
  TreePine,
  Flower2,
  Sun,
  Moon,
  CloudSun,
  Snowflake,
  // Transport
  Car,
  Plane,
  Ship,
  Train,
  Bike,
  // People
  User,
  Users,
  UserCircle,
  PersonStanding,
  // Media
  Camera,
  Image,
  Video,
  Music,
  Headphones,
  Mic,
  // Objects
  Box,
  Package,
  Gift,
  ShoppingCart,
  ShoppingBag,
  Tag,
  Bookmark,
  // Navigation
  Home,
  Map,
  MapPin,
  Compass,
  Navigation,
  // Misc
  Coffee,
  Pizza,
  Apple,
  Cake,
  Gamepad2,
  PuzzleIcon,
  Lightbulb,
  Atom,
  FlaskConical,
  Dna,
  Activity,
  type LucideIcon,
} from 'lucide-react';

// Map of icon names to components
const iconMap: Record<string, LucideIcon> = {
  // App & Brand
  Rocket,
  Zap,
  Sparkles,
  Star,
  Heart,
  Flame,
  Crown,
  Diamond,
  Gem,
  Award,
  Trophy,
  Medal,
  Target,
  Crosshair,
  // Tech & Code
  Code,
  Code2,
  Terminal,
  Braces,
  FileCode,
  Cpu,
  Server,
  Database,
  Cloud,
  Globe,
  Wifi,
  // Business
  Building,
  Building2,
  Briefcase,
  Wallet,
  CreditCard,
  DollarSign,
  TrendingUp,
  BarChart,
  PieChart,
  LineChart,
  // Communication
  MessageSquare,
  MessageCircle,
  Mail,
  Send,
  Bell,
  Megaphone,
  Radio,
  // Security
  Shield,
  ShieldCheck,
  Lock,
  Key,
  Fingerprint,
  Eye,
  // Tools
  Wrench,
  Settings,
  Cog,
  Hammer,
  Scissors,
  Paintbrush,
  Palette,
  // Nature
  Leaf,
  TreePine,
  Flower2,
  Sun,
  Moon,
  CloudSun,
  Snowflake,
  // Transport
  Car,
  Plane,
  Ship,
  Train,
  Bike,
  // People
  User,
  Users,
  UserCircle,
  PersonStanding,
  // Media
  Camera,
  Image,
  Video,
  Music,
  Headphones,
  Mic,
  // Objects
  Box,
  Package,
  Gift,
  ShoppingCart,
  ShoppingBag,
  Tag,
  Bookmark,
  // Navigation
  Home,
  Map,
  MapPin,
  Compass,
  Navigation,
  // Misc
  Coffee,
  Pizza,
  Apple,
  Cake,
  Gamepad2,
  PuzzleIcon,
  Lightbulb,
  Atom,
  FlaskConical,
  Dna,
  Activity,
};

// Export icon names for external use
export const iconNames = Object.keys(iconMap);

// Export helper to get icon component by name
export function getIconByName(name: string): LucideIcon | null {
  return iconMap[name] || null;
}

// Render an icon by name
export function DynamicIcon({
  name,
  className,
  ...props
}: {
  name: string;
  className?: string;
  [key: string]: unknown;
}) {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon className={className} {...props} />;
}

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function IconPicker({ value, onChange, label }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = useMemo(() => {
    if (!search) return Object.keys(iconMap);
    return Object.keys(iconMap).filter((name) =>
      name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const SelectedIcon = iconMap[value] || Rocket;

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start gap-2"
          >
            <SelectedIcon className="h-4 w-4" />
            <span>{value || 'Select icon...'}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-2 border-b">
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
            />
          </div>
          <ScrollArea className="h-64">
            <div className="grid grid-cols-6 gap-1 p-2">
              {filteredIcons.map((iconName) => {
                const Icon = iconMap[iconName];
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      onChange(iconName);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      'flex items-center justify-center p-2 rounded-md hover:bg-muted transition-colors',
                      value === iconName && 'bg-primary text-primary-foreground'
                    )}
                    title={iconName}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
            {filteredIcons.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No icons found
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
