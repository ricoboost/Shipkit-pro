'use client';

/**
 * Provider Selector Component
 * Select auth, payment, and AI providers
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, Loader2, Shield, CreditCard, Cpu } from 'lucide-react';

interface AppConfig {
  id: string;
  authProvider: string;
  paymentProvider: string;
  aiProvider: string;
}

interface ProviderSelectorProps {
  config: AppConfig;
}

export function ProviderSelector({ config }: ProviderSelectorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [authProvider, setAuthProvider] = useState(config.authProvider);
  const [paymentProvider, setPaymentProvider] = useState(config.paymentProvider);
  const [aiProvider, setAiProvider] = useState(config.aiProvider);

  const hasChanges =
    authProvider !== config.authProvider ||
    paymentProvider !== config.paymentProvider ||
    aiProvider !== config.aiProvider;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authProvider, paymentProvider, aiProvider }),
      });

      if (!response.ok) throw new Error('Failed to save providers');

      router.refresh();
    } catch (error) {
      console.error('Error saving providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const providers = [
    {
      id: 'auth',
      label: 'Authentication',
      icon: Shield,
      value: authProvider,
      onChange: setAuthProvider,
      options: [
        { value: 'NEXTAUTH', label: 'NextAuth', description: 'Auth.js v5' },
        { value: 'SUPABASE', label: 'Supabase', description: 'Supabase Auth' },
        { value: 'BETTERAUTH', label: 'Better Auth', description: 'Better Auth' },
      ],
    },
    {
      id: 'payment',
      label: 'Payments',
      icon: CreditCard,
      value: paymentProvider,
      onChange: setPaymentProvider,
      options: [
        { value: 'STRIPE', label: 'Stripe', description: 'Credit cards, wallets' },
        { value: 'LEMONSQUEEZY', label: 'LemonSqueezy', description: 'MoR, global' },
        { value: 'POLAR', label: 'Polar', description: 'Open source focus' },
      ],
    },
    {
      id: 'ai',
      label: 'AI Provider',
      icon: Cpu,
      value: aiProvider,
      onChange: setAiProvider,
      options: [
        { value: 'OPENROUTER', label: 'OpenRouter', description: 'Multi-model' },
        { value: 'VERCEL', label: 'Vercel AI', description: 'Vercel AI SDK' },
      ],
    },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 md:grid-cols-3">
        {providers.map((provider) => (
          <div key={provider.id} className="space-y-2">
            <Label className="flex items-center gap-2">
              <provider.icon className="h-4 w-4" />
              {provider.label}
            </Label>
            <Select value={provider.value} onValueChange={provider.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {provider.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Provider changes may require code updates to take effect.
        </p>
        <Button type="submit" disabled={!hasChanges || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Providers
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
