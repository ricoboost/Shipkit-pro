'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: 'USER' | 'ADMIN';
}

interface AuthSession {
  user: AuthUser;
  expiresAt: Date;
}

interface UseAuthReturn {
  session: AuthSession | null;
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (name: string, email: string, password: string, referralCode?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      setSession(data.session);
    } catch (error) {
      console.error('Failed to fetch session:', error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.error) {
        return { error: data.error };
      }

      if (data.url) {
        router.push(data.url);
      }

      await fetchSession();
      return {};
    } catch {
      return { error: 'An error occurred' };
    }
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
    referralCode?: string
  ): Promise<{ error?: string }> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, referralCode }),
      });

      const data = await res.json();

      if (data.error) {
        return { error: data.error };
      }

      return {};
    } catch {
      return { error: 'An error occurred' };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      setSession(null);
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const signInWithOAuth = async (provider: string): Promise<void> => {
    try {
      const res = await fetch(`/api/auth/oauth/${provider}`);
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('OAuth error:', error);
    }
  };

  return {
    session,
    user: session?.user || null,
    loading,
    isAuthenticated: !!session,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    refresh: fetchSession,
  };
}
