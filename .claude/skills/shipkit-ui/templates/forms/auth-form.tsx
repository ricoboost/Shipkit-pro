/**
 * AuthForm
 * A flexible authentication form supporting login and signup.
 * Best for: Login pages, signup flows, authentication modals
 */

'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Github } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface AuthFormProps {
  /** Form mode */
  mode: 'login' | 'signup';
  /** Form submission handler */
  onSubmit?: (values: { email: string; password: string; name?: string }) => Promise<void>;
  /** Social login handlers */
  onGoogleLogin?: () => void;
  onGithubLogin?: () => void;
  /** Show social login buttons */
  showSocialLogins?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function AuthForm({
  mode,
  onSubmit,
  onGoogleLogin,
  onGithubLogin,
  showSocialLogins = true,
  className,
}: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;

    setIsLoading(true);
    try {
      await onSubmit({ email, password, ...(mode === 'signup' && { name }) });
    } finally {
      setIsLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <div className={cn('w-full max-w-sm space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isLogin
            ? 'Enter your email to sign in to your account'
            : 'Enter your email below to create your account'}
        </p>
      </div>

      {/* Social Login Buttons */}
      {showSocialLogins && (onGoogleLogin || onGithubLogin) && (
        <>
          <div className="grid gap-3">
            {onGoogleLogin && (
              <Button
                type="button"
                variant="outline"
                onClick={onGoogleLogin}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            )}
            {onGithubLogin && (
              <Button
                type="button"
                variant="outline"
                onClick={onGithubLogin}
                disabled={isLoading}
              >
                <Github className="mr-2 h-4 w-4" />
                Continue with GitHub
              </Button>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
        </>
      )}

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name (signup only) */}
        {!isLogin && (
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        )}

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {isLogin && (
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <Input
            id="password"
            type="password"
            placeholder={isLogin ? '••••••••' : 'Create a password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            minLength={8}
          />
          {!isLogin && (
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLogin ? 'Sign in' : 'Create account'}
        </Button>
      </form>

      {/* Toggle Mode Link */}
      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <Link
          href={isLogin ? '/signup' : '/login'}
          className="font-medium text-primary hover:underline"
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </Link>
      </p>

      {/* Terms (signup only) */}
      {!isLogin && (
        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      )}
    </div>
  );
}

// Example usage:
// <AuthForm
//   mode="login"
//   onSubmit={async ({ email, password }) => {
//     await signIn('credentials', { email, password });
//   }}
//   onGoogleLogin={() => signIn('google')}
//   onGithubLogin={() => signIn('github')}
// />
