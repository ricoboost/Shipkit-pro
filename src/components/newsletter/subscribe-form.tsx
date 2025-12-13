'use client';

/**
 * Newsletter Subscribe Form
 * Reusable subscription component
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SubscribeFormProps {
  source?: string;
  tags?: string[];
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
  className?: string;
  variant?: 'default' | 'inline' | 'compact';
}

export function SubscribeForm({
  source = 'website',
  tags = [],
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  successMessage = 'Thanks for subscribing! Check your email to confirm.',
  className = '',
  variant = 'default',
}: SubscribeFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source, tags }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setStatus('success');
      setMessage(data.isNew ? successMessage : 'You are already subscribed!');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  if (status === 'success') {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-green-600 dark:text-green-400 font-medium">{message}</p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
          disabled={status === 'loading'}
        />
        <Button type="submit" disabled={status === 'loading'} size="sm">
          {status === 'loading' ? '...' : buttonText}
        </Button>
        {status === 'error' && (
          <p className="text-destructive text-sm absolute mt-12">{message}</p>
        )}
      </form>
    );
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className={className}>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className="sm:w-64"
            disabled={status === 'loading'}
          />
          <Button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Subscribing...' : buttonText}
          </Button>
        </div>
        {status === 'error' && (
          <p className="text-destructive text-sm mt-2">{message}</p>
        )}
      </form>
    );
  }

  // Default variant
  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          disabled={status === 'loading'}
        />
        <Button type="submit" className="w-full" disabled={status === 'loading'}>
          {status === 'loading' ? 'Subscribing...' : buttonText}
        </Button>
      </div>
      {status === 'error' && (
        <p className="text-destructive text-sm mt-2 text-center">{message}</p>
      )}
      <p className="text-xs text-muted-foreground mt-3 text-center">
        No spam, unsubscribe at any time.
      </p>
    </form>
  );
}
